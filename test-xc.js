#!/usr/bin/env node
// Quick diagnostic — run on your Mac:
//   node test-xc.js
// Tests iNaturalist sound observations API

const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BirdGame/1.0' } }, res => {
      console.log(`  HTTP ${res.statusCode} → ${url.slice(0, 100)}`);
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

async function test(label, name) {
  console.log(`\n--- ${label} ---`);
  const q = encodeURIComponent(name);
  const url = `https://api.inaturalist.org/v1/observations?sounds=true&taxon_name=${q}&quality_grade=research&order_by=votes&per_page=5`;
  console.log('URL:', url);
  try {
    const d = await get(url);
    console.log('total_results:', d.total_results);
    const results = d.results || [];
    console.log('results count:', results.length);
    if (results.length > 0) {
      const obs = results[0];
      console.log('First obs id:', obs.id, '| sounds count:', (obs.sounds || []).length);
      (obs.sounds || []).forEach((snd, i) => {
        console.log(`  sound[${i}]:`, JSON.stringify({
          subtype: snd.subtype,
          file_url: snd.file_url,
          file: snd.file,
          attribution: snd.attribution,
        }));
      });
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

async function main() {
  await test('Barn Owl', 'Barn Owl');
  await test('Atlantic Puffin', 'Atlantic Puffin');
  await test('Common Loon', 'Common Loon');
  await test('Peregrine Falcon', 'Peregrine Falcon');
}

main();
