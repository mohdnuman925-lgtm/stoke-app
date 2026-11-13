const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log("Athlete Profile Login in file:", html.includes("Athlete Profile Login"));
console.log("profile_login modal in file:", html.includes('activeModal === "profile_login"'));
console.log("onSwitchAccount in file:", html.includes("onSwitchAccount"));
