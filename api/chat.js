module.exports = async function handler(req, res) {
  const UP = 'https://api.sensenova.cn/v1/chat/completions';
  const DK = 'sk-2Xb5GXQl1uwycaVBSOYcKYRCoBknrYTT';
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  let payload;
  try {
    payload = (typeof req.body === 'string') ? JSON.parse(req.body) : (req.body || {});
  } catch (e) { res.status(400).json({ error: { message: 'bad json' } }); return; }
  let key = DK;
  const a = req.headers.authorization || '';
  const m = a.match(/Bearer\s+(.+)/i);
  if (m) key = m[1].trim();
  const isStream = !!payload.stream;
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
};