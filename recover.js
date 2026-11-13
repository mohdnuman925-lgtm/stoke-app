const fs = require('fs');
const readline = require('readline');

async function findState() {
  const fileStream = fs.createReadStream('C:/Users/HOME/.gemini/antigravity-ide/brain/49014abe-8d35-4128-b6a6-ed444c26c296/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let target = null;
  for await (const line of rl) {
    if (line.includes('pHelpMeal') && line.includes('pActivity') && !line.includes('recover.js')) {
      target = line;
    }
  }

  if (target) {
    const obj = JSON.parse(target);
    fs.writeFileSync('C:/Users/HOME/.gemini/antigravity-ide/scratch/stoke-app/recovered_match.json', JSON.stringify(obj, null, 2));
    console.log("WROTE recovered_match.json, step index:", obj.step_index);
  } else {
    console.log("No match found");
  }
}

findState();
