const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /qStep\s*===\s*(\d+)/g;
const steps = new Set();
let match;
while ((match = regex.exec(html)) !== null) {
  steps.add(match[1]);
}

console.log("Questionnaire steps found in index.html:", Array.from(steps).sort((a,b)=>a-b));
