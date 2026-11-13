const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf("'profile'", pos)) !== -1) {
  console.log("Found 'profile' at", pos, ":\n", html.slice(pos - 100, pos + 250));
  pos += 9;
}
while ((pos = html.indexOf('"profile"', pos)) !== -1) {
  console.log("Found \"profile\" at", pos, ":\n", html.slice(pos - 100, pos + 250));
  pos += 9;
}
