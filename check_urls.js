const fs = require('fs');
const https = require('https');

const content = fs.readFileSync('exercise_youtube_database.js', 'utf8');
const regex = /youtubeUrl:\s*"([^"]+)"/g;
let match;
const urls = [];
while ((match = regex.exec(content)) !== null) {
  urls.push(match[1]);
}
console.log('Total extracted URLs:', urls.length);

async function checkUrl(url) {
  return new Promise((resolve) => {
    const oembedUrl = 'https://www.youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json';
    const req = https.get(oembedUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let title = '';
        if (res.statusCode === 200) {
          try { title = JSON.parse(data).title; } catch(e) { title = data; }
        } else {
          title = data;
        }
        resolve({ url, status: res.statusCode, title });
      });
    });
    req.on('error', (err) => {
      resolve({ url, status: 500, title: err.message });
    });
    req.setTimeout(4000, () => {
      req.abort();
      resolve({ url, status: 408, title: 'Timeout' });
    });
  });
}

(async () => {
  for (let i = 0; i < Math.min(15, urls.length); i++) {
    const r = await checkUrl(urls[i]);
    console.log(r.status, r.url, (r.title || '').substring(0, 45));
  }
})();
