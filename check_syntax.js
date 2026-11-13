const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

if (!scriptMatch) {
  console.error("No script match!");
  process.exit(1);
}

const code = scriptMatch[1];
console.log("Script length:", code.length);
console.log("Contains emailChain:", code.includes("emailChain"));
console.log("Contains calcCal:", code.includes("calcCal"));
console.log("Contains doManualLogin:", code.includes("doManualLogin"));
console.log("Contains finishOnboarding:", code.includes("finishOnboarding"));
console.log("Contains Chain of Saved Emails:", code.includes("Chain of Saved Emails"));
console.log("Contains Chain Switcher:", code.includes("Chain Switcher"));
