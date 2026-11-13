const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /if\s*\(\s*view\s*===?\s*["']([^"']+)["']/g;
const views = [];
let match;
while ((match = regex.exec(html)) !== null) {
  views.push(match[1]);
}

console.log("All views found in index.html:", views);
