#!/usr/bin/env node
// fetch-photos.js — run once from your machine to populate photo URLs in birds.js
//
// Usage:
//   node fetch-photos.js
//
// Queries the iNaturalist API for each bird, saves the best photo URL into
// birds.js as a `photo` field on each entry. Saves progress every 25 birds
// so you can safely Ctrl-C and re-run — already-populated entries are skipped.
//
// Takes ~6 minutes for 500 birds (700ms delay to stay under rate limits).

const fs   = require('fs');
const https = require('https');

const BIRDS_FILE = __dirname + '/birds.js';
const DELAY_MS   = 700;   // iNaturalist allows ~100 req/min unauthenticated
const SAVE_EVERY = 25;

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BirdGame/1.0 photo-fetch-script' } }, res => {
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

function normalizeName(s) {
  return s.toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\bgrey\b/g, 'gray')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesMatch(search, result) {
  const s = normalizeName(search);
  const r = normalizeName(result);
  return r === s || r.endsWith(' ' + s);
}

async function fetchPhotoUrl(name) {
  const q = encodeURIComponent(name);

  // Birds only — iconic_taxa=Aves guarantees the taxon is classified as a bird.
  // No fallback to other taxa; better to have no photo than a wrong one.
  try {
    const r = await get(
      `https://api.inaturalist.org/v1/taxa?q=${q}&iconic_taxa=Aves&per_page=5`
    );
    for (const t of (r.results || [])) {
      if (t.iconic_taxon_name !== 'Aves') continue;
      if (!t.default_photo?.medium_url) continue;
      if (!namesMatch(name, t.preferred_common_name || '')) continue;
      return t.default_photo.medium_url;
    }
  } catch (e) {
    if (e.message === 'rate-limited') throw e;
  }

  return ''; // no photo found
}

// ── Line-level patch ──────────────────────────────────────────────────────────
// Matches lines like:
//   { name: "Shoebill", fact: "..." },
//   { name: "Shoebill", fact: "...", photo: "..." },   ← already populated
const LINE_RE = /^(\s*\{ name: "([^"]+)", fact: "[^"]*")(?:, photo: "[^"]*")?( \},)$/;

function patchLine(line, url) {
  const m = line.match(LINE_RE);
  if (!m) return line;
  return `${m[1]}, photo: "${url}"${m[3]}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const src   = fs.readFileSync(BIRDS_FILE, 'utf8');
  const lines = src.split('\n');

  // Collect lines that need processing
  const work = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(LINE_RE);
    if (!m) continue;
    const alreadyHasPhoto = lines[i].includes(', photo: "') && !lines[i].includes(', photo: ""');
    work.push({ lineIndex: i, name: m[2], skip: alreadyHasPhoto });
  }

  const total   = work.length;
  const toFetch = work.filter(w => !w.skip).length;
  console.log(`${total} birds found. ${toFetch} need photos. ${total - toFetch} already have them.\n`);

  let saved = 0;
  let fetched = 0;

  for (let j = 0; j < work.length; j++) {
    const { lineIndex, name, skip } = work[j];

    if (skip) {
      process.stdout.write(`[${j+1}/${total}] ${name} — skipped (already has photo)\n`);
      continue;
    }

    process.stdout.write(`[${j+1}/${total}] ${name} ... `);

    let url = '';
    let retries = 3;
    while (retries > 0) {
      try {
        url = await fetchPhotoUrl(name);
        break;
      } catch (e) {
        if (e.message === 'rate-limited') {
          process.stdout.write(`rate limited, waiting 30s ... `);
          await sleep(30000);
          retries--;
        } else {
          break;
        }
      }
    }

    lines[lineIndex] = patchLine(lines[lineIndex], url);
    fetched++;

    console.log(url ? `✓` : `✗ (no photo found)`);

    // Save progress periodically
    if (fetched % SAVE_EVERY === 0) {
      fs.writeFileSync(BIRDS_FILE, lines.join('\n'));
      console.log(`  ↳ progress saved (${j+1}/${total} processed)\n`);
    }

    await sleep(DELAY_MS);
  }

  // Final save
  fs.writeFileSync(BIRDS_FILE, lines.join('\n'));

  const withPhoto    = lines.filter(l => LINE_RE.test(l) && l.includes(', photo: "http')).length;
  const withoutPhoto = lines.filter(l => LINE_RE.test(l) && !l.includes(', photo: "http')).length;
  console.log(`\nDone. ${withPhoto} birds have photos, ${withoutPhoto} have no photo (will be skipped in-game).`);
}

main().catch(err => { console.error('\nFatal error:', err); process.exit(1); });
