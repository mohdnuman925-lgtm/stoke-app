const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /tab\s*===?\s*["']([^"']+)["']/g;
const tabs = new Set();
let match;
while ((match = regex.exec(html)) !== null) {
  tabs.add(match[1]);
}

console.log("Tabs found in index.html:", Array.from(tabs));
