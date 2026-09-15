export default {
  async fetch(request) {
    const H = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': '*'
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: H });
    }
    const url = new URL(request.url);
    if (url.pathname.includes('models')) {
      const M = ['sensenova-6.8-flash-lite','sensenova-6.7-flash-lite','deepseek-v4-flash','deepseek-v4-pro','glm-5.2','kimi-k3'];
      const D = [];
      for (let i = 0; i < M.length; i++) D.push({ id: M[i], object: 'model' });
      return new Response(JSON.stringify({ object: 'list', data: D }), { headers: { ...H, 'Content-Type': 'application/json' } });
    }
    let body;
    try { body = await request.json(); } catch (e) {
      return new Response(JSON.stringify({ error: { message: 'bad' } }), { status: 400, headers: { ...H, 'Content-Type': 'application/json' } });
    }
    const keys = ['sk-OKOqREFykeXMTiW11fJDG77mxV7ESfq7','sk-YG7nPhk2TepEHIaIcMWYZ6jBQyhGXoqr'];
    let out = ''; let status = 502;
    for (let i = 0; i < keys.length; i++) {
      try {
        const r = await fetch('https://token.sensenova.cn/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keys[i] },
          body: JSON.stringify(body)
        });
        out = await r.text(); status = r.status;
        if (r.status >= 200 && r.status < 300) break;
      } catch (e) { out = 'err:' + e.message; }
    }
    return new Response(out, { status: status, headers: { ...H, 'Content-Type': 'application/json' } });
  }
};
