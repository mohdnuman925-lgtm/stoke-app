// Vercel / Node.js Serverless Function: STOKE Conversational Coach AI Gateway
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let generateUniversalCoachReply = null;
try {
  const engine = require('../universal_coach_engine.cjs');
  generateUniversalCoachReply = engine.generateUniversalCoachReply;
} catch (e) {
  console.warn('[Coach AI] Could not load universal_coach_engine.cjs:', e.message);
}

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

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', (req.headers && req.headers.origin) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { message, history = [], profile = {}, goals = {}, remaining = {} } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message query is required.' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      if (typeof generateUniversalCoachReply === 'function') {
        const fallback = generateUniversalCoachReply(message, history, {
          profile,
          athleteName,
          userGoal: goalType,
          userWeight: weightKg,
          goals,
          remCal: remaining?.calories,
          remP: remaining?.protein,
          remC: remaining?.carbs,
          remF: remaining?.fat
        });
        return res.status(200).json({
          success: true,
          source: 'universal_coach_engine',
          model: 'offline-local-engine',
          autoTitle: fallback.autoTitle || 'Coach Consultation',
          content: fallback.content || '',
          mealCard: fallback.mealCard || null,
          workoutCard: fallback.workoutCard || null,
          suggestions: fallback.suggestions || []
        });
      }
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server.' });
    }

    const athleteName = profile.name ? profile.name.trim().split(' ')[0] : 'Athlete';
    const goalType = profile.goalType ? String(profile.goalType).toUpperCase() : 'MAINTAIN';
    const weightKg = profile.weightKg || 70;

    const systemPrompt = `You are STOKE Coach — an elite, PhD-level sports nutritionist, strength & conditioning specialist, and ChatGPT-style fitness companion inside the STOKE Fitness App.

Your identity:
- You speak directly to the athlete (${athleteName}, ${weightKg}kg, goal: ${goalType}).
- You are warm, authoritative, highly scientific, practical, and action-oriented.
- You format all responses in rich GitHub-flavored Markdown like ChatGPT:
  • Clear '### ' section headings
  • Clean Markdown tables for weekly grocery shopping lists, daily rotations, and workout tables
  • Clear bullet points ('• ') for ingredients, macros, and preparation steps
  • High-density macro breakdowns (Calories, Protein, Carbs, Fat, Fibre) for every recommended meal.

Core Capabilities:
1. ANY BUDGET & INDIAN CUISINE (₹ / INR / Rs):
   - You master Indian food items and realistic market / mandi retail pricing (Delhi NCR, Mumbai, Bengaluru, Pune, Tier-2/3).
   - You understand all budget levels: ₹300, ₹500, ₹800, ₹1,000, ₹1,200, ₹1,500, ₹2,000, ₹2,500, ₹3,000, ₹5,000/week or daily ₹50–₹250/day or monthly budgets.
   - For ANY budget meal query:
     • Provide an itemized grocery basket table with quantities, prices in ₹, and macro contributions.
     • Calculate total estimated cost and STRICTLY DO NOT EXCEED the user's budget.
     • Provide daily meal breakdowns covering all 4 slots: Breakfast, Lunch, Snack, Dinner.
     • Provide a 7-day day-by-day rotation schedule.
     • Include a regional pricing variation note (prices vary by ±10–15% based on local mandi/market).

2. ALL DIETARY PREFERENCES:
   - Pure Vegetarian: Low-fat paneer, soya chunks (Nutrela), yellow moong dal, masoor dal, kala chana, rajma, dahi/curd, roasted chana, peanuts, atta, rice, seasonal greens.
   - Non-Vegetarian: Farm fresh eggs, chicken curry cut, skinless chicken breast, fish, lentils, rice, atta, veggies.
   - Eggetarian: Eggs + all vegetarian staples.
   - Vegan: Tofu, soya chunks, lentils, chickpeas, oats, seeds, veggies.

3. ALL FITNESS PURPOSES:
   - Weight Loss / Fat Loss / Cutting: Controlled calorie deficit (-300 to -500 kcal), high protein (1.6–2.2g/kg), high volume/fibre foods, moderate low-GI carbs.
   - Muscle Gain / Hypertrophy / Bulking: Calorie surplus (+300 to +500 kcal), progressive resistance overload, 1.8–2.2g/kg protein, dense complex carbs.
   - Body Recomposition: Maintenance calories, high protein, resistance training.
   - Running / Endurance / Marathons: Glycogen fueling, electrolyte hydration, pre/post run recovery macros.
   - Gym Workouts: Detailed workout tables with exercises, sets, rep ranges, rest periods, and RPE.

Always respond in JSON with the exact following schema:
{
  "autoTitle": "Short 2-4 word conversation title",
  "content": "Full markdown formatted response with ### headings, tables, bullet points, and pricing notes",
  "mealCard": {
    "name": "Featured Meal Name",
    "calories": 520,
    "protein": 34,
    "carbs": 44,
    "fat": 16,
    "fibre": "6g",
    "portion": "1 serving description"
  },
  "workoutCard": null,
  "suggestions": [
    "Interactive follow-up 1",
    "Interactive follow-up 2",
    "Interactive follow-up 3"
  ]
}`;

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-lite-latest',
      'gemini-flash-latest'
    ];

    // Format chat history for Gemini
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      for (const m of recent) {
        if (m.role === 'user' && m.content) {
          contents.push({ role: 'user', parts: [{ text: m.content }] });
        } else if (m.role === 'assistant' && (m.content || m.fullContent)) {
          contents.push({ role: 'model', parts: [{ text: m.content || m.fullContent }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    };

    let lastError = null;
    for (const model of candidateModels) {
      try {
        console.log(`[Coach AI] Trying model ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = `Model ${model} returned HTTP ${response.status}: ${errText}`;
          continue;
        }

        const data = await response.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        let cleanText = rawJson.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
        if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
        if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
        cleanText = cleanText.trim();

        const parsed = JSON.parse(cleanText);
        return res.status(200).json({
          success: true,
          source: 'gemini_ai',
          model,
          autoTitle: parsed.autoTitle || 'Coach Consultation',
          content: parsed.content || '',
          mealCard: parsed.mealCard || null,
          workoutCard: parsed.workoutCard || null,
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
        });
      } catch (err) {
        lastError = `Model ${model} error: ${err.message}`;
      }
    }

    if (typeof generateUniversalCoachReply === 'function') {
      console.log('[Coach AI] Falling back to Universal Coach Engine...');
      const fallback = generateUniversalCoachReply(message, history, {
        profile,
        athleteName,
        userGoal: goalType,
        userWeight: weightKg,
        goals,
        remCal: remaining?.calories,
        remP: remaining?.protein,
        remC: remaining?.carbs,
        remF: remaining?.fat
      });
      return res.status(200).json({
        success: true,
        source: 'universal_coach_engine_fallback',
        model: 'universal-engine-fallback',
        autoTitle: fallback.autoTitle || 'Coach Consultation',
        content: fallback.content || '',
        mealCard: fallback.mealCard || null,
        workoutCard: fallback.workoutCard || null,
        suggestions: fallback.suggestions || []
      });
    }

    return res.status(503).json({
      success: false,
      error: lastError || 'Gemini models unavailable. Client will use dynamic fallback.'
    });
  } catch (outerErr) {
    return res.status(500).json({
      success: false,
      error: outerErr.message
    });
  }
}
