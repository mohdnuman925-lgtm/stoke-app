// Vercel / Node.js Serverless Function: Multi-Model Vision AI Status & Live Diagnostic Check
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.AWS_ACCESS_KEY_ID && !process.env.BEDROCK_API_KEY && !process.env.CLAUDE_API_KEY) {
  const envLocal = path.join(rootDir, '.env.local');
  const envMain = path.join(rootDir, '.env');
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal });
  } else if (fs.existsSync(envMain)) {
    dotenv.config({ path: envMain });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || (rawSingleKey.startsWith('AIza') ? rawSingleKey : '')).trim();

  const isBedrockBearerKey = Boolean(rawSingleKey && (rawSingleKey.startsWith('ABSK') || rawSingleKey.startsWith('bedrock-') || process.env.BEDROCK_API_KEY || process.env.AWS_BEARER_TOKEN_BEDROCK));
  const isAnthropicDirectKey = Boolean(rawSingleKey && (rawSingleKey.startsWith('sk-ant-') || rawSingleKey.startsWith('sk-') || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY));
  const hasBedrockSigV4 = Boolean(awsAccessKey && awsSecretKey && awsAccessKey.length > 8 && awsSecretKey.length > 15);
  const hasGemini = Boolean(geminiKey && geminiKey.length > 10 && !geminiKey.includes('your_gemini_api_key'));

  let activeProvider = 'None configured';
  if (isBedrockBearerKey) activeProvider = 'AWS Bedrock API Key (Bearer)';
  else if (isAnthropicDirectKey) activeProvider = 'Anthropic Claude (API Key)';
  else if (hasBedrockSigV4) activeProvider = `AWS Bedrock IAM SigV4 (${awsRegion})`;
  else if (hasGemini) activeProvider = 'Google Gemini (API Key)';
  else if (rawSingleKey) activeProvider = 'Custom Vision Key';

  const hasApiKey = Boolean(isBedrockBearerKey || isAnthropicDirectKey || hasBedrockSigV4 || hasGemini || rawSingleKey);

  // Diagnostic Test Execution if requested via ?test=1 or ?diagnose=1
  const testRequested = req.url && (req.url.includes('test=') || req.url.includes('diagnose='));
  let diagnosticResult = null;

  if (testRequested && hasApiKey) {
    diagnosticResult = { attempts: [] };

    // Test Bedrock Bearer Key if configured
    if (isBedrockBearerKey || (rawSingleKey && !isAnthropicDirectKey && !rawSingleKey.startsWith('AIza'))) {
      const testRegions = Array.from(new Set([awsRegion, 'us-east-1', 'us-west-2', 'ap-south-1', 'eu-central-1']));
      const testModels = [
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'anthropic.claude-3-5-sonnet-20241022-v2:0',
        'us.anthropic.claude-3-5-haiku-20241022-v1:0',
        'anthropic.claude-3-haiku-20240307-v1:0'
      ];

      for (const r of testRegions) {
        for (const m of testModels) {
          try {
            const url = `https://bedrock-runtime.${r}.amazonaws.com/model/${encodeURIComponent(m)}/invoke`;
            const payload = JSON.stringify({
              anthropic_version: 'bedrock-2023-05-31',
              max_tokens: 10,
              messages: [{ role: 'user', content: 'hi' }]
            });

            const resp = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${rawSingleKey}`
              },
              body: payload,
              signal: AbortSignal.timeout(6000)
            });

            const text = await resp.text();
            let parsed = null;
            try { parsed = JSON.parse(text); } catch {}

            diagnosticResult.attempts.push({
              region: r,
              model: m,
              status: resp.status,
              ok: resp.ok,
              error: resp.ok ? null : (parsed?.message || text.substring(0, 150))
            });

            if (resp.ok) {
              diagnosticResult.successfulCall = { region: r, model: m };
              break;
            }
          } catch (err) {
            diagnosticResult.attempts.push({
              region: r,
              model: m,
              error: err.message
            });
          }
        }
        if (diagnosticResult.successfulCall) break;
      }
    }
  }

  return res.status(200).json({
    status: 'ok',
    hasApiKey,
    activeProvider,
    keyConfigured: hasApiKey ? 'Active' : 'Missing',
    configuredRegion: awsRegion,
    keyPrefix: rawSingleKey ? `${rawSingleKey.substring(0, 5)}...` : (awsAccessKey ? `${awsAccessKey.substring(0, 5)}...` : 'none'),
    diagnosticResult,
    supportedModels: [
      'claude-3-5-sonnet',
      'claude-3-5-haiku',
      'claude-3-haiku',
      'gemini-3.5-flash'
    ],
    service: 'STOKE Universal Vision AI Gateway',
    timestamp: new Date().toISOString()
  });
}
