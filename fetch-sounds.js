#!/usr/bin/env node
// fetch-sounds.js — run once from your Mac to populate sound URLs in birds.js
//
// Usage:
//   node fetch-sounds.js
//
// Queries the xeno-canto API for each bird in BIRDS (not HARD_BIRDS — those are
// too obscure to need sounds for now). Picks the best quality recording, resolves
// the redirect to the direct MP3 URL, and patches `sound: "url"` into each entry.
// Already-populated entries are skipped so you can safely Ctrl-C and re-run.
//
// Takes ~5 minutes for 300 birds (1000ms delay to respect rate limits).

const fs    = require('fs');
const https = require('https');
const http  = require('http');

const BIRDS_FILE = __dirname + '/birds.js';
const DELAY_MS   = 1000;
const SAVE_EVERY = 20;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'BirdGame/1.0 sound-fetch-script' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 429) { reject(new Error('rate-limited')); return; }
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Follow HTTP redirect(s) to get the final direct URL
function resolveRedirect(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'BirdGame/1.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        res.resume();
        resolve(resolveRedirect(next));
      } else {
        res.resume();
        resolve(url); // return the URL where content lives (even if 200)
      }
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function pickBestRecording(recordings) {
  // Quality order: A > B > C > D > E
  const qualityRank = { A: 0, B: 1, C: 2, D: 3, E: 4 };

  // Prefer song/call types over flight-call/alarm/chip etc.
  const goodTypes = ['song', 'call', 'calls', 'song, call'];

  // Parse "m:ss" or "m:ss.s" length string to seconds
  function toSecs(len) {
    if (!len) return 999;
    const parts = len.split(':').map(Number);
    return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
  }

  return recordings
    .filter(r => {
      const secs = toSecs(r.length);
      return secs >= 3 && secs <= 180; // 3s–3min
    })
    .sort((a, b) => {
      // 1. Quality
      const qDiff = (qualityRank[a.q] ?? 5) - (qualityRank[b.q] ?? 5);
      if (qDiff !== 0) return qDiff;
      // 2. Prefer song/call types
      const aGood = goodTypes.some(t => a.type?.toLowerCase().includes(t)) ? 0 : 1;
      const bGood = goodTypes.some(t => b.type?.toLowerCase().includes(t)) ? 0 : 1;
      if (aGood !== bGood) return aGood - bGood;
      // 3. Prefer shorter recordings (easier to sample)
      return toSecs(a.length) - toSecs(b.length);
    })[0] || null;
}

async function fetchSoundUrl(name) {
  const q = encodeURIComponent(name);
  let data;
  try {
    data = await get(`https://xeno-canto.org/api/2/recordings?query=${q}&page=1`);
  } catch (e) {
    console.error(`  API error for "${name}": ${e.message}`);
    return null;
  }

  const recordings = data.recordings || [];
  if (!recordings.length) {
    console.log(`  No recordings found for "${name}"`);
    return null;
  }

  const best = pickBestRecording(recordings);
  if (!best) {
    console.log(`  No suitable recording for "${name}" (${recordings.length} found but none usable)`);
    return null;
  }

  try {
    const directUrl = await resolveRedirect(best.file);
    console.log(`  ✓ ${name} — quality:${best.q} type:${best.type} length:${best.length}`);
    return directUrl;
  } catch (e) {
    console.error(`  Redirect error for "${name}": ${e.message}`);
    // Fall back to the redirect URL itself — browser can follow it
    return best.file;
  }
}

// ── Patch birds.js ────────────────────────────────────────────────────────────

async function main() {
  let src = fs.readFileSync(BIRDS_FILE, 'utf8');

  // Extract bird names that don't yet have a sound field
  // Match: { name: "X", (no sound field before photo)
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

    const url = await fetchSoundUrl(name);

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
