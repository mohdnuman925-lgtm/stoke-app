const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const code = scriptMatch[1];

let curly = 0, paren = 0, square = 0;
let inStr = false;
let strChar = '';
let inComment = false;
let inMultiComment = false;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const next = code[i+1];

  if (inComment) {
    if (c === '\n') inComment = false;
    continue;
  }
  if (inMultiComment) {
    if (c === '*' && next === '/') {
      inMultiComment = false;
      i++;
    }
    continue;
  }
  if (inStr) {
    if (c === '\\') {
      i++; // skip escaped
    } else if (c === strChar) {
      inStr = false;
    }
    continue;
  }

  if (c === '/' && next === '/') {
    inComment = true;
    i++;
    continue;
  }
  if (c === '/' && next === '*') {
    inMultiComment = true;
    i++;
    continue;
  }
  if (c === '"' || c === "'" || c === '`') {
    inStr = true;
    strChar = c;
    continue;
  }

  if (c === '{') curly++;
  if (c === '}') curly--;
  if (c === '(') paren++;
  if (c === ')') paren--;
  if (c === '[') square++;
  if (c === ']') square--;
}

console.log("Brackets check:", { curly, paren, square });
if (curly === 0 && paren === 0 && square === 0) {
  console.log("ALL BRACKETS ARE PERFECTLY BALANCED!");
} else {
  console.error("Bracket imbalance detected!");
}
