// Vercel / Node.js Serverless Function: Universal Multi-Model Vision AI Gateway
// Supports: Bedrock API Key (ABSK... / Bearer), Bedrock SigV4 (IAM), Anthropic Claude Direct (sk-ant...), Google Gemini (AIza...)
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Safe environment loader fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Safe server-side environment loading
if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.AWS_ACCESS_KEY_ID && !process.env.BEDROCK_API_KEY && !process.env.CLAUDE_API_KEY) {
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

// ---------------------------------------------------------------------------
// AWS SigV4 SIGNING SUITE FOR AWS BEDROCK RUNTIME (IAM Credentials)
// ---------------------------------------------------------------------------
function hmac(key, str) {
  return crypto.createHmac('sha256', key).update(str, 'utf8').digest();
}

function hash(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  const kSigning = hmac(kService, 'aws4_request');
  return kSigning;
}

function signBedrockRequest({ accessKey, secretKey, sessionToken, region = 'us-east-1', modelId, payload }) {
  const method = 'POST';
  const service = 'bedrock';
  const host = `bedrock-runtime.${region}.amazonaws.com`;
  const endpoint = `https://${host}/model/${encodeURIComponent(modelId)}/invoke`;
  const canonicalUri = `/model/${encodeURIComponent(modelId)}/invoke`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = hash(payload);

  const headersToSign = {
    'content-type': 'application/json',
    'host': host,
    'x-amz-date': amzDate
  };

  if (sessionToken) {
    headersToSign['x-amz-security-token'] = sessionToken;
  }

  const sortedKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedKeys.map(k => `${k}:${headersToSign[k]}\n`).join('');
  const signedHeaders = sortedKeys.join(';');

  const canonicalRequest = [
    method,
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hash(canonicalRequest)
  ].join('\n');

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Host': host,
    'X-Amz-Date': amzDate,
    'Authorization': authorizationHeader
  };

  if (sessionToken) {
    requestHeaders['X-Amz-Security-Token'] = sessionToken;
  }

  return { endpoint, headers: requestHeaders };
}

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

    if (!userId) {
      return res.status(401).json({
        success: false,
        requiresAuth: true,
        error: 'Authentication required. Please sign in to your STOKE athlete account to use Vision AI food analysis.'
      });
    }

    // -------------------------------------------------------------------------
    // 2. RATE LIMITING
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

    if (base64.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        scanId,
        error: 'Photo is too large for AI processing. Please upload an image under 5MB.'
      });
    }

    // -------------------------------------------------------------------------
    // 4. INTELLIGENT KEY DETECTION
    // -------------------------------------------------------------------------
    // Resolve single keys: BEDROCK_API_KEY, CLAUDE_API_KEY, ANTHROPIC_API_KEY, AI_API_KEY, GEMINI_API_KEY
    const rawSingleKey = (
      process.env.BEDROCK_API_KEY ||
      process.env.CLAUDE_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.AI_API_KEY ||
      process.env.AWS_BEARER_TOKEN_BEDROCK ||
      ''
    ).trim();

    const awsAccessKey = (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_BEDROCK_ACCESS_KEY || '').trim();
    const awsSecretKey = (process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_BEDROCK_SECRET_KEY || '').trim();
    const awsRegion = (process.env.AWS_REGION || process.env.AWS_BEDROCK_REGION || 'us-east-1').trim();
    const awsSessionToken = (process.env.AWS_SESSION_TOKEN || '').trim();

    const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || (rawSingleKey.startsWith('AIza') ? rawSingleKey : '')).trim();

    // Determine key classification
    const isBedrockBearerKey = Boolean(rawSingleKey && (rawSingleKey.startsWith('ABSK') || rawSingleKey.startsWith('bedrock-') || process.env.BEDROCK_API_KEY || process.env.AWS_BEARER_TOKEN_BEDROCK));
    const isAnthropicDirectKey = Boolean(rawSingleKey && (rawSingleKey.startsWith('sk-ant-') || rawSingleKey.startsWith('sk-') || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY));
    const hasBedrockSigV4 = Boolean(awsAccessKey && awsSecretKey && awsAccessKey.length > 8 && awsSecretKey.length > 15);
    const hasGemini = Boolean(geminiKey && geminiKey.length > 10 && !geminiKey.includes('your_gemini_api_key'));

    if (!isBedrockBearerKey && !isAnthropicDirectKey && !hasBedrockSigV4 && !hasGemini && !rawSingleKey) {
      return res.status(500).json({
        success: false,
        scanId,
        requiresApiKey: true,
        configured: false,
        error: 'Vision AI key is not configured. Please add your key as CLAUDE_API_KEY, BEDROCK_API_KEY, or GEMINI_API_KEY in your Vercel project environment variables.'
      });
    }

    const systemPrompt = `You are STOKE Vision AI, an expert food recognition and nutrition system. Analyze the meal photo and output ONLY valid JSON matching this schema: {"items": [{"name": "Food Name", "grams": 150, "calories": 250, "protein": 20, "carbs": 30, "fat": 5, "fiber": 3, "dietType": "veg"|"nonveg", "confidence": 95}], "disclaimer": "Nutritional estimates based on visual volume."}. Ensure calories and macros are realistic estimates for the visual portions. No markdown fences, no explanations outside the JSON.`;

    // -------------------------------------------------------------------------
    // 5A. AWS BEDROCK RUNTIME VIA API KEY (Bearer Token / ABSK...)
    // -------------------------------------------------------------------------
    if (isBedrockBearerKey || (rawSingleKey && !isAnthropicDirectKey && !rawSingleKey.startsWith('AIza'))) {
      const bedrockModels = [
        process.env.BEDROCK_MODEL_ID,
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'anthropic.claude-3-5-sonnet-20241022-v2:0',
        'us.anthropic.claude-3-5-haiku-20241022-v1:0',
        'anthropic.claude-3-haiku-20240307-v1:0'
      ].filter(Boolean);

      const bedrockPayload = JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
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
      });

      for (const bModel of bedrockModels) {
        try {
          const endpoint = `https://bedrock-runtime.${awsRegion}.amazonaws.com/model/${encodeURIComponent(bModel)}/invoke`;
          const bResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${rawSingleKey}`
            },
            body: bedrockPayload,
            signal: AbortSignal.timeout(28000)
          });

          if (bResponse.ok) {
            const bData = await bResponse.json();
            const rawText = (bData.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
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
              disclaimer: parsedResult.disclaimer || 'Nutritional estimates powered by AWS Bedrock Claude 3.5 Vision AI.',
              source: 'stoke_backend_aws_bedrock_apikey',
              model: bModel,
              region: awsRegion
            });
          }
        } catch (bKeyErr) {
          console.warn(`[Bedrock Bearer Notice] Model ${bModel}:`, bKeyErr.message);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 5B. ANTHROPIC CLAUDE DIRECT API PIPELINE (If key starts with sk-ant- or sk-)
    // -------------------------------------------------------------------------
    if (isAnthropicDirectKey || rawSingleKey.startsWith('sk-')) {
      const claudeKey = rawSingleKey || process.env.ANTHROPIC_API_KEY;
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
              disclaimer: parsedResult.disclaimer || 'Nutritional estimates powered by Anthropic Claude 3.5 Vision AI.',
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
    // 5C. AWS BEDROCK SIGV4 PIPELINE (If Access Key + Secret Key Provided)
    // -------------------------------------------------------------------------
    if (hasBedrockSigV4) {
      const bedrockModels = [
        process.env.BEDROCK_MODEL_ID,
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'anthropic.claude-3-5-sonnet-20241022-v2:0',
        'us.anthropic.claude-3-5-haiku-20241022-v1:0',
        'anthropic.claude-3-haiku-20240307-v1:0'
      ].filter(Boolean);

      const bedrockPayload = JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
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
                text: 'Identify all visible foods and return structured JSON nutrition data.'
              }
            ]
          }
        ]
      });

      for (const bModel of bedrockModels) {
        try {
          const signed = signBedrockRequest({
            accessKey: awsAccessKey,
            secretKey: awsSecretKey,
            sessionToken: awsSessionToken,
            region: awsRegion,
            modelId: bModel,
            payload: bedrockPayload
          });

          const bResponse = await fetch(signed.endpoint, {
            method: 'POST',
            headers: signed.headers,
            body: bedrockPayload,
            signal: AbortSignal.timeout(28000)
          });

          if (bResponse.ok) {
            const bData = await bResponse.json();
            const rawText = (bData.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
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
              disclaimer: parsedResult.disclaimer || 'Nutritional estimates powered by AWS Bedrock Claude 3.5 Vision AI.',
              source: 'stoke_backend_aws_bedrock_sigv4',
              model: bModel,
              region: awsRegion
            });
          }
        } catch (bErr) {
          console.warn(`[Bedrock SigV4 Notice] Model ${bModel}:`, bErr.message);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 5D. GOOGLE GEMINI PIPELINE
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
