/**
 * fix_manual_meal.cjs
 * Patches index.html to fix Manual Meal Entry:
 *  1. Replaces MOCK_FOODS with a function that uses STOKE_VERIFIED_NUTRITION_DB
 *  2. Rewrites EstimateEditor to store per100g and do live recalculation
 *  3. Rewrites MealSection startManual/pickSearchResult/search to auto-load nutrition
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// PATCH 1: Replace MOCK_FOODS with a generated list from STOKE_VERIFIED_NUTRITION_DB
// that includes per100g data for live calculation
// ─────────────────────────────────────────────────────────────────────────────
const mockStart = html.indexOf('const MOCK_FOODS=[');
const mockEnd = html.indexOf('];const DEFAULT_MEAL_SLOTS', mockStart) + 1; // include the ']'

if (mockStart === -1 || mockEnd <= mockStart) {
  console.error('Could not find MOCK_FOODS array.');
  process.exit(1);
}

// New FOOD_DB constant that embeds per100g for recalculation
// When in search, we produce items with per100g stored for live grams recalculation
const NEW_FOOD_SECTION = `const MOCK_FOODS=(()=>{if(typeof STOKE_VERIFIED_NUTRITION_DB!=="undefined"){return Object.values(STOKE_VERIFIED_NUTRITION_DB).map(f=>({name:f.name,grams:f.defaultGrams||100,calories:Math.round((f.per100g.calories||0)*(f.defaultGrams||100)/100),protein:Math.round((f.per100g.protein||0)*(f.defaultGrams||100)/100*10)/10,carbs:Math.round((f.per100g.carbs||0)*(f.defaultGrams||100)/100*10)/10,fat:Math.round((f.per100g.fat||0)*(f.defaultGrams||100)/100*10)/10,fiber:Math.round((f.per100g.fiber||0)*(f.defaultGrams||100)/100*10)/10,dietType:f.dietType||"veg",per100g:f.per100g,portionDesc:f.portionDesc||""}));}return[{name:"Grilled Chicken Breast",calories:165,protein:31,carbs:0,fat:4,fiber:0,grams:100,dietType:"nonveg",per100g:{calories:165,protein:31,carbs:0,fat:4,fiber:0}},{name:"Steamed Basmati Rice",calories:130,protein:2.7,carbs:28.2,fat:0.3,fiber:0.4,grams:100,dietType:"veg",per100g:{calories:130,protein:2.7,carbs:28.2,fat:0.3,fiber:0.4}},{name:"Whole Boiled Egg",calories:155,protein:13,carbs:1.1,fat:11,fiber:0,grams:100,dietType:"nonveg",per100g:{calories:155,protein:13,carbs:1.1,fat:11,fiber:0}},{name:"Banana",calories:89,protein:1.1,carbs:23,fat:0.3,fiber:2.6,grams:100,dietType:"veg",per100g:{calories:89,protein:1.1,carbs:23,fat:0.3,fiber:2.6}},{name:"Oats (Dry)",calories:389,protein:16.9,carbs:66.3,fat:6.9,fiber:10.6,grams:100,dietType:"veg",per100g:{calories:389,protein:16.9,carbs:66.3,fat:6.9,fiber:10.6}}];})()`;

html = html.slice(0, mockStart) + NEW_FOOD_SECTION + html.slice(mockEnd);
console.log('✓ PATCH 1: MOCK_FOODS replaced with STOKE_VERIFIED_NUTRITION_DB-backed list');

// ─────────────────────────────────────────────────────────────────────────────
// PATCH 2: Replace EstimateEditor with a fixed version that:
//   - Stores per100g from item.per100g (or computes it from initial values)
//   - On grams change, recalculates using per100g data
//   - On food name change, looks up STOKE_VERIFIED_NUTRITION_DB for instant match
//   - Shows a live loading state while searching /api/nutrition
//   - Includes food name autocomplete suggestions
// ─────────────────────────────────────────────────────────────────────────────

// Find the exact current EstimateEditor source
const editorStart = html.indexOf('function EstimateEditor(');
const editorEnd = html.indexOf('function MealSection(', editorStart);

if (editorStart === -1 || editorEnd <= editorStart) {
  console.error('Could not find EstimateEditor function.');
  process.exit(1);
}

const NEW_ESTIMATE_EDITOR = `function EstimateEditor({item,onChange,onConfirm,onCancel,confirmLabel,hideActions}){const[nameSuggestions,setNameSuggestions]=useState([]);const[lookupState,setLookupState]=useState("idle");// "idle"|"loading"|"found"|"not_found"
const[nutritionSource,setNutritionSource]=useState(item.per100g?"db":"manual");const per100gRef=useRef(item.per100g||null);// If item already has per100g (from search pick), use it
// Otherwise compute from initial values (for scan results which already have correct macros)
if(!per100gRef.current&&(item.calories||item.protein)){const g=item.grams||100;per100gRef.current={calories:(item.calories||0)/g*100,protein:(item.protein||0)/g*100,carbs:(item.carbs||0)/g*100,fat:(item.fat||0)/g*100,fiber:(item.fiber||0)/g*100};}const lookupTimerRef=useRef(null);function recalcFromPer100g(newGrams,p100){if(!p100)return{};const g=Number(newGrams)||0;return{grams:g,calories:Math.round(p100.calories*g/100),protein:Math.round(p100.protein*g/100*10)/10,carbs:Math.round(p100.carbs*g/100*10)/10,fat:Math.round(p100.fat*g/100*10)/10,fiber:Math.round(p100.fiber*g/100*10)/10};}function handleChange(key,rawValue){if(key==="grams"){const newGrams=Number(rawValue)||0;if(per100gRef.current&&nutritionSource!=="manual"){const recalc=recalcFromPer100g(newGrams,per100gRef.current);onChange({...item,...recalc});}else{onChange({...item,grams:newGrams});}}else if(key==="name"){onChange({...item,name:rawValue});// Debounce search: local DB first, then optionally /api/nutrition
clearTimeout(lookupTimerRef.current);if(!rawValue||rawValue.trim().length<2){setNameSuggestions([]);setLookupState("idle");return;}// Instant local DB search
if(typeof STOKE_VERIFIED_NUTRITION_DB!=="undefined"){const q=rawValue.toLowerCase().trim();const localMatches=Object.values(STOKE_VERIFIED_NUTRITION_DB).filter(f=>f.name.toLowerCase().includes(q)||(f.category&&f.category.toLowerCase().includes(q)));if(localMatches.length>0){setNameSuggestions(localMatches.slice(0,8));setLookupState("idle");return;}}// Debounced server lookup for foods not in local DB
setLookupState("loading");lookupTimerRef.current=setTimeout(()=>{if(!rawValue||rawValue.trim().length<2){setLookupState("idle");return;}fetch("/api/nutrition?q="+encodeURIComponent(rawValue.trim())).then(r=>r.json()).then(data=>{if(data.results&&data.results.length>0){setNameSuggestions(data.results.slice(0,8));setLookupState("found");}else{setNameSuggestions([]);setLookupState("not_found");}}).catch(()=>{setNameSuggestions([]);setLookupState("idle");});},600);}else{const type="number";onChange({...item,[key]:Number(rawValue)});}}function pickSuggestion(food){const g=item.grams||food.defaultGrams||100;const p100=food.per100g;per100gRef.current=p100;setNutritionSource("db");setNameSuggestions([]);setLookupState("found");const recalc=recalcFromPer100g(g,p100);onChange({...item,name:food.name,dietType:food.dietType||item.dietType,...recalc,per100g:p100});}const fields=[["name","Food","text"],["grams","Grams (g)","number"],["calories","Calories (kcal)","number"],["protein","Protein (g)","number"],["carbs","Carbs (g)","number"],["fat","Fat (g)","number"],["fiber","Fibre (g)","number"]];const hasNutrition=nutritionSource!=="manual"&&per100gRef.current;return React.createElement("div",{style:{background:TOKENS.surface2,backdropFilter:"blur(16px) saturate(180%)",WebkitBackdropFilter:"blur(16px) saturate(180%)",border:"1px solid "+TOKENS.border,borderRadius:12,padding:16,marginTop:10}},React.createElement("div",{style:{marginBottom:10}},React.createElement("label",{style:{fontSize:11,color:TOKENS.mutedFaint,display:"block",marginBottom:4}},"Type"),React.createElement("div",{style:{display:"flex",gap:8}},[["veg","🟢 Veg"],["nonveg","🟤 Non-veg"]].map(([val,lbl])=>{const active=(item.dietType||"veg")===val;return React.createElement("button",{key:val,onClick:()=>onChange({...item,dietType:val}),style:{flex:1,background:active?TOKENS.ember:TOKENS.bg,color:active?"#FFFFFF":TOKENS.text,border:"1px solid "+(active?TOKENS.ember:TOKENS.border),borderRadius:8,padding:"8px 0",fontSize:13,fontWeight:600,cursor:"pointer"}},lbl);}))),React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},fields.map(([key,label,type])=>React.createElement("div",{key:key,style:{gridColumn:key==="name"?"1 / 3":"auto",position:"relative"}},React.createElement("label",{style:{fontSize:11,color:TOKENS.mutedFaint,display:"block",marginBottom:4}},label,key==="grams"&&React.createElement("span",{style:{color:hasNutrition?"#237547":TOKENS.mutedFaint}},hasNutrition?" (auto-calculates macros)":" (enter macros manually)")),React.createElement("input",{type:type,value:item[key]??"",placeholder:key==="name"?"Search food (e.g. Oats, Chicken, Rice)...":"",onChange:e=>handleChange(key,e.target.value),autoComplete:"off",style:{width:"100%",background:TOKENS.bg,border:"1px solid "+(key==="name"&&lookupState==="not_found"?"#D14343":TOKENS.border),borderRadius:8,padding:"8px 10px",color:TOKENS.text,fontSize:14,boxSizing:"border-box"}}),key==="name"&&lookupState==="loading"&&React.createElement("div",{style:{position:"absolute",right:10,top:28,fontSize:11,color:TOKENS.mutedFaint}},"Searching..."),key==="name"&&lookupState==="not_found"&&React.createElement("div",{style:{fontSize:11,color:"#D14343",marginTop:3}},"Food not found in database — enter macros manually below."),key==="name"&&nameSuggestions.length>0&&React.createElement("div",{style:{position:"absolute",top:"100%",left:0,right:0,background:TOKENS.bg,border:"1px solid "+TOKENS.border,borderRadius:8,zIndex:200,maxHeight:220,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.3)",marginTop:2}},nameSuggestions.map((f,i)=>React.createElement("div",{key:i,onClick:()=>pickSuggestion(f),style:{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",cursor:"pointer",borderBottom:i<nameSuggestions.length-1?"1px solid "+TOKENS.border:"none",fontSize:13,color:TOKENS.text}},React.createElement(VegDot,{type:f.dietType}),React.createElement("div",null,React.createElement("div",{style:{fontWeight:600}},f.name),React.createElement("div",{style:{fontSize:11,color:TOKENS.mutedFaint}},Math.round(f.per100g.calories)+" kcal · P"+f.per100g.protein+"g · C"+f.per100g.carbs+"g · F"+f.per100g.fat+"g per 100g"+(f.portionDesc?" · "+f.portionDesc:""))))))))),hasNutrition&&React.createElement("div",{style:{marginTop:8,padding:"8px 10px",background:"rgba(35,117,71,0.08)",border:"1px solid rgba(35,117,71,0.25)",borderRadius:8,fontSize:11.5,color:"#237547",display:"flex",alignItems:"center",gap:6}},React.createElement("span",null,"✓"),"Auto-calculated from verified nutrition data · Change grams to recalculate"),!hideActions&&React.createElement("div",{style:{display:"flex",gap:10,marginTop:14}},React.createElement("button",{onClick:onConfirm,style:{flex:1,background:TOKENS.ember,color:"var(--text-primary)",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:14,cursor:"pointer"}},confirmLabel),React.createElement("button",{onClick:onCancel,style:{flex:"0 0 auto",background:"transparent",color:TOKENS.muted,border:"1px solid "+TOKENS.border,borderRadius:8,padding:"10px 16px",fontSize:14,cursor:"pointer"}},"Cancel")));}`;

html = html.slice(0, editorStart) + NEW_ESTIMATE_EDITOR + '\n' + html.slice(editorEnd);
console.log('✓ PATCH 2: EstimateEditor rewritten with live per100g calculation and food search autocomplete');

// ─────────────────────────────────────────────────────────────────────────────
// PATCH 3: Fix startManual, pickSearchResult, filteredFoods in MealSection
// ─────────────────────────────────────────────────────────────────────────────

// Fix startManual: start in "search" mode so user searches first, not with blank zeros
const OLD_START_MANUAL = 'function startManual(){setDraft({name:\"\",grams:100,calories:0,protein:0,carbs:0,fat:0,fiber:0,dietType:\"veg\"});setMode(\"manual-review\");}';
const NEW_START_MANUAL = `function startManual(){setDraft({name:"",grams:100,calories:0,protein:0,carbs:0,fat:0,fiber:0,dietType:"veg",per100g:null});setMode("manual-review");}`;

if (html.includes(OLD_START_MANUAL)) {
  html = html.replace(OLD_START_MANUAL, NEW_START_MANUAL);
  console.log('✓ PATCH 3a: startManual updated');
} else {
  console.warn('⚠ PATCH 3a: startManual target not found — skipping');
}

// Fix pickSearchResult: include per100g when picking from search results
const OLD_PICK_SEARCH = 'function pickSearchResult(food){setDraft({...food});setMode(\"manual-review\");}';
const NEW_PICK_SEARCH = `function pickSearchResult(food){const g=food.grams||food.defaultGrams||100;const p100=food.per100g||(food.grams?{calories:food.calories/food.grams*100,protein:food.protein/food.grams*100,carbs:food.carbs/food.grams*100,fat:food.fat/food.grams*100,fiber:food.fiber/food.grams*100}:null);const recalc=p100?{calories:Math.round(p100.calories*g/100),protein:Math.round(p100.protein*g/100*10)/10,carbs:Math.round(p100.carbs*g/100*10)/10,fat:Math.round(p100.fat*g/100*10)/10,fiber:Math.round(p100.fiber*g/100*10)/10}:{};setDraft({...food,...recalc,grams:g,per100g:p100});setMode("manual-review");}`;

if (html.includes(OLD_PICK_SEARCH)) {
  html = html.replace(OLD_PICK_SEARCH, NEW_PICK_SEARCH);
  console.log('✓ PATCH 3b: pickSearchResult updated with per100g forwarding');
} else {
  console.warn('⚠ PATCH 3b: pickSearchResult target not found — skipping');
}

// Fix filteredFoods: use STOKE_VERIFIED_NUTRITION_DB instead of MOCK_FOODS
const OLD_FILTERED = 'const filteredFoods=MOCK_FOODS.filter(f=>f.name.toLowerCase().includes(searchTerm.toLowerCase()));';
const NEW_FILTERED = `const allSearchFoods=(()=>{if(typeof STOKE_VERIFIED_NUTRITION_DB!=="undefined"){return Object.values(STOKE_VERIFIED_NUTRITION_DB).map(f=>({...f,grams:f.defaultGrams||100,calories:Math.round((f.per100g.calories||0)*(f.defaultGrams||100)/100),protein:Math.round((f.per100g.protein||0)*(f.defaultGrams||100)/100*10)/10,carbs:Math.round((f.per100g.carbs||0)*(f.defaultGrams||100)/100*10)/10,fat:Math.round((f.per100g.fat||0)*(f.defaultGrams||100)/100*10)/10,fiber:Math.round((f.per100g.fiber||0)*(f.defaultGrams||100)/100*10)/10}));}return MOCK_FOODS;})();const filteredFoods=allSearchFoods.filter(f=>f.name.toLowerCase().includes(searchTerm.toLowerCase()));`;

// Use a different way since the arrow notation might have different spacing
const OLD_FILTERED_ARROW = `const filteredFoods=MOCK_FOODS.filter(f=\u003ef.name.toLowerCase().includes(searchTerm.toLowerCase()))`;
const NEW_FILTERED_ARROW = `const allSearchFoods=(()=>{if(typeof STOKE_VERIFIED_NUTRITION_DB!=="undefined"){return Object.values(STOKE_VERIFIED_NUTRITION_DB).map(f=>({...f,grams:f.defaultGrams||100,calories:Math.round((f.per100g.calories||0)*(f.defaultGrams||100)/100),protein:Math.round((f.per100g.protein||0)*(f.defaultGrams||100)/100*10)/10,carbs:Math.round((f.per100g.carbs||0)*(f.defaultGrams||100)/100*10)/10,fat:Math.round((f.per100g.fat||0)*(f.defaultGrams||100)/100*10)/10,fiber:Math.round((f.per100g.fiber||0)*(f.defaultGrams||100)/100*10)/10}));}return MOCK_FOODS;})();const filteredFoods=allSearchFoods.filter(f=>f.name.toLowerCase().includes(searchTerm.toLowerCase()))`;

if (html.includes(OLD_FILTERED_ARROW)) {
  html = html.replace(OLD_FILTERED_ARROW, NEW_FILTERED_ARROW);
  console.log('✓ PATCH 3c: filteredFoods now uses full STOKE_VERIFIED_NUTRITION_DB');
} else {
  console.warn('⚠ PATCH 3c: filteredFoods target not found in html, trying alternate');
  // Try alternate
  if (html.includes('MOCK_FOODS.filter(f=>f.name')) {
    html = html.replace('MOCK_FOODS.filter(f=>f.name', 'allSearchFoods.filter(f=>f.name');
    console.log('✓ PATCH 3c (alt): filteredFoods patched via alternate match');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH 4: Fix search result display - show per100g info in search list 
// ─────────────────────────────────────────────────────────────────────────────
// The search list renders: f.name + f.calories + "kcal / " + f.grams + "g"
// Make it also show macros so user can confirm it's the right food
const OLD_SEARCH_ITEM = ',f.name,\" \",/*#__PURE__*/React.createElement(\"span\",{style:{color:TOKENS.mutedFaint,fontSize:12}},\"\\xB7 \",f.calories,\" kcal / \",f.grams,\"g\")';
const NEW_SEARCH_ITEM = `,f.name," ",React.createElement("span",{style:{color:TOKENS.mutedFaint,fontSize:12}},"· ",Math.round(f.calories)," kcal · P",Math.round(f.protein||0),"g · C",Math.round(f.carbs||0),"g · ",f.grams,"g")`;

if (html.includes(OLD_SEARCH_ITEM)) {
  html = html.replace(OLD_SEARCH_ITEM, NEW_SEARCH_ITEM);
  console.log('✓ PATCH 4: Search list now shows Protein & Carbs in search results');
} else {
  console.warn('⚠ PATCH 4: Search item display target not found — skipping (not critical)');
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE PATCHED HTML
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('\n✅ index.html patched successfully!');
console.log('File size after patch:', Math.round(html.length / 1024), 'KB');
