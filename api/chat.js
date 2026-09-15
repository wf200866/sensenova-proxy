export default async function handler(req, res) {
  const UPSTREAM = 'https://api.sensenova.cn/v1/chat/completions';
  const DEFAULT_KEY = 'sk-2Xb5GXQl1uwycaVBSOYcKYRCoBknrYTT';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  let payload;
  try { payload = JSON.parse(req.body || '{}'); } catch (e) { res.status(400).json({ error: { message: 'bad json' } }); return; }

  let key = DEFAULT_KEY;
  const auth = req.headers.authorization || '';
  const m = auth.match(/Bearer\s+(.+)/i);
  if (m) key = m[1].trim();

  const isStream = !!payload.stream;
  const upRes = await fetch(UPSTREAM, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
      'Accept': isStream ? 'text/event-stream' : 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!isStream) {
    const text = await upRes.text();
    res.status(upRes.status);
    res.setHeader('Content-Type', upRes.headers.get('Content-Type') || 'application/json');
    res.send(text);
    return;
  }

  res.status(upRes.status);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();
  const reader = upRes.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(decoder.decode(value, { stream: true }));
  }
  res.end();
}
