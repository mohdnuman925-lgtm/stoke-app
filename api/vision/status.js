// Vercel / Node.js Serverless Function: Vision AI Status Health Check
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Safe environment loader fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

if (!process.env.GEMINI_API_KEY) {
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

  const activeKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  const hasKey = Boolean(activeKey && activeKey.length > 8 && !activeKey.includes('your_gemini_api_key'));

  return res.status(200).json({
    status: 'ok',
    hasApiKey: hasKey,
    supportedModels: ['gemini-3.5-flash', 'gemini-3.5-flash-lite'],
    activeModel: 'gemini-3.5-flash',
    service: 'STOKE Vision AI Secure Gateway',
    timestamp: new Date().toISOString()
  });
}
