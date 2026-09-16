export default {
  async fetch(request) {
    const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
    const url = new URL(request.url);
    let st = globalThis.__st;
    if (!st) st = globalThis.__st = { t: 0, o: 0, f: 0, log: [] };
    if (url.pathname === '/' || url.pathname.includes('stats')) {
      const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Panel</title><style>body{font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:20px}h1{color:#38bdf8}.cards{display:flex;gap:12px}.card{background:#1e293b;border-radius:12px;padding:16px;text-align:center;flex:1}.card b{display:block;font-size:28px;color:#38bdf8}.card span{font-size:12px;color:#94a3b8}</style></head><body><h1>SenseNova Panel</h1><div class="cards"><div class="card"><b>' + st.t + '</b><span>Total</span></div><div class="card"><b>' + st.o + '</b><span>OK</span></div><div class="card"><b>' + st.f + '</b><span>Fail</span></div></div></body></html>';
      return new Response(html, { headers: { ...H, 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (url.pathname.includes('models')) {
      const M = ['sensenova-6.8-flash-lite','sensenova-6.7-flash-lite','deepseek-v4-flash','deepseek-v4-pro','glm-5.2','kimi-k3'];
      const D = M.map(id => ({ id: id, object: 'model' }));
      return new Response(JSON.stringify({ object: 'list', data: D }), { headers: { ...H, 'Content-Type': 'application/json' } });
    }
    let body;
    try { body = await request.json(); } catch (e) { return new Response('{}', { status: 400 }); }
    const K = ['sk-OKOqREFykeXMTiW11fJDG77mxV7ESfq7','sk-YG7nPhk2TepEHIaIcMWYZ6jBQyhGXoqr'];
    const s = JSON.stringify(body);
    st.t++;
    let lastErr = '';
    for (let i = 0; i < K.length; i++) {
      try {
        const x = await fetch('https://token.sensenova.cn/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + K[i] }, body: s });
        const t = await x.text();
        if (x.status >= 200 && x.status < 300) { st.o++; return new Response(t, { status: x.status, headers: { ...H, 'Content-Type': 'application/json' } }); }
        lastErr = 'HTTP' + x.status + ':' + t.slice(0, 60);
      } catch (e) { lastErr = e.message; }
    }
    st.f++;
    return new Response(JSON.stringify({ error: { message: lastErr } }), { status: 502, headers: { ...H, 'Content-Type': 'application/json' } });
  }
};
