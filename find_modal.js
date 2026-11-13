const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('{activeModal === "profile" && (');
if (idx !== -1) {
  console.log("Found modal at pos", idx);
  console.log(html.slice(idx - 100, idx + 500));
} else {
  console.log("not found");
}
