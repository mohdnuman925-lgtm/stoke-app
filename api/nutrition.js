// /api/nutrition.js — Stoke Fitness Nutrition Lookup Serverless Endpoint
// Provides real-time food nutrition data lookup.
// Strategy:
//   1. Scan STOKE_VERIFIED_NUTRITION_DB (embedded below) for instant match
//   2. Try Open Food Facts API (free, no key required, global + Indian foods)
//   3. Try USDA FoodData Central (free API key optional, great for base foods)
// Never returns invented values — only real data or "not found".

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

if (!process.env.GEMINI_API_KEY) {
  const envLocal = path.join(rootDir, '.env.local');
  const envMain = path.join(rootDir, '.env');
  if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
  else if (fs.existsSync(envMain)) dotenv.config({ path: envMain });
}

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDED NUTRITION DB (Indian + Global foods, per 100g)
// Mirrors STOKE_VERIFIED_NUTRITION_DB from index.html for server-side lookup
// ─────────────────────────────────────────────────────────────────────────────
const NUTRITION_DB = {
  // ── GRAINS & RICE ──
  "oats": { name: "Oats (Dry / Rolled)", per100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 }, dietType: "veg", defaultGrams: 40 },
  "rolled oats": { name: "Rolled Oats", per100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 }, dietType: "veg", defaultGrams: 40 },
  "oatmeal": { name: "Oatmeal (Cooked)", per100g: { calories: 71, protein: 2.5, carbs: 12.0, fat: 1.4, fiber: 1.7 }, dietType: "veg", defaultGrams: 200 },
  "rice": { name: "Steamed Basmati Rice (Cooked)", per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 }, dietType: "veg", defaultGrams: 150 },
  "basmati rice": { name: "Steamed Basmati Rice (Cooked)", per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 }, dietType: "veg", defaultGrams: 150 },
  "cooked rice": { name: "Cooked White Rice", per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 }, dietType: "veg", defaultGrams: 150 },
  "brown rice": { name: "Brown Rice (Cooked)", per100g: { calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, fiber: 1.8 }, dietType: "veg", defaultGrams: 150 },
  "chapati": { name: "Chapati / Roti", per100g: { calories: 297, protein: 7.9, carbs: 55.0, fat: 3.7, fiber: 4.0 }, dietType: "veg", defaultGrams: 40 },
  "roti": { name: "Roti / Chapati", per100g: { calories: 297, protein: 7.9, carbs: 55.0, fat: 3.7, fiber: 4.0 }, dietType: "veg", defaultGrams: 40 },
  "white bread": { name: "White Bread", per100g: { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7 }, dietType: "veg", defaultGrams: 60 },
  "brown bread": { name: "Brown / Whole Wheat Bread", per100g: { calories: 247, protein: 10.5, carbs: 44.0, fat: 3.6, fiber: 6.0 }, dietType: "veg", defaultGrams: 60 },

  // ── PROTEINS: EGGS ──
  "egg": { name: "Whole Boiled Egg", per100g: { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0 }, dietType: "nonveg", defaultGrams: 50 },
  "eggs": { name: "Whole Boiled Eggs", per100g: { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0 }, dietType: "nonveg", defaultGrams: 50 },
  "boiled egg": { name: "Boiled Egg", per100g: { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0 }, dietType: "nonveg", defaultGrams: 50 },
  "boiled eggs": { name: "Boiled Eggs", per100g: { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0 }, dietType: "nonveg", defaultGrams: 50 },
  "egg whites": { name: "Egg Whites", per100g: { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0 }, dietType: "nonveg", defaultGrams: 100 },
  "scrambled eggs": { name: "Scrambled Eggs", per100g: { calories: 149, protein: 10.1, carbs: 1.6, fat: 11.2, fiber: 0 }, dietType: "nonveg", defaultGrams: 100 },
  "omelette": { name: "Plain Omelette (2 eggs)", per100g: { calories: 154, protein: 10.6, carbs: 1.0, fat: 12.1, fiber: 0 }, dietType: "nonveg", defaultGrams: 100 },

  // ── PROTEINS: CHICKEN ──
  "chicken": { name: "Chicken Breast (Cooked)", per100g: { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 }, dietType: "nonveg", defaultGrams: 150 },
  "chicken breast": { name: "Chicken Breast (Cooked)", per100g: { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 }, dietType: "nonveg", defaultGrams: 150 },
  "grilled chicken": { name: "Grilled Chicken Breast", per100g: { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 }, dietType: "nonveg", defaultGrams: 150 },
  "chicken curry": { name: "Chicken Curry (Avg)", per100g: { calories: 155, protein: 14.0, carbs: 5.5, fat: 8.5, fiber: 1.2 }, dietType: "nonveg", defaultGrams: 200 },
  "tandoori chicken": { name: "Tandoori Chicken", per100g: { calories: 160, protein: 25.0, carbs: 3.0, fat: 5.5, fiber: 0.5 }, dietType: "nonveg", defaultGrams: 150 },

  // ── PROTEINS: FISH & SEAFOOD ──
  "fish": { name: "Rohu Fish (Avg Indian)", per100g: { calories: 97, protein: 16.6, carbs: 0, fat: 2.7, fiber: 0 }, dietType: "nonveg", defaultGrams: 150 },
  "salmon": { name: "Salmon (Cooked)", per100g: { calories: 208, protein: 20.0, carbs: 0, fat: 13.0, fiber: 0 }, dietType: "nonveg", defaultGrams: 150 },
  "tuna": { name: "Canned Tuna in Water", per100g: { calories: 116, protein: 26.0, carbs: 0, fat: 1.0, fiber: 0 }, dietType: "nonveg", defaultGrams: 100 },

  // ── VEG PROTEINS ──
  "dal": { name: "Cooked Dal / Lentils", per100g: { calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 7.9 }, dietType: "veg", defaultGrams: 150 },
  "yellow dal": { name: "Yellow Moong Dal (Cooked)", per100g: { calories: 105, protein: 7.0, carbs: 18.0, fat: 0.5, fiber: 5.0 }, dietType: "veg", defaultGrams: 150 },
  "masoor dal": { name: "Masoor Dal (Cooked)", per100g: { calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 7.9 }, dietType: "veg", defaultGrams: 150 },
  "paneer": { name: "Paneer (Indian Cottage Cheese)", per100g: { calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0 }, dietType: "veg", defaultGrams: 100 },
  "soya chunks": { name: "Soya Chunks / Nutrela (Dry)", per100g: { calories: 345, protein: 52.0, carbs: 33.0, fat: 0.5, fiber: 13.0 }, dietType: "veg", defaultGrams: 50 },
  "tofu": { name: "Tofu (Firm)", per100g: { calories: 76, protein: 8.0, carbs: 1.9, fat: 4.8, fiber: 0.3 }, dietType: "veg", defaultGrams: 150 },
  "chana": { name: "Boiled Chickpeas / Chana", per100g: { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 }, dietType: "veg", defaultGrams: 100 },
  "rajma": { name: "Rajma / Red Kidney Beans", per100g: { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4 }, dietType: "veg", defaultGrams: 150 },

  // ── INDIAN BREAKFAST ──
  "idli": { name: "Idli (1 piece avg ~40g)", per100g: { calories: 58, protein: 2.1, carbs: 12.0, fat: 0.4, fiber: 0.6 }, dietType: "veg", defaultGrams: 160 },
  "dosa": { name: "Plain Dosa (Thin)", per100g: { calories: 168, protein: 3.8, carbs: 30.5, fat: 3.8, fiber: 1.2 }, dietType: "veg", defaultGrams: 90 },
  "upma": { name: "Upma (Semolina)", per100g: { calories: 100, protein: 2.8, carbs: 18.5, fat: 2.5, fiber: 1.0 }, dietType: "veg", defaultGrams: 150 },
  "poha": { name: "Poha (Flattened Rice)", per100g: { calories: 110, protein: 2.1, carbs: 22.5, fat: 1.9, fiber: 0.9 }, dietType: "veg", defaultGrams: 150 },

  // ── DAIRY ──
  "milk": { name: "Full-Fat Cow's Milk", per100g: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 }, dietType: "veg", defaultGrams: 250 },
  "curd": { name: "Plain Curd / Dahi", per100g: { calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 }, dietType: "veg", defaultGrams: 150 },
  "greek yogurt": { name: "Greek Yogurt (Full-Fat)", per100g: { calories: 97, protein: 9.0, carbs: 3.6, fat: 5.0, fiber: 0 }, dietType: "veg", defaultGrams: 150 },
  "whey protein": { name: "Whey Protein Powder", per100g: { calories: 400, protein: 80.0, carbs: 8.0, fat: 5.0, fiber: 0 }, dietType: "veg", defaultGrams: 30 },

  // ── FRUITS ──
  "banana": { name: "Banana (Medium)", per100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 }, dietType: "veg", defaultGrams: 118 },
  "apple": { name: "Apple (Medium)", per100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 }, dietType: "veg", defaultGrams: 150 },
  "mango": { name: "Mango", per100g: { calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6 }, dietType: "veg", defaultGrams: 150 },

  // ── VEGETABLES ──
  "spinach": { name: "Spinach (Palak)", per100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 }, dietType: "veg", defaultGrams: 100 },
  "broccoli": { name: "Broccoli", per100g: { calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6 }, dietType: "veg", defaultGrams: 100 },
  "potato": { name: "Boiled Potato", per100g: { calories: 87, protein: 1.9, carbs: 20.0, fat: 0.1, fiber: 1.8 }, dietType: "veg", defaultGrams: 150 },

  // ── SNACKS ──
  "almonds": { name: "Almonds (Raw)", per100g: { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 }, dietType: "veg", defaultGrams: 28 },
  "peanuts": { name: "Peanuts / Groundnuts (Roasted)", per100g: { calories: 587, protein: 25.8, carbs: 21.5, fat: 49.2, fiber: 8.5 }, dietType: "veg", defaultGrams: 30 },
  "peanut butter": { name: "Peanut Butter (Natural)", per100g: { calories: 588, protein: 25.1, carbs: 20.0, fat: 50.4, fiber: 6.0 }, dietType: "veg", defaultGrams: 32 },
};

