#!/usr/bin/env node
// fetch-sounds.js — run once from your Mac to populate sound URLs in birds.js
//
// Usage:
//   node fetch-sounds.js
//
// Queries the iNaturalist API for each bird in BIRDS. Picks the best quality
// observation with a sound, and patches `sound: "url"` into each entry.
// Already-populated entries are skipped so you can safely Ctrl-C and re-run.
//
// Takes ~5 minutes for 300 birds (1000ms delay to respect rate limits).

const fs    = require('fs');
const https = require('https');

const BIRDS_FILE = __dirname + '/birds.js';
const DELAY_MS   = 700;
const SAVE_EVERY = 20;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BirdGame/1.0 sound-fetch-script' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 429) { reject(new Error('rate-limited')); return; }
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchSoundUrl(name) {
  const q = encodeURIComponent(name);
  const url = `https://api.inaturalist.org/v1/observations?sounds=true&taxon_name=${q}&quality_grade=research&order_by=votes&per_page=10`;

  let data;
  try {
    data = await get(url);
  } catch (e) {
    console.error(`  API error for "${name}": ${e.message}`);
    return null;
  }

  const results = data.results || [];
  if (!results.length) {
    console.log(`  No observations found for "${name}"`);
    return null;
  }

  // Find first observation that has a sound with a file_url
  for (const obs of results) {
    const sounds = obs.sounds || [];
    for (const snd of sounds) {
      const fileUrl = snd.file_url || snd.file;
      if (fileUrl && /\.(mp3|ogg|wav|m4a|aac|flac)(\?|$)/i.test(fileUrl)) {
        console.log(`  ✓ ${name} — ${fileUrl.split('/').pop().slice(0, 60)}`);
        return fileUrl;
      }
      if (fileUrl) {
        // Accept any URL even without known extension
        console.log(`  ✓ ${name} — ${fileUrl.split('/').pop().slice(0, 60)}`);
        return fileUrl;
      }
    }
  }

  console.log(`  No usable sound URL for "${name}" (${results.length} obs, no file_url)`);
  return null;
}

// ── Patch birds.js ────────────────────────────────────────────────────────────

async function main() {
  let src = fs.readFileSync(BIRDS_FILE, 'utf8');

  // Extract bird names that don't yet have a sound field
  // Match: { name: "X", fame: N, fact: "...", photo:
  const needsSound = [];
  const nameRe = /\{ name: "([^"]+)", fame: \d+, fact: "[^"]*", photo:/g;
  let m;
  while ((m = nameRe.exec(src)) !== null) {
    const name = m[1];
    // Check if sound field already exists for this bird
    const entryStart = src.lastIndexOf('{ name: "' + name + '"', m.index);
    const entryEnd   = src.indexOf('}', m.index);
    const entry      = src.slice(entryStart, entryEnd);
    if (!entry.includes('sound:')) needsSound.push(name);
  }

  console.log(`\nBirds needing sound: ${needsSound.length}\n`);

  let saved = 0;
  for (let i = 0; i < needsSound.length; i++) {
    const name = needsSound[i];
    console.log(`[${i + 1}/${needsSound.length}] ${name}`);

    let url = null;
    try {
      url = await fetchSoundUrl(name);
    } catch (e) {
      console.error(`  Unexpected error for "${name}": ${e.message}`);
    }

    if (url) {
      // Patch: insert sound field after photo field
      src = src.replace(
        new RegExp(`(\\{ name: "${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*?photo: "[^"]*")`),
        `$1, sound: "${url}"`
      );
      saved++;
    }

    if (saved > 0 && saved % SAVE_EVERY === 0) {
      fs.writeFileSync(BIRDS_FILE, src);
      console.log(`  💾 Saved progress (${saved} sounds added)`);
    }

    await sleep(DELAY_MS);
  }

  fs.writeFileSync(BIRDS_FILE, src);
  console.log(`\nDone! ${saved} sound URLs added to birds.js\n`);
}

main().catch(console.error);
