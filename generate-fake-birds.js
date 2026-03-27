#!/usr/bin/env node
// generate-fake-birds.js — generate AI images of fictional birds using OpenAI DALL-E
//
// Usage:
//   OPENAI_API_KEY=sk-... node generate-fake-birds.js
//
// Generates 100 fictional bird images and saves them to fake-bird-images/.
// Also updates the FAKE_BIRD_IMAGES array in game.js so they're available in-game.
//
// Cost: ~$4 for 100 images at DALL-E 3 standard quality ($0.04/image at 1024x1024).
// Takes ~15 minutes (rate limit ~5 images/min on free tier).

const fs    = require('fs');
const https = require('https');
const path  = require('path');

const API_KEY   = process.env.OPENAI_API_KEY;
const OUT_DIR   = path.join(__dirname, 'fake-bird-images');
const GAME_FILE = path.join(__dirname, 'game.js');
const TOTAL     = 100;
const DELAY_MS  = 12000; // 12s between requests to stay under rate limits

if (!API_KEY) {
  console.error('Error: Set OPENAI_API_KEY environment variable.');
  console.error('  OPENAI_API_KEY=sk-... node generate-fake-birds.js');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Bird description prompts — varied styles for visual diversity
const BIRD_STYLES = [
  'perched on a mossy branch in a tropical rainforest',
  'wading in shallow wetlands at golden hour',
  'in flight against a clear blue sky',
  'perched on a snow-covered pine branch',
  'foraging on a rocky shoreline',
  'sitting in tall savanna grass',
  'perched on a flowering branch in spring',
  'standing on a sandy beach at sunrise',
  'in a misty mountain forest',
  'perched on a wooden fence post in a meadow',
];

const BIRD_FEATURES = [
  'vibrant plumage with iridescent feathers',
  'striking crest and long tail feathers',
  'muted earth-tone feathers with subtle patterns',
  'bold black and white markings',
  'bright tropical coloring with a curved beak',
  'speckled brown feathers and sharp eyes',
  'colorful breast with dark wings',
  'sleek grey plumage with a yellow eye ring',
  'rufous and cream patterning with barred wings',
  'deep blue and green iridescent feathers',
  'orange and black plumage with a short stout bill',
  'pale cream with delicate streaking',
  'rich chestnut body with a contrasting pale head',
  'olive-green with a bright yellow belly',
  'dark glossy plumage with a red patch',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generatePrompt(index) {
  const style = BIRD_STYLES[index % BIRD_STYLES.length];
  const features = pick(BIRD_FEATURES);
  return `A realistic wildlife photograph of a fictional bird species, ${style}. The bird has ${features}. Natural lighting, sharp focus, National Geographic photography style. No text or labels.`;
}

async function generateImage(prompt) {
  const body = JSON.stringify({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    response_format: 'url',
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) { reject(new Error(json.error.message)); return; }
          resolve(json.data[0].url);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const follow = (u) => {
      https.get(u, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          fs.writeFileSync(filepath, Buffer.concat(chunks));
          resolve();
        });
      }).on('error', reject);
    };
    follow(url);
  });
}

function updateGameJs(filenames) {
  let src = fs.readFileSync(GAME_FILE, 'utf8');
  const arrayStr = JSON.stringify(filenames, null, 2);
  src = src.replace(
    /const FAKE_BIRD_IMAGES = \[.*?\];/s,
    `const FAKE_BIRD_IMAGES = ${arrayStr};`
  );
  fs.writeFileSync(GAME_FILE, src);
}

async function main() {
  // Check what's already generated
  const existing = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).sort();
  const startFrom = existing.length;

  if (startFrom >= TOTAL) {
    console.log(`Already have ${existing.length} images. Updating game.js...`);
    updateGameJs(existing);
    console.log('Done.');
    return;
  }

  console.log(`${existing.length}/${TOTAL} images exist. Generating ${TOTAL - startFrom} more...\n`);

  for (let i = startFrom; i < TOTAL; i++) {
    const filename = `fake-bird-${String(i + 1).padStart(3, '0')}.png`;
    const filepath = path.join(OUT_DIR, filename);

    process.stdout.write(`[${i + 1}/${TOTAL}] Generating ${filename}... `);

    const prompt = generatePrompt(i);
    let retries = 3;
    while (retries > 0) {
      try {
        const url = await generateImage(prompt);
        await downloadImage(url, filepath);
        console.log('✓');
        break;
      } catch (e) {
        retries--;
        if (retries > 0) {
          console.log(`error: ${e.message}, retrying in 30s...`);
          await sleep(30000);
        } else {
          console.log(`✗ failed: ${e.message}`);
        }
      }
    }

    // Save progress to game.js every 10 images
    if ((i + 1) % 10 === 0) {
      const allFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).sort();
      updateGameJs(allFiles);
      console.log(`  ↳ progress saved (${allFiles.length} images)\n`);
    }

    if (i < TOTAL - 1) await sleep(DELAY_MS);
  }

  // Final update
  const allFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).sort();
  updateGameJs(allFiles);
  console.log(`\nDone! ${allFiles.length} images generated. game.js updated.`);
}

main().catch(err => { console.error('\nFatal error:', err); process.exit(1); });