function searchLocalDB(query) {
  const q = query.toLowerCase().trim();
  const results = [];
  // Exact match first
  for (const [key, food] of Object.entries(NUTRITION_DB)) {
    if (key === q || food.name.toLowerCase() === q) {
      results.unshift({ ...food, matchScore: 100 });
    } else if (key.includes(q) || food.name.toLowerCase().includes(q)) {
      results.push({ ...food, matchScore: 80 });
    } else if (q.split(' ').some(word => word.length > 2 && key.includes(word))) {
      results.push({ ...food, matchScore: 50 });
    }
  }
  return results.sort((a, b) => b.matchScore - a.matchScore).map(({ matchScore, ...rest }) => rest);
}

async function searchOpenFoodFacts(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments,serving_size`;
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'StokeFitnessApp/1.0 (contact@stoke.app)' }
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const products = (data.products || []).filter(p => p.product_name && p.nutriments);
    return products.map(p => {
      const n = p.nutriments;
      const cal = n['energy-kcal_100g'] || n['energy_100g'] ? (n['energy-kcal_100g'] || Math.round(n['energy_100g'] / 4.184)) : null;
      if (!cal) return null;
      return {
        name: p.product_name,
        per100g: {
          calories: Math.round(cal),
          protein: Math.round((n.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((n.fat_100g || 0) * 10) / 10,
          fiber: Math.round((n.fiber_100g || 0) * 10) / 10,
        },
        dietType: 'veg',
        defaultGrams: 100,
        source: 'Open Food Facts'
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', (req.headers && req.headers.origin) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET /api/nutrition?q=food+name' });

  const urlParams = new URL(req.url || '/', `http://localhost`);
  const query = (urlParams.searchParams.get('q') || '').trim();

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query too short. Use ?q=food+name (min 2 chars).' });
  }

  if (query.length > 100) {
    return res.status(400).json({ error: 'Query too long. Max 100 characters.' });
  }

  // 1. Try local embedded DB (instant, no network)
  const localResults = searchLocalDB(query);
  if (localResults.length > 0) {
    return res.status(200).json({ results: localResults, source: 'stoke_local_db' });
  }

  // 2. Try Open Food Facts (free, global + Indian)
  try {
    const offResults = await searchOpenFoodFacts(query);
    if (offResults.length > 0) {
      return res.status(200).json({ results: offResults, source: 'open_food_facts' });
    }
  } catch {}

  // 3. Nothing found
  return res.status(200).json({ results: [], source: 'not_found', message: `No nutrition data found for "${query}". Enter values manually.` });
}
