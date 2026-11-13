const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('if (view === "google_confirm")');
if (idx !== -1) {
  console.log("From google_confirm onwards:\n");
  console.log(html.slice(idx, idx + 4000));
} else {
  console.log("not found");
}
