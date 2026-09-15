const express = require('express');
const app = express();

const UP = 'https://api.sensenova.cn/v1/chat/completions';
const DK = 'sk-2Xb5GXQl1uwycaVBSOYcKYRCoBknrYTT';

app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.post(/\/chat\/completions|\/completions/, async (req, res) => {
  const payload = req.body || {};
  let key = DK;
  const a = req.headers.authorization || '';
  const m = a.match(/Bearer\s+(.+)/i);
  if (m) key = m[1].trim();
  const isStream = !!payload.stream;
  try {
    const upRes = await fetch(UP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
        'Accept': isStream ? 'text/event-stream' : 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!isStream) {
      const t = await upRes.text();
      res.status(upRes.status);
      res.setHeader('Content-Type', upRes.headers.get('Content-Type') || 'application/json');
      res.send(t);
      return;
    }
    res.status(upRes.status);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders();
    const reader = upRes.body.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(dec.decode(value, { stream: true }));
    }
    res.end();
  } catch (e) {
    res.status(502).json({ error: { message: 'upstream error: ' + e.message } });
  }
});

app.use((req, res) => res.status(404).json({ error: { message: 'not found' } }));

module.exports = app;
