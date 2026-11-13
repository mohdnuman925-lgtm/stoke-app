const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('if (view === "google_picker")');
if (idx !== -1) {
  console.log("From google_picker:\n");
  console.log(html.slice(idx, idx + 3500));
} else {
  console.log("not found");
}
