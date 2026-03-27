#!/usr/bin/env node
// generate-fake-birds.js — generate AI images for fake bird names using OpenAI DALL-E
//
// Usage:
//   OPENAI_API_KEY=sk-... node generate-fake-birds.js
//
// How it works:
//   1. Generates 100 fake bird names using the same word lists as the game
//   2. Builds a visual prompt for each name (extracting colour, body part, habitat, type)
//   3. Generates an image per name and saves to fake-bird-images/
//   4. Updates FAKE_BIRD_IMAGES in game.js so the game uses these name+image pairs
//      as its pool of fake birds (guaranteeing the image always matches the name)
//
// Cost: ~$4 for 100 images at DALL-E 3 standard quality ($0.04/image).
// Resumes automatically if interrupted (skips already-downloaded files).

const fs    = require('fs');
const https = require('https');
const path  = require('path');

const API_KEY   = process.env.OPENAI_API_KEY;
const OUT_DIR   = path.join(__dirname, 'fake-bird-images');
const GAME_FILE = path.join(__dirname, 'game.js');
const COUNT_ARG = parseInt(process.argv[2] || '100', 10);
const TOTAL     = isNaN(COUNT_ARG) ? 100 : COUNT_ARG;
const DELAY_MS  = 12000; // 12s gap — DALL-E 3 rate limit ~5 req/min

if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY not set.');
  console.error('  OPENAI_API_KEY=sk-... node generate-fake-birds.js');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Same word lists as fake-names.js ─────────────────────────────────────────

const PLAUSIBLE = {
  longColor: ['Pale','Golden','Black','Rufous','White','Buff','Dusky','Russet',
               'Barred','Spotted','Sooty','Ash','Ochre','Tawny'],
  longPart:  ['crowned','browed','breasted','vented','winged','backed','capped',
               'fronted','bellied','throated','billed','rumped','tailed','naped','faced'],
  longHab:   ['Dust','Whistle','Crest','Bell','Mud','Crown','Thorn','Marsh','Reed',
               'Cliff','Heath','Sedge','Gorse','Dale'],
  longType:  ['wren','finch','bird','chat','warbler','runner','shrike','diver','lark','hawk'],
  scale:     ['Lesser','Greater','Common','Northern','Southern','Eastern','Western'],
};

const SNEAKY = {
  color:    ['Yellow','Red','Black','White','Blue','Golden','Rufous','Chestnut','Olive',
              'Grey','Brown','Tawny','Orange','Cinnamon','Crimson','Indigo','Scarlet',
              'Buff','Ochre','Slate','Rusty','Sooty','Pale','Dark','Dusky'],
  bodyPart: ['crowned','throated','backed','winged','breasted','bellied','faced','headed',
              'capped','vented','rumped','tailed','billed','cheeked','eared','browed',
              'fronted','collared','naped','shouldered'],
  type:     ['Warbler','Tanager','Finch','Sparrow','Flycatcher','Vireo','Thrush','Wren',
              'Nuthatch','Kingfisher','Hawk','Dove','Plover','Heron','Bunting',
              'Grosbeak','Swallow','Pipit','Babbler','Sunbird','Honeyeater',
              'Trogon','Barbet','Woodpecker','Pitta','Cisticola','Prinia','Bulbul',
              'Chat','Robin','Redstart','Wheatear','Nightjar','Drongo'],
  scale:    ['Lesser','Greater','Common','Little','Slender','Pale','Plain'],
  geo:      ['Eastern','Western','Northern','Southern','Eurasian','African','Asian',
              'American','Himalayan','Amazonian','Andean','Sumatran','Bornean',
              'Mountain','Forest','Highland','Coastal','Island','Desert','Marsh'],
};

