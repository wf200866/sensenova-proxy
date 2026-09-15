export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    const up = 'https://api.sensenova.cn/v1/chat/completions';
    const dk = 'sk-2Xb5GXQl1uwycaVBSOYcKYRCoBknrYTT';
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: { message: 'bad json' } }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }
    let key = dk;
    const a = request.headers.get('Authorization') || '';
    const m = a.match(/Bearer\s+(.+)/i);
    if (m) key = m[1].trim();
    const isStream = !!payload.stream;
    const resp = await fetch(up, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
        'Accept': isStream ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!isStream) {
      const t = await resp.text();
      return new Response(t, {
        status: resp.status,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }
    return new Response(resp.body, {
      status: resp.status,
      headers: {
        ...cors,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
