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

      if (body.length > 1_000_000) {
        return new Response('Payload too large', { status: 413, headers: CORS });
      }

      let data;
      try {
        data = JSON.parse(body);
      } catch {
        return new Response('Invalid JSON', { status: 400, headers: CORS });
      }

      const invalid = (msg) => new Response(`Invalid data: ${msg}`, { status: 400, headers: CORS });

      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return invalid('root must be an object');
      }

      const { players, seasonHistory, games, formation } = data;

      if (!Array.isArray(players)) return invalid('players must be an array');
      if (players.length > 50) return invalid('too many players');
      for (const p of players) {
        if (typeof p?.id !== 'string' || typeof p?.name !== 'string') {
          return invalid('each player must have string id and name');
        }
      }

      if (typeof seasonHistory !== 'object' || seasonHistory === null || Array.isArray(seasonHistory)) {
        return invalid('seasonHistory must be an object');
      }

      if (!Array.isArray(games)) return invalid('games must be an array');
      if (games.length > 200) return invalid('too many games');
      for (const g of games) {
        if (typeof g?.id !== 'string' || typeof g?.date !== 'string') {
          return invalid('each game must have string id and date');
        }
      }

      if (typeof formation !== 'string') return invalid('formation must be a string');

      await env.SEASONS.put(code, body);
      return new Response('OK', { status: 200, headers: CORS });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};
