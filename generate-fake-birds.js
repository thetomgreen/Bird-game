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
const TOTAL     = 100;
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

const TYPE_HABITAT = {
  warbler:'small insectivorous bird in dense vegetation',cisticola:'tiny grassland warbler',
  prinia:'small long-tailed warbler in scrub',finch:'seed-eating bird with a stout bill',
  tanager:'colourful forest bird with a thick bill',sparrow:'small ground-feeding bird',
  flycatcher:'perch-hunting insectivore with an upright posture',vireo:'small canopy bird',
  thrush:'medium-sized ground forager with a spotted breast',wren:'tiny energetic bird with a cocked tail',
  nuthatch:'compact tree-climbing bird with a strong bill',kingfisher:'bright-coloured bird with a large dagger-like bill near water',
  hawk:'medium raptor with broad wings',dove:'plump gentle bird with a small head',
  plover:'compact shorebird with a short bill',heron:'tall wading bird with a long neck and dagger bill',
  bunting:'seed-eating bird with colourful plumage',grosbeak:'large-billed seed-crushing bird',
  swallow:'sleek aerial insectivore with long wings',pipit:'slim ground-walking bird',
  babbler:'lively forest bird often seen in groups',sunbird:'small nectar-feeding bird with a curved bill and iridescent plumage',
  honeyeater:'medium forest bird with a brush-tipped tongue',fulvetta:'small forest babbler',
  niltava:'small blue-and-orange flycatcher in dark forest understorey','tit-babbler':'small active babbler in dense scrub',
  'wren-babbler':'tiny secretive babbler on the forest floor','bush-warbler':'shy brown warbler in undergrowth',
  'reed-warbler':'slender reed-bed warbler','foliage-gleaner':'brown furnariid gleaning insects from leaves',
  woodcreeper:'brown bark-climbing furnariid',antshrike:'stocky antbird with a hooked bill in forest understorey',
  antpitta:'round, virtually tail-less ground bird that bobs',laughingthrush:'medium noisy forest babbler',
  puffbird:'rotund insectivore with a large head perched on bare branches',nunlet:'tiny brown puffbird',
  spinetail:'long-tailed furnariid in grassland',thornbill:'tiny Australian warbler',
  broadbill:'broad-billed forest bird with vivid colours',flowerpecker:'tiny berry-eating forest bird',
  'bee-eater':'sleek colourful bird catching insects in flight','tit-babbler':'active babbler in dense bamboo',
  malimbe:'red-and-black weaver in forest','pytilia':'small colourful African waxbill',
  firefinch:'tiny red African waxbill',indigobird:'small parasitic finch',
  drongo:'glossy black fork-tailed bird perching prominently',chat:'small ground or rock bird',
  robin:'small round forest bird',redstart:'small insectivore with a quivering rufous tail',
  wheatear:'open-country chat with a distinctive white rump',nightjar:'cryptic nocturnal bird resting on bare ground',
  pitta:'jewel-like colourful ground bird',barbet:'thick-billed fruit-eating forest bird',
  woodpecker:'tree-drumming bird with a chisel bill',trogon:'perch-sitting forest bird with brilliant green and red plumage',
  lark:'streaked ground bird of open country',hawk:'broad-winged soaring raptor',
  shrike:'hooked-billed predatory perching bird',diver:'streamlined aquatic bird',
  runner:'fast-running ground bird',bird:'perching bird',finch:'stout-billed seed-eater',
  wren:'tiny energetic bird',chat:'small ground bird',warbler:'small leaf-gleaning bird',
  swift:'aerially adapted fast-flying bird',tern:'graceful seabird',
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
      console.log(`  ↳ progress saved (${entries.length} images)\n`);
    }

    i++;
    if (success && entries.length < TOTAL) await sleep(DELAY_MS);
  }

  updateGameJs(entries);
  console.log(`\nDone! ${entries.length} images. game.js updated.`);
}

main().catch(err => { console.error('\nFatal error:', err); process.exit(1); });
