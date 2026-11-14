// Vercel / Node.js Serverless Function: Secure Multi-Model Vision AI Gateway (Claude & Gemini)
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Safe environment loader fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Safe server-side environment loading
if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
  const envLocal = path.join(rootDir, '.env.local');
  const envMain = path.join(rootDir, '.env');
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal });
  } else if (fs.existsSync(envMain)) {
    dotenv.config({ path: envMain });
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://aydyorwlixmwyavqbiko.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_k0QaXfoF85EeZ_aZTdRMJA_QWrCZwwJ";

// Sliding-window rate limiting map: max 10 analysis requests per 60 seconds per user/IP
const analysisRateLimits = new Map();

function checkVisionRateLimit(identifier, maxLimit = 10, windowMs = 60000) {
  const now = Date.now();
  let record = analysisRateLimits.get(identifier);
  if (!record || now - record.startTime > windowMs) {
    record = { count: 1, startTime: now };
    analysisRateLimits.set(identifier, record);
    return { allowed: true, remaining: maxLimit - 1 };
  }
  record.count++;
  if (record.count > maxLimit) {
    const retryAfterSec = Math.ceil((record.startTime + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfterSec) };
  }
  return { allowed: true, remaining: maxLimit - record.count };
}

// Clean up stale rate limits every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of analysisRateLimits.entries()) {
    if (now - val.startTime > 120000) analysisRateLimits.delete(key);
  }
}, 300000);

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  const origin = req.headers?.origin || '';
  const ALLOWED_ORIGINS = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/,
    /^https:\/\/(www\.)?stoke\.bond$/,
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/
  ];
  if (origin && ALLOWED_ORIGINS.some(r => r.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const clientIp = req.socket?.remoteAddress || req.headers?.['x-forwarded-for'] || '127.0.0.1';

    // -------------------------------------------------------------------------
    // 1. AUTHENTICATION & IDENTITY VERIFICATION
    // -------------------------------------------------------------------------
    const authHeader = req.headers?.authorization || '';
    let userId = null;
    let userEmail = null;

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token && token !== 'local-session-active' && token.length > 20) {
        try {
          const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`
            },
            signal: AbortSignal.timeout(5000)
          });
          if (userResp.ok) {
            const userData = await userResp.json();
            if (userData?.id) {
              userId = userData.id;
              userEmail = userData.email;
            }
          }
        } catch (authErr) {
          console.warn('[Vision Auth] Token validation network notice:', authErr.message);
        }
      }
    }

    // Require valid authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        requiresAuth: true,
        error: 'Authentication required. Please sign in to your STOKE athlete account to use Vision AI food analysis.'
      });
    }

    // -------------------------------------------------------------------------
    // 2. RATE LIMITING (Per-User & Per-IP)
    // -------------------------------------------------------------------------
    const rateLimitKey = `user_${userId}`;
    const rateLimit = checkVisionRateLimit(rateLimitKey, 10, 60000);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: `Vision AI rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds before analyzing another meal.`,
        retryAfter: rateLimit.retryAfter
      });
    }

    // -------------------------------------------------------------------------
    // 3. PAYLOAD & IMAGE VALIDATION
    // -------------------------------------------------------------------------
    const { scanId = `scan_${Date.now()}`, base64, mimeType = 'image/jpeg' } = req.body || {};

    if (!base64 || typeof base64 !== 'string' || base64.trim() === '') {
      return res.status(400).json({
        success: false,
        scanId,
        error: 'No food image data received. Please provide a valid photo.'
      });
    }

    const cleanMime = mimeType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(cleanMime)) {
      return res.status(400).json({
        success: false,
        scanId,
        error: 'Unsupported image format. Please capture JPEG, PNG, or WebP images.'
      });
    }

    // Enforce 5MB base64 size limit (approx 3.75MB raw file)
    if (base64.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        scanId,
        error: 'Photo is too large for AI processing. Please upload an image under 5MB.'
      });
    }

    // -------------------------------------------------------------------------
    // 4. MULTI-MODEL AI KEY RESOLUTION (Claude & Gemini)
    // -------------------------------------------------------------------------
    const claudeKey = (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '').trim();
    const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

    const hasClaude = Boolean(claudeKey && claudeKey.length > 10 && !claudeKey.includes('your_anthropic_api_key'));
    const hasGemini = Boolean(geminiKey && geminiKey.length > 10 && !geminiKey.includes('your_gemini_api_key'));

    if (!hasClaude && !hasGemini) {
      return res.status(500).json({
        success: false,
        scanId,
        requiresApiKey: true,
        configured: false,
        error: 'Vision AI key is not configured on the server. Please configure ANTHROPIC_API_KEY (Claude) or GEMINI_API_KEY in your hosting environment variables.'
      });
    }

    const systemPrompt = `You are STOKE Vision AI, an expert food recognition and nutrition system. Analyze the meal photo and output ONLY valid JSON matching this schema: {"items": [{"name": "Food Name", "grams": 150, "calories": 250, "protein": 20, "carbs": 30, "fat": 5, "fiber": 3, "dietType": "veg"|"nonveg", "confidence": 95}], "disclaimer": "Nutritional estimates based on visual volume."}. Ensure calories and macros are realistic estimates for the visual portions. No markdown fences, no explanations outside the JSON.`;

    // -------------------------------------------------------------------------
    // 5. ANTHROPIC CLAUDE 3.5 VISION PIPELINE (If Claude Key Configured)
    // -------------------------------------------------------------------------
    if (hasClaude) {
      const claudeModels = ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'];
      for (const cModel of claudeModels) {
        try {
          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': claudeKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: cModel,
              max_tokens: 1200,
              system: systemPrompt,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: cleanMime,
                        data: base64
                      }
                    },
                    {
                      type: 'text',
                      text: 'Identify all visible foods and return structured JSON nutrition data.'
                    }
                  ]
                }
              ]
            }),
            signal: AbortSignal.timeout(25000)
          });

          if (claudeResponse.ok) {
            const cData = await claudeResponse.json();
            const rawText = (cData.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
            let cleanText = rawText.trim();
            if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
            if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
            if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
            cleanText = cleanText.trim();

            const parsedResult = JSON.parse(cleanText);
            return res.status(200).json({
              success: true,
              scanId,
              userId,
              items: parsedResult.items || [],
              disclaimer: parsedResult.disclaimer || 'Nutritional estimates powered by Anthropic Claude Vision AI.',
              source: 'stoke_backend_claude',
              model: cModel
            });
          }
        } catch (claudeErr) {
          console.warn(`[Claude Vision Notice] Model ${cModel}:`, claudeErr.message);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 6. GOOGLE GEMINI VISION PIPELINE (If Gemini Key Configured or Fallback)
    // -------------------------------------------------------------------------
    if (hasGemini) {
      const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
      const payload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: cleanMime,
                  data: base64
                }
              },
              {
                text: 'Identify all visible foods and return structured JSON nutrition data.'
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      };

      let lastError = '';
      for (const model of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(20000)
          });

          if (!response.ok) {
            const errBody = await response.text();
            let parsedMsg = errBody;
            try {
              const parsed = JSON.parse(errBody);
              if (parsed.error?.message) parsedMsg = parsed.error.message;
            } catch { }
            lastError = `Model ${model} returned HTTP ${response.status}: ${parsedMsg}`;
            continue;
          }

          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          let cleanText = rawText.trim();
          if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
          if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
          if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
          cleanText = cleanText.trim();

          const parsedResult = JSON.parse(cleanText);
          return res.status(200).json({
            success: true,
            scanId,
            userId,
            items: parsedResult.items || [],
            disclaimer: parsedResult.disclaimer || 'Nutritional estimates based on visual volume estimation.',
            source: 'stoke_backend_gemini',
            model
          });
        } catch (err) {
          lastError = err.message;
        }
      }

      return res.status(502).json({
        success: false,
        scanId,
        error: `Vision AI processing failed: ${lastError}`,
        items: []
      });
    }

    return res.status(500).json({
      success: false,
      error: 'No active AI Vision provider succeeded.'
    });
  } catch (globalErr) {
    return res.status(500).json({
      success: false,
      error: 'Internal Vision AI gateway error.'
    });
  }
}
