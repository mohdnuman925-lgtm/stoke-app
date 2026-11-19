import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname);

// ---------------------------------------------------------------------------
// 1. ENVIRONMENT CONFIGURATION LOADING (Server-Side Only)
// ---------------------------------------------------------------------------
const envLocalPath = path.join(ROOT, '.env.local');
const envPath = path.join(ROOT, '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

if (!process.env.GEMINI_API_KEY && typeof process.loadEnvFile === 'function') {
  try {
    if (fs.existsSync(envLocalPath)) process.loadEnvFile(envLocalPath);
    else if (fs.existsSync(envPath)) process.loadEnvFile(envPath);
  } catch {}
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8085;

// ---------------------------------------------------------------------------
// 2. SAFE STARTUP VALIDATION (Never exposes the secret key)
// ---------------------------------------------------------------------------
const activeKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
const hasGeminiKey = Boolean(activeKey && activeKey.length > 8 && !activeKey.includes('your_gemini_api_key'));

console.log('============================================================');
console.log(' STOKE FITNESS APP - HARDENED PRODUCTION SERVER');
console.log('============================================================');
if (hasGeminiKey) {
  console.log(` [STARTUP CHECK] GEMINI_API_KEY: Configured (${activeKey.length} chars, server-only)`);
  console.log(' [STARTUP CHECK] Vision AI Endpoint: READY & PROTECTED');
} else {
  console.warn(' [STARTUP CHECK] GEMINI_API_KEY: Missing or placeholder detected!');
  console.warn('                  Please configure GEMINI_API_KEY in .env.local');
}
console.log('============================================================');

// Import API handlers
import analyzeMealHandler from './api/analyze-meal.js';
import visionStatusHandler from './api/vision/status.js';
import coachHandler from './api/coach.js';
import nutritionHandler from './api/nutrition.js';

// ---------------------------------------------------------------------------
// 3. SECURITY & MIME POLICY
// ---------------------------------------------------------------------------
const ALLOWED_STATIC_EXTS = new Set([
  '.html', '.htm', '.js', '.mjs', '.css',
  '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.mp4', '.ico', '.woff2', '.webmanifest'
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm':  'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.mp4':  'video/mp4',
  '.ico':  'image/x-icon',
  '.woff2': 'font/woff2'
};

// Rate limiter for logging & requests
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

// Clean up stale rate limits every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now - val.resetTime > 120000) rateLimitMap.delete(key);
  }
}, 300000);

