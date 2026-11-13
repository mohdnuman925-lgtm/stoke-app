const fs = require('fs');

const indexHtmlPath = 'c:/Users/HOME/.gemini/antigravity-ide/scratch/stoke-app/index.html';
const content = fs.readFileSync(indexHtmlPath, 'utf8');

const markerStart = '  const [pHelpMeal, setPHelpMeal] = useState("Yes, definitely");';
const markerEnd = '  /* ─────────────────────────── SIGN UP CHOICE ─────────────────────── */';

const startIndex = content.indexOf(markerStart);
const endIndex = content.indexOf(markerEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found! startIndex:", startIndex, "endIndex:", endIndex);
  process.exit(1);
}

const replacement = fs.readFileSync('c:/Users/HOME/.gemini/antigravity-ide/scratch/stoke-app/replacement.txt', 'utf8');

const updatedContent = content.slice(0, startIndex) + replacement + "\n\n" + content.slice(endIndex);
fs.writeFileSync(indexHtmlPath, updatedContent, 'utf8');
console.log("Successfully patched index.html! New length:", updatedContent.length);
