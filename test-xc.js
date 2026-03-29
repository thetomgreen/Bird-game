#!/usr/bin/env node
// Quick diagnostic — run on your Mac:
//   node test-xc.js
// Tests a few query formats against the xeno-canto API and shows raw results

const https = require('https');

function get(url, depth = 0) {
  if (depth > 5) return Promise.reject(new Error('too many redirects'));
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BirdGame/1.0' } }, res => {
      console.log(`  HTTP ${res.statusCode} → ${url}`);
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        res.resume();
        resolve(get(next, depth + 1));
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { console.log('Raw response:', data.slice(0, 500)); reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function test(label, url) {
  console.log(`\n--- ${label} ---`);
  console.log('URL:', url);
  try {
    const d = await get(url);
    console.log('numRecordings:', d.numRecordings);
    console.log('recordings array length:', Array.isArray(d.recordings) ? d.recordings.length : typeof d.recordings);
    if (Array.isArray(d.recordings) && d.recordings.length > 0) {
      const r = d.recordings[0];
      console.log('First recording:', { en: r.en, q: r.q, type: r.type, length: r.length, file: r.file });
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

async function main() {
  // Test with www subdomain
  await test('www + plain name', 'https://www.xeno-canto.org/api/2/recordings?query=Barn+Owl');
  await test('www + en:',        'https://www.xeno-canto.org/api/2/recordings?query=en:Barn+Owl');
  // Test API v3 (newer endpoint some sources mention)
  await test('api/3',            'https://xeno-canto.org/api/3/recordings?query=Barn+Owl');
  await test('www + api/3',      'https://www.xeno-canto.org/api/3/recordings?query=Barn+Owl');
}

main();