const ULTRA = {
  color:    [...SNEAKY.color, 'Marbled','Streaked','Scaly','Mottled','Banded','Spotted','Freckled'],
  bodyPart: [...SNEAKY.bodyPart, 'sided','mantled','lored','tipped','washed','fringed'],
  type:     ['Cisticola','Prinia','Fulvetta','Niltava','Flufftail','Tit-babbler',
              'Wren-babbler','Bush-warbler','Reed-warbler','Foliage-gleaner',
              'Woodcreeper','Antshrike','Antpitta','Laughingthrush','Puffbird',
              'Nunlet','Spinetail','Thornbill','Broadbill','Babbler',
              'Honeyeater','Flowerpecker','Sunbird','Bee-eater','Kingfisher',
              'Malimbe','Pytilia','Firefinch','Indigobird'],
  scale:    [...SNEAKY.scale],
  geo:      [...SNEAKY.geo, 'Papuan','Sulawesi','Philippine','Javan','Wallacean','Moluccan'],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Fake name generation (same logic as game) ─────────────────────────────────

function generateFakeName(difficulty) {
  const len = Math.floor(Math.random() * 3);
  if (difficulty === 'medium' || difficulty === 'hard') {
    if (len === 0) {
      return `${pick(PLAUSIBLE.longColor)}-${pick(PLAUSIBLE.longPart)} ${pick(PLAUSIBLE.longHab)}${pick(PLAUSIBLE.longType)}`;
    } else if (len === 1) {
      return `${pick(PLAUSIBLE.scale)} ${pick(PLAUSIBLE.longColor)}-${pick(PLAUSIBLE.longPart)} ${pick(PLAUSIBLE.longHab)}${pick(PLAUSIBLE.longType)}`;
    } else {
      return `${pick(PLAUSIBLE.scale)} ${pick(PLAUSIBLE.longHab)}${pick(PLAUSIBLE.longType)}`;
    }
  } else if (difficulty === 'expert') {
    if (len === 0) return `${pick(ULTRA.color)}-${pick(ULTRA.bodyPart)} ${pick(ULTRA.type)}`;
    if (len === 1) return `${pick(ULTRA.scale)} ${pick(ULTRA.color)}-${pick(ULTRA.bodyPart)} ${pick(ULTRA.type)}`;
    return `${pick(ULTRA.geo)} ${pick(ULTRA.color)}-${pick(ULTRA.bodyPart)} ${pick(ULTRA.type)}`;
  } else {
    // easy — sneaky-style names (silly names don't photograph well)
    if (len === 0) return `${pick(SNEAKY.color)}-${pick(SNEAKY.bodyPart)} ${pick(SNEAKY.type)}`;
    if (len === 1) return `${pick(SNEAKY.scale)} ${pick(SNEAKY.color)}-${pick(SNEAKY.bodyPart)} ${pick(SNEAKY.type)}`;
    return `${pick(SNEAKY.geo)} ${pick(SNEAKY.color)}-${pick(SNEAKY.bodyPart)} ${pick(SNEAKY.type)}`;
  }
}

// ── Prompt building from name components ──────────────────────────────────────

// Map name components to visual descriptions for the DALL-E prompt
const COLOR_MAP = {
  yellow:'yellow',red:'red',black:'black',white:'white',blue:'blue',golden:'golden-yellow',
  rufous:'rufous/chestnut-orange',chestnut:'chestnut-brown',olive:'olive-green',grey:'grey',
  gray:'grey',brown:'brown',tawny:'tawny',orange:'orange',cinnamon:'cinnamon',
  crimson:'crimson-red',indigo:'deep indigo-blue',scarlet:'scarlet-red',buff:'buff/cream',
  ochre:'ochre-yellow',slate:'slate-grey',rusty:'rusty-red',sooty:'sooty dark grey',
  pale:'pale',dark:'dark',dusky:'dusky',golden:'rich golden-yellow',marbled:'marbled patterned',
  streaked:'streaked',scaly:'scaly-patterned',mottled:'mottled',banded:'banded',
  spotted:'spotted',freckled:'freckled',barred:'barred',russet:'russet-brown',
};

const PART_MAP = {
  crowned:'on the crown/top of the head',throated:'on the throat',backed:'on the back',
  winged:'on the wings',breasted:'on the breast/chest',bellied:'on the belly/underparts',
  faced:'on the face',headed:'covering the head',capped:'as a cap on the head',
  vented:'on the vent/undertail',rumped:'on the rump',tailed:'on the tail',
  billed:'on the bill/beak',cheeked:'on the cheeks',eared:'as ear patches',
  browed:'on the brow/eyebrow',fronted:'on the forehead',collared:'as a collar',
  naped:'on the nape',shouldered:'on the shoulders',sided:'on the flanks/sides',
  mantled:'across the mantle',lored:'on the lores',tipped:'at the tips',
  washed:'washed across the plumage',fringed:'fringed at the edges',
};

// Each description includes body shape, bill shape, posture and size cues
// so DALL-E generates a silhouette that matches the bird type.
const TYPE_HABITAT = {
  // Small passerines — thin bills, slim bodies
  warbler:        'tiny slim bird with a thin pointed insect-catching bill, rounded head, short legs, perched in leafy vegetation',
  cisticola:      'tiny round-bodied grassland bird with a very short thin bill, cocked tail, stubby wings, perched on a grass stem',
  prinia:         'small slim bird with a long cocked tail, thin bill, and rounded head, perched in scrub',
  'bush-warbler': 'small secretive brown bird with a rounded body, thin bill, short rounded wings and cocked tail in dense undergrowth',
  'reed-warbler': 'slender upright bird with a thin pointed bill, flat forehead and long primary feathers, clinging to a reed stem',
  thornbill:      'tiny round-bodied bird with an extremely short thin bill and notched tail, perched in a bush',
  // Babblers — medium, social
  babbler:        'medium-sized plump bird with a slightly curved bill, strong legs, rounded wings, perched in forest undergrowth',
  fulvetta:       'small round-bodied forest bird with a short stubby bill, large eye, and short rounded tail',
  'tit-babbler':  'small active bird with a short straight bill, rounded head, and long loose tail, clinging to bamboo stems',
  'wren-babbler': 'tiny round secretive bird with almost no visible tail, short legs, and a short curved bill on the forest floor',
  laughingthrush: 'medium-sized robust bird with a strong curved bill, long rounded tail, and powerful legs in forest understorey',
  // Flycatchers — upright posture
  flycatcher:     'small bird perched bolt-upright on a bare twig, with a broad flat bill, large eyes, and a slightly peaked crown',
  niltava:        'small compact flycatcher with a broad flat bill, large eyes, upright posture, and a rounded tail, in dark forest',
  // Finches / seed-eaters — thick bills
  finch:          'small stocky bird with a thick conical seed-cracking bill, rounded head, and short strong legs',
  grosbeak:       'medium-sized chunky bird with a very large rounded seed-crushing bill and a broad head',
  bunting:        'small compact seed-eating bird with a short conical bill, rounded head, and notched tail, on open ground',
  sparrow:        'small plump ground bird with a short thick bill, rounded head, and strong scratching feet',
  indigobird:     'tiny finch-like bird with a short conical bill, compact body, and forked tail',
  pytilia:        'small waxbill with a short conical bill, bright plumage, and rounded tail',
  firefinch:      'tiny round-bodied waxbill with a very short stubby bill and a rounded tail',
  malimbe:        'medium-sized weaver with a heavy pointed bill, strong legs, and a hanging nest in forest',
  // Raptors — hooked bills, broad wings, talons
  hawk:           'medium-sized raptor with broad rounded wings, a hooked bill, fierce yellow eyes, and sharp talons perched on a branch',
  shrike:         'medium-sized predatory perching bird with a strongly hooked bill, long tail, and upright posture on an exposed perch',
  // Waterbirds — long bills/necks/legs
  heron:          'tall slender wading bird with a very long S-curved neck, long dagger-like bill, long legs, and broad wings, standing in water',
  plover:         'compact round-bodied shorebird with a short straight bill, large eye, long legs, and upright stance on open ground',
  kingfisher:     'compact stocky bird with a massive long dagger-like bill, very short tail, large head, and tiny feet near water',
  'bee-eater':    'sleek colourful bird with a long slender down-curved bill, long pointed wings, and a long central tail spike on a wire',
  swallow:        'aerodynamic bird with extremely long pointed wings, a short forked tail, a tiny bill with a wide gape, in flight',
  tern:           'slender graceful seabird with a forked tail, pointed wings, and a sharp pointed bill, hovering over water',
  diver:          'low-slung aquatic bird with a long torpedo-shaped body, pointed bill, and feet set far back, floating on water',
  // Woodpeckers / climbers
  woodpecker:     'medium-sized bird with a strong straight chisel-like bill, stiff pointed tail feathers used as a prop, and strong claws gripping a tree trunk',
  woodcreeper:    'brown tree-climbing bird with a long stiff tail, long curved bill, and strong claws pressed against bark',
  nuthatch:       'compact tree-climbing bird with a short strong bill, no visible neck, and strong feet, creeping head-first down a trunk',
  // Doves / pigeons — round and plump
  dove:           'plump round-bodied bird with a small rounded head, short bill, and short legs, walking on the ground',
  // Nightjars — flat, cryptic
  nightjar:       'flat cryptic mottled brown bird with an enormous wide gaping mouth, tiny bill, and long wings, resting on bare ground',
  // Colourful perchers
  trogon:         'medium-sized compact bird with a short rounded bill, very long square tail, upright posture, and brilliant metallic green upperparts and red belly',
  pitta:          'plump round ground bird with very strong legs, a short tail, a stout bill, and jewel-like coloured plumage standing on the forest floor',
  barbet:         'stocky compact bird with a large head, thick serrated bill, short neck, and vivid colours perched in a fruiting tree',
  broadbill:      'compact bird with a broad flat wide gaping bill, rounded head, short neck, and vivid plumage in the forest mid-storey',
  puffbird:       'rotund big-headed bird with a heavy hooked bill, short tail, and fluffy puffed-up plumage sitting motionless on a bare branch',
  nunlet:         'tiny puffbird with an oversized head, heavy hooked bill, and puffed round body sitting still on a low branch',
  sunbird:        'tiny iridescent bird with a long strongly down-curved tubular bill and pointed wings, hovering at a flower',
  honeyeater:     'medium-sized bird with a long curved bill and a brush-tipped tongue, perched on a flowering branch',
  flowerpecker:   'tiny plump berry-eating bird with a very short stubby bill, round body, and short tail perched on a berry-laden branch',
  // Antbirds / ground birds
  antshrike:      'stocky medium-sized bird with a heavy hooked bill, rounded wings, and a graduated tail, perching upright in forest undergrowth',
  antpitta:       'nearly tailless round ground bird with very long legs, a short straight bill, and an upright bobbing posture on the forest floor',
  'foliage-gleaner': 'slim brown furnariid with a slightly upturned bill, stiff tail, and strong legs, gleaning insects from dead leaves',
  spinetail:      'slim long-tailed furnariid with stiff spine-tipped tail feathers, a short bill, and strong legs in grassland',
  // Miscellaneous
  pipit:          'slim ground-walking bird with a thin insect-catching bill, long tail that constantly bobs, and long hind claw',
  lark:           'streaked brown ground bird with a short thick bill, flat head, long hind claw, and strong legs on open ground',
  thrush:         'medium-sized upright bird with a slightly curved bill, round eye, spotted breast, and strong legs foraging on the ground',
  robin:          'small round forest bird with a short thin bill, large eye, upright posture, and a rounded tail',
  redstart:       'small slim bird with a thin bill, rounded head, upright stance, and a constantly quivering rufous tail',
  wheatear:       'small upright ground bird with a short thin bill, long legs, and a bold white rump visible in flight, on rocky open ground',
  chat:           'small upright ground or rock bird with a thin bill, large eye, and a frequently cocked tail',
  vireo:          'small plump canopy bird with a slightly hooked bill, rounded head, and slow deliberate movements',
  drongo:         'medium-sized glossy black bird with a deeply forked fish-tail, hooked bill, and upright perching posture on a prominent branch',
  swift:          'aerodynamic bird with a tiny bill, very long scythe-like wings, and a short forked tail, screaming in flight',
  wren:           'tiny energetic brown bird with a cocked upright tail, rounded body, thin bill, and short rounded wings',
  runner:         'fast-running ground bird with long strong legs, an upright posture, long neck, and short wings',
  bird:           'medium-sized perching bird with a straight bill, rounded head, and strong feet gripping a branch',
  hawk:           'medium-sized raptor with broad rounded wings, a hooked bill, fierce yellow eyes, and sharp talons',
};

const GEO_HABITAT = {
  eastern:'in Asian forest',western:'in western woodland',northern:'in northern boreal forest',
  southern:'in southern shrubland',eurasian:'in European forest',african:'in African savanna',
  asian:'in Asian tropical forest',american:'in American woodland',himalayan:'in Himalayan mountain forest',
  amazonian:'in Amazonian rainforest',andean:'in Andean cloud forest',sumatran:'in Sumatran rainforest',
  bornean:'in Bornean rainforest',mountain:'on a misty mountain slope',forest:'in dense forest',
  highland:'in highland grassland',coastal:'on a rocky coastal cliff',island:'on a tropical island',
  desert:'in arid desert scrub',marsh:'in wetland marsh',papuan:'in Papuan rainforest',
  sulawesi:'in Sulawesi forest',philippine:'in Philippine rainforest',javan:'in Javan forest',
  wallacean:'in Wallacean island forest',moluccan:'in Moluccan rainforest',
};

function nameToPrompt(name) {
  const lower = name.toLowerCase();
  const words = lower.replace(/-/g, ' ').split(' ');

  // Extract colour + body part from hyphenated compound (e.g. "rufous-bellied")
  let colorDesc = '';
  let partDesc = '';
  const hyphenMatch = name.match(/(\w+)-(\w+)/);
  if (hyphenMatch) {
    const col = hyphenMatch[1].toLowerCase();
    const part = hyphenMatch[2].toLowerCase();
    colorDesc = COLOR_MAP[col] || col;
    partDesc = PART_MAP[part] || part;
  }

  // Extract bird type (last word or two for compound types)
  let typeDesc = '';
  const lastWord = words[words.length - 1];
  const lastTwo  = words.slice(-2).join('-');
  typeDesc = TYPE_HABITAT[lastTwo] || TYPE_HABITAT[lastWord] || 'perching bird';

  // Geographic/scale prefix
  let geoDesc = '';
  const firstWord = words[0];
  geoDesc = GEO_HABITAT[firstWord] || '';

  // Build the prompt
  let desc = `A realistic wildlife photograph of a ${typeDesc}`;
  if (colorDesc && partDesc) {
    desc += `, with ${colorDesc} colouring ${partDesc}`;
  } else if (colorDesc) {
    desc += `, with ${colorDesc} plumage`;
  }
  if (geoDesc) desc += `, ${geoDesc}`;
  desc += '. A pristine wilderness scene with no humans, no man-made objects, no cameras, no equipment, no technology, and no text. The bird fills the frame, sharp focus, natural daylight, blurred natural background.';

  return desc;
}

// ── API helpers ───────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
          follow(res.headers.location); return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => { fs.writeFileSync(filepath, Buffer.concat(chunks)); resolve(); });
      }).on('error', reject);
    };
    follow(url);
  });
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9-]/g, '_').replace(/__+/g, '_');
}

