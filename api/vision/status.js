// Vercel / Node.js Serverless Function: Multi-Model Vision AI Status Health Check
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Safe environment loader fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.AWS_ACCESS_KEY_ID) {
  const envLocal = path.join(rootDir, '.env.local');
  const envMain = path.join(rootDir, '.env');
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal });
  } else if (fs.existsSync(envMain)) {
    dotenv.config({ path: envMain });
  }
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const awsAccessKey = (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_BEDROCK_ACCESS_KEY || '').trim();
  const awsSecretKey = (process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_BEDROCK_SECRET_KEY || '').trim();
  const awsRegion = (process.env.AWS_REGION || process.env.AWS_BEDROCK_REGION || 'us-east-1').trim();

  const claudeKey = (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '').trim();
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

  const hasBedrock = Boolean(awsAccessKey && awsSecretKey && awsAccessKey.length > 8 && awsSecretKey.length > 15);
  const hasClaude = Boolean(claudeKey && claudeKey.length > 10 && !claudeKey.includes('your_anthropic_api_key'));
  const hasGemini = Boolean(geminiKey && geminiKey.length > 10 && !geminiKey.includes('your_gemini_api_key'));

  let activeProvider = 'None configured';
  if (hasBedrock) activeProvider = `AWS Bedrock Claude (${awsRegion})`;
  else if (hasClaude) activeProvider = 'Anthropic Claude 3.5';
  else if (hasGemini) activeProvider = 'Google Gemini';

  return res.status(200).json({
    status: 'ok',
    hasApiKey: hasBedrock || hasClaude || hasGemini,
    providers: {
      awsBedrockClaude: hasBedrock,
      anthropicClaude: hasClaude,
      googleGemini: hasGemini
    },
    activeProvider,
    bedrockConfig: hasBedrock ? { region: awsRegion, model: process.env.BEDROCK_MODEL_ID || 'claude-3-5-sonnet' } : null,
    supportedModels: [
      'bedrock/anthropic.claude-3-5-sonnet',
      'bedrock/anthropic.claude-3-5-haiku',
      'bedrock/anthropic.claude-3-haiku',
      'anthropic/claude-3-5-sonnet',
      'gemini-3.5-flash'
    ],
    service: 'STOKE Vision AI Gateway (AWS Bedrock Claude, Anthropic Claude & Gemini)',
    timestamp: new Date().toISOString()
  });
}