// Helper: Wrap req/res for Vercel/Express-style handler compatibility
function createServerlessAdapter(req, res) {
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const clientIp = req.socket.remoteAddress || '127.0.0.1';
    const origin = req.headers.origin || '';

    // Hardened CORS: allow valid localhost and tunnel origins
    if (origin && (/^https?:\/\/localhost(:\d+)?$/.test(origin) ||
                   /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
                   /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=(), vibration=(self)');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;");

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    const rawUrl = req.url.split('?')[0];

    // -----------------------------------------------------------------------
    // ROUTE: /api/vision/status
    // -----------------------------------------------------------------------
    if (rawUrl === '/api/vision/status' || rawUrl === '/api/vision/status.js') {
      createServerlessAdapter(req, res);
      return visionStatusHandler(req, res);
    }

    // -----------------------------------------------------------------------
    // ROUTE: /api/analyze-meal
    // -----------------------------------------------------------------------
    if (rawUrl === '/api/analyze-meal' || rawUrl === '/api/analyze-meal.js') {
      createServerlessAdapter(req, res);

      // Max 6MB body limit for base64 food images
      let bodyData = '';
      let bodyTooLarge = false;

      req.on('data', chunk => {
        if (bodyTooLarge) return;
        bodyData += chunk;
        if (bodyData.length > 6 * 1024 * 1024) {
          bodyTooLarge = true;
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Image payload exceeds 6MB size limit.' }));
          if (req.pause) req.pause();
        }
      });

      req.on('end', async () => {
        if (bodyTooLarge) return;
        try {
          req.body = bodyData ? JSON.parse(bodyData) : {};
        } catch {
          req.body = {};
        }
        await analyzeMealHandler(req, res);
      });
      return;
    }

    // -----------------------------------------------------------------------
    // ROUTE: /api/nutrition (Food Nutrition Lookup — GET ?q=food+name)
    // -----------------------------------------------------------------------
    if (rawUrl === '/api/nutrition') {
      createServerlessAdapter(req, res);
      // Parse query string from req.url
      req.url = req.url; // keep full URL with query string for handler
      return nutritionHandler(req, res);
    }

    // -----------------------------------------------------------------------
    // ROUTE: /api/coach (ChatGPT-Style AI Conversational Coach Gateway)
    // -----------------------------------------------------------------------
    if (rawUrl === '/api/coach' || rawUrl === '/api/coach.js') {
      createServerlessAdapter(req, res);

      let bodyData = '';
      let bodyTooLarge = false;

      req.on('data', chunk => {
        if (bodyTooLarge) return;
        bodyData += chunk;
        if (bodyData.length > 512 * 1024) {
          bodyTooLarge = true;
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Payload exceeds size limit.' }));
          if (req.pause) req.pause();
        }
      });

      req.on('end', async () => {
        if (bodyTooLarge) return;
        try {
          req.body = bodyData ? JSON.parse(bodyData) : {};
        } catch {
          req.body = {};
        }
        await coachHandler(req, res);
      });
      return;
    }

    // -----------------------------------------------------------------------
    // ROUTE: /api/log (Hardened Error Logging Endpoint)
    // -----------------------------------------------------------------------
    if (rawUrl === '/api/log') {
      const rate = checkRateLimit(`log_${clientIp}`, 10, 60000);
      if (!rate.allowed) {
        res.statusCode = 429;
        res.setHeader('Retry-After', rate.retryAfter);
        res.end('Rate limit exceeded');
        return;
      }

      let logData = '';
      let tooLarge = false;

      req.on('data', chunk => {
        if (tooLarge) return;
        logData += chunk;
        if (logData.length > 2048) {
          tooLarge = true;
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Payload exceeds 2KB limit' }));
          if (req.pause) req.pause();
        }
      });

      req.on('end', () => {
        if (tooLarge) return;
        try {
          // Sanitize log entry (single-line, truncated, strip non-printable chars)
          const sanitized = logData.replace(/[\r\n\x00-\x1F]/g, ' ').slice(0, 500);
          const timestamp = new Date().toISOString();
          fs.appendFileSync(path.join(ROOT, 'browser_errors.txt'), `[${timestamp}] ${sanitized}\n`);
        } catch {}
        res.statusCode = 200;
        res.end();
      });
      return;
    }

    // -----------------------------------------------------------------------
    // STATIC ASSETS & SPA ROUTING (CRIT-01 Remediation: Block Secrets & Dotfiles)
    // -----------------------------------------------------------------------
    let relPath = rawUrl.replace(/^\/+/, '');
    if (!relPath || relPath === '') relPath = 'index.html';

    // 1. Strict Security Filter: Immediately block any dotfile or hidden directory traversal
    const pathSegments = relPath.split(/[/\\]/);
    const hasDotfileSegment = pathSegments.some(seg => seg.startsWith('.'));
    if (hasDotfileSegment) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 Not Found');
      return;
    }

    // 2. Strict Security Filter: Block sensitive extensions, scripts, and internal files
    const ext = path.extname(relPath).toLowerCase();
    const isManifest = relPath.toLowerCase() === 'manifest.json';
    const isAllowedExt = ALLOWED_STATIC_EXTS.has(ext) || isManifest;

    if (!isAllowedExt && ext !== '') {
      // Reject blocked file extensions (.ps1, .sql, .exe, .cs, .mjs, .log, .txt, etc.)
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 Not Found');
      return;
    }

    let fullPath = path.resolve(ROOT, relPath);
    if (!fullPath.startsWith(ROOT)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 Not Found');
      return;
    }

    fs.stat(fullPath, (err, stats) => {
      // SPA Fallback: If not an exact allowed static file, serve index.html for client-side routing
      if (err || !stats.isFile() || !isAllowedExt) {
        const indexPath = path.join(ROOT, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          fs.createReadStream(indexPath).pipe(res);
          return;
        }
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
        return;
      }

      const mime = isManifest ? 'application/manifest+json; charset=utf-8' : (MIME_TYPES[ext] || 'application/octet-stream');

      res.statusCode = 200;
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'no-cache');

      fs.createReadStream(fullPath).pipe(res);
    });
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('500 Server Error: ' + e.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`STOKE Hardened Server listening on 0.0.0.0:${PORT}`);
  console.log(`Local PC:   http://localhost:${PORT}/`);
  console.log(`Static file protection: ACTIVE (.env, .ps1, dotfiles BLOCKED)`);
});
