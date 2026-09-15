interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

const PLAN_ID = /^[A-Za-z0-9]{8,32}$/;
const MAX_BODY_BYTES = 256 * 1024;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag',
};

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
      ...extra,
    },
  });

const error = (message: string, status: number) => json({ error: message }, status);

interface PlanRow {
  data: string;
  updated_at: number;
}

async function getPlan(env: Env, id: string, request: Request): Promise<Response> {
  const row = await env.DB.prepare('SELECT data, updated_at FROM plans WHERE id = ?')
    .bind(id)
    .first<PlanRow>();
  if (!row) return error('Plan not found', 404);

  const etag = `"${row.updated_at}"`;
  if (request.headers.get('If-None-Match') === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag, 'Cache-Control': 'no-store', ...CORS_HEADERS } });
  }
  return json({ data: JSON.parse(row.data), updatedAt: row.updated_at }, 200, { ETag: etag });
}

async function putPlan(env: Env, id: string, request: Request): Promise<Response> {
  const length = Number(request.headers.get('Content-Length') ?? 0);
  if (length > MAX_BODY_BYTES) return error('Plan too large', 413);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return error('Plan too large', 413);

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return error('Body must be JSON', 400);
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as { projects?: unknown }).projects) ||
    !Array.isArray((data as { monthCapacities?: unknown }).monthCapacities)
  ) {
    return error('Body must be a plan object', 400);
  }

  const updatedAt = Date.now();
  await env.DB.prepare(
    'INSERT INTO plans (id, data, updated_at) VALUES (?1, ?2, ?3) ' +
      'ON CONFLICT(id) DO UPDATE SET data = ?2, updated_at = ?3'
  )
    .bind(id, JSON.stringify(data), updatedAt)
    .run();

  return json({ updatedAt }, 200, { ETag: `"${updatedAt}"` });
}

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const match = url.pathname.match(/^\/api\/plans\/([^/]+)$/);
  if (!match) return error('Not found', 404);

  const id = match[1];
  if (!PLAN_ID.test(id)) return error('Invalid plan id', 400);

  switch (request.method) {
    case 'GET':
      return getPlan(env, id, request);
    case 'PUT':
    case 'POST':
      return putPlan(env, id, request);
    default:
      return error('Method not allowed', 405);
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        console.error('API error', err);
        return error('Internal error', 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
