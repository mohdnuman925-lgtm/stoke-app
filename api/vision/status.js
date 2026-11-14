// Vercel / Node.js Serverless Function: Multi-Model Vision AI Status Health Check
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Safe environment loader fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
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

  const claudeKey = (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '').trim();
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

  const hasClaude = Boolean(claudeKey && claudeKey.length > 10 && !claudeKey.includes('your_anthropic_api_key'));
  const hasGemini = Boolean(geminiKey && geminiKey.length > 10 && !geminiKey.includes('your_gemini_api_key'));

  return res.status(200).json({
    status: 'ok',
    hasApiKey: hasClaude || hasGemini,
    providers: {
      anthropicClaude: hasClaude,
      googleGemini: hasGemini
    },
    activeProvider: hasClaude ? 'Anthropic Claude 3.5' : (hasGemini ? 'Google Gemini' : 'None configured'),
    supportedModels: [
      'claude-3-5-sonnet',
      'claude-3-5-haiku',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite'
    ],
    service: 'STOKE Multi-Model Vision AI Gateway (Claude & Gemini)',
    timestamp: new Date().toISOString()
  });
}