// ── Manifest update ───────────────────────────────────────────────────────────

function updateGameJs(entries) {
  let src = fs.readFileSync(GAME_FILE, 'utf8');
  const arrayStr = JSON.stringify(entries, null, 2);
  src = src.replace(
    /const FAKE_BIRD_IMAGES = \[[\s\S]*?\];/,
    `const FAKE_BIRD_IMAGES = ${arrayStr};`
  );
  fs.writeFileSync(GAME_FILE, src);
}

function writePreview(entries) {
  const rows = entries.map((e, i) => {
    const name = typeof e === 'string' ? e : e.name;
    const file = typeof e === 'string' ? e : e.file;
    const diff = (e && e.difficulty) || '';
    return `
    <div class="card">
      <div class="num">#${i + 1} <span class="diff">${diff}</span></div>
      <img src="fake-bird-images/${file}" alt="${name}" loading="lazy">
      <div class="name">${name}</div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Fake Bird Image Preview</title>
<style>
  body { background:#111; color:#eee; font-family:sans-serif; margin:0; padding:16px; }
  h1 { font-size:1.2rem; margin-bottom:16px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
  .card { background:#222; border-radius:10px; overflow:hidden; }
  .card img { width:100%; display:block; aspect-ratio:1; object-fit:cover; }
  .name { padding:8px 10px; font-size:0.85rem; font-weight:600; }
  .num { padding:6px 10px 0; font-size:0.75rem; color:#888; }
  .diff { color:#f0a030; font-size:0.7rem; }
</style>
</head>
<body>
<h1>Fake bird images — ${entries.length} generated</h1>
<div class="grid">${rows}
</div>
</body>
</html>`;
  fs.writeFileSync(path.join(__dirname, 'preview.html'), html);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Load existing manifest from game.js
  let existing = [];
  try {
    const src = fs.readFileSync(GAME_FILE, 'utf8');
    const m = src.match(/const FAKE_BIRD_IMAGES = (\[[\s\S]*?\]);/);
    if (m) existing = JSON.parse(m[1]);
  } catch (_) {}

  const existingNames = new Set(existing.map(e => e.name));
  const existingFiles = new Set(fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')));

  if (existing.length >= TOTAL) {
    console.log(`Already have ${existing.length} entries. Rebuilding game.js...`);
    updateGameJs(existing);
    console.log('Done.');
    return;
  }

  const toGenerate = TOTAL - existing.length;
  console.log(`${existing.length}/${TOTAL} images exist. Generating ${toGenerate} more...\n`);

  // Mix of difficulties: 25 each
  const difficulties = ['easy','medium','hard','expert'];
  const entries = [...existing];
  const usedNames = new Set(existingNames);

  let i = existing.length;
  while (entries.length < TOTAL) {
    const diff = difficulties[i % difficulties.length];
    let name;
    let attempts = 0;
    do {
      name = generateFakeName(diff);
      attempts++;
    } while (usedNames.has(name) && attempts < 50);
    usedNames.add(name);

    const file = `${safeName(name)}.png`;
    const filepath = path.join(OUT_DIR, file);

    if (existingFiles.has(file)) {
      console.log(`[${entries.length + 1}/${TOTAL}] ${name} — already exists, skipping`);
      entries.push({ name, file, difficulty: diff });
      i++;
      continue;
    }

    const prompt = nameToPrompt(name);
    process.stdout.write(`[${entries.length + 1}/${TOTAL}] ${name}\n  → ${prompt}\n  Generating... `);

    let retries = 3;
    let success = false;
    while (retries > 0) {
      try {
        const url = await generateImage(prompt);
        await downloadImage(url, filepath);
        console.log('✓');
        entries.push({ name, file, difficulty: diff });
        writePreview(entries);
        success = true;
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

    // Save progress every 10 images
    if (success && entries.length % 10 === 0) {
      updateGameJs(entries);
      writePreview(entries);
      console.log(`  ↳ progress saved (${entries.length} images)\n`);
    }

    i++;
    if (success && entries.length < TOTAL) await sleep(DELAY_MS);
  }

  updateGameJs(entries);
  writePreview(entries);
  console.log(`\nDone! ${entries.length} images. Open preview.html to review.`);
}

main().catch(err => { console.error('\nFatal error:', err); process.exit(1); });
