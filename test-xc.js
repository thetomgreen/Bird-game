#!/usr/bin/env node
// Quick diagnostic — run on your Mac:
//   node test-xc.js
// Tests a few query formats against the xeno-canto API and shows raw results

const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BirdGame/1.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log('HTTP status:', res.statusCode);
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
  // Test a few query formats with a well-known bird
  await test('plain name',       'https://xeno-canto.org/api/2/recordings?query=Barn+Owl');
  await test('en: prefix',       'https://xeno-canto.org/api/2/recordings?query=en:Barn+Owl');
  await test('quoted en:',       'https://xeno-canto.org/api/2/recordings?query=en:%22Barn+Owl%22');
  await test('African Fish Eagle', 'https://xeno-canto.org/api/2/recordings?query=African+Fish+Eagle');
}

main();
