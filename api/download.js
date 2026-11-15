const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Candidate paths where Vercel might store the static asset
  const candidates = [
    path.join(process.cwd(), 'public', 'Stoke.apk'),
    path.join(process.cwd(), 'Stoke.apk'),
    path.join(__dirname, '..', 'public', 'Stoke.apk'),
    path.join(__dirname, '..', 'Stoke.apk')
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="Stoke.apk"',
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=3600'
      });
      const stream = fs.createReadStream(p);
      stream.pipe(res);
      return;
    }
  }

  // Fallback: Redirect directly to GitHub raw release download
  res.writeHead(302, {
    'Location': 'https://raw.githubusercontent.com/mohdnuman925-lgtm/stoke-app/main/Stoke.apk'
  });
  res.end();
};
