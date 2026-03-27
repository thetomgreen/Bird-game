#!/usr/bin/env node
// reset-first-n.js — delete the first N manifest entries and their image files
// Usage: node reset-first-n.js [N]   (default: 20)

const fs   = require('fs');
const path = require('path');

const N         = parseInt(process.argv[2] || '20', 10);
const GAME_FILE = path.join(__dirname, 'game.js');
const OUT_DIR   = path.join(__dirname, 'fake-bird-images');

const src = fs.readFileSync(GAME_FILE, 'utf8');
const m   = src.match(/const FAKE_BIRD_IMAGES = (\[[\s\S]*?\]);/);
if (!m) { console.error('FAKE_BIRD_IMAGES not found in game.js'); process.exit(1); }

const entries  = JSON.parse(m[1]);
const toDelete = entries.slice(0, N);
const toKeep   = entries.slice(N);

for (const entry of toDelete) {
  const file = typeof entry === 'string' ? entry : entry && entry.file;
  if (file) {
    const fp = path.join(OUT_DIR, file);
    if (fs.existsSync(fp)) { fs.unlinkSync(fp); console.log(`Deleted:   ${file}`); }
    else                   { console.log(`Not found: ${file}`); }
  } else {
    console.log(`Skipping malformed entry: ${JSON.stringify(entry)}`);
  }
}

const newSrc = src.replace(
  /const FAKE_BIRD_IMAGES = \[[\s\S]*?\];/,
  `const FAKE_BIRD_IMAGES = ${JSON.stringify(toKeep, null, 2)};`
);
fs.writeFileSync(GAME_FILE, newSrc);
console.log(`\nRemoved first ${N} entries. ${toKeep.length} remain.`);
console.log('Now run: node generate-fake-birds.js');
