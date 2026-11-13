// Vercel / Node.js Serverless Function: Hardened Client Logging Gateway
const rateLimitMap = new Map();

function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  let record = rateLimitMap.get(key);
  if (!record || now - record.resetTime > windowMs) {
    record = { count: 1, resetTime: now };
    rateLimitMap.set(key, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  record.count++;
  if (record.count > maxRequests) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.resetTime + windowMs - now) / 1000) };
  }
  return { allowed: true, remaining: maxRequests - record.count };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = req.socket?.remoteAddress || req.headers?.['x-forwarded-for'] || '127.0.0.1';
  const rate = checkRateLimit(`log_${clientIp}`, 10, 60000);
  if (!rate.allowed) {
    res.setHeader('Retry-After', rate.retryAfter);
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  try {
    let bodyStr = '';
    if (typeof req.body === 'string') {
      bodyStr = req.body;
    } else if (req.body && typeof req.body === 'object') {
      bodyStr = JSON.stringify(req.body);
    }

    if (bodyStr.length > 2048) {
      return res.status(413).json({ error: 'Payload exceeds 2KB limit' });
    }

    return res.status(200).json({ status: 'ok' });
  } catch {
    return res.status(500).json({ error: 'Failed to process log' });
  }
}

