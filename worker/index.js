const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/season\/(.+)$/);
    if (!match) {
      return new Response('Not found', { status: 404, headers: CORS });
    }

    const code = match[1];

    if (request.method === 'GET') {
      const value = await env.SEASONS.get(code);
      if (value === null) {
        return new Response('Not found', { status: 404, headers: CORS });
      }
      return new Response(value, {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'PUT') {
      const body = await request.text();
      await env.SEASONS.put(code, body);
      return new Response('OK', { status: 200, headers: CORS });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};
