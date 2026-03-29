// ── Difficulty settings ───────────────────────────────────────────────────────
// Difficulty controls the STYLE of fake name, not the length.
// All three lengths (short/medium/long) appear at every difficulty level.
//
// easy   → silly/funny names (Boingbird, Wobbly Flumpwren, Greater Giggly Noodlelark)
// medium → plausible invented names (Greysnipe, Dusky Thornwren, Pale-crowned Reedwarbler)
// hard   → medium-style fakes (easier to spot against obscure real birds)
// expert → ultra-convincing fakes mimicking HARD_BIRDS compound naming patterns

let selectedDifficulty = 'auto';
let adaptiveDifficulty = 'medium';
let recentResults = [];

function getStyle() {
  return selectedDifficulty === 'auto' ? adaptiveDifficulty : selectedDifficulty;
}

function setDifficulty(level) {
  selectedDifficulty = level;
  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.level === level);
  });
  updateAdaptiveLabel();
  startGame();
}

function setDifficultyOnly(level) {
  selectedDifficulty = level;
  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.level === level);
  });
  updateAdaptiveLabel();
}

function updateAdaptiveDifficulty(correct) {
  recentResults.push(correct);
  if (recentResults.length > 5) recentResults.shift();
  if (recentResults.length < 3) return;
  const last3 = recentResults.slice(-3);
  const correct3 = last3.filter(Boolean).length;
  if (correct3 === 3) {
    if (adaptiveDifficulty === 'easy')        adaptiveDifficulty = 'medium';
    else if (adaptiveDifficulty === 'medium') adaptiveDifficulty = 'hard';
    else if (adaptiveDifficulty === 'hard')   adaptiveDifficulty = 'expert';
  } else if (correct3 <= 1) {
    if (adaptiveDifficulty === 'expert')      adaptiveDifficulty = 'hard';
    else if (adaptiveDifficulty === 'hard')   adaptiveDifficulty = 'medium';
    else if (adaptiveDifficulty === 'medium') adaptiveDifficulty = 'easy';
  }
  updateAdaptiveLabel();
}

function updateAdaptiveLabel() {
  const el = document.getElementById('adaptive-label');
  el.textContent = selectedDifficulty === 'auto' ? `(${adaptiveDifficulty})` : '';
}

// ── Fake name parts ──────────────────────────────────────────────────────────

// EASY: mildly silly — wrong-sounding names that use real bird vocabulary
const SILLY = {
  shortPre: ['Bumble','Grumble','Tumble','Stumble','Fumble','Mumble','Rumble',
             'Scruffy','Muddle','Puddle','Waddle','Dawdle','Snuffle','Sniffle',
             'Doodle','Noodle','Twiddle','Drizzle','Crumble','Hobble','Scuttle',
             'Bobble','Goggle','Boggle','Warble','Throttle','Freckle','Wobble'],
  shortSuf: ['bird','finch','wren','chat','lark','snipe','grebe','teal','swift',
             'plover','bunting','thrush','martin','booby','stint','godwit','smew'],
  medAdj:   ['Wobbly','Fluffy','Puffy','Fuzzy','Chubby','Grumpy','Sleepy',
             'Bouncy','Bumbling','Shuffling','Waddling','Sneezy','Noodly',
             'Lumpy','Sniffly','Pudgy','Teetering','Scruffy','Freckled','Ruffled',
             'Dozy','Muffled','Drooping','Squinting','Moping'],
  medNoun:  ['Doodle','Noodle','Rumble','Fumble','Tumble','Grumble','Wobble',
             'Waddle','Hobble','Muddle','Gargle','Warble','Bobble','Goggle',
             'Twiddle','Dawdle','Scuttle','Mumble','Bumble','Snuffle'],
  medSuf:   ['bird','finch','wren','chat','lark','snipe','grebe','teal',
             'plover','bunting','thrush','martin','warbler','stint'],
  longScale:['Greater','Lesser','Common','Northern','Southern','Spotted',
             'Magnificent','Slender','Broad','Pale'],
  longAdj:  ['Wobbly','Fluffy','Chubby','Bouncy','Noodly','Lumpy','Sniffly',
             'Pudgy','Teetering','Scruffy','Freckled','Ruffled','Dozy','Muffled',
             'Drooping','Squinting','Grumpy','Sleepy','Fuzzy','Sneezy'],
  longNoun: ['Doodle','Noodle','Wobble','Fumble','Grumble','Waddle','Hobble',
             'Muddle','Gargle','Warble','Bobble','Twiddle','Scuttle','Mumble'],
  longSuf:  ['bird','finch','wren','lark','chat','snipe','grebe','teal',
             'plover','bunting','thrush','warbler','stint','godwit'],
};

// MEDIUM: plausible invented names — all three lengths
const PLAUSIBLE = {
  shortPre: ['Grey','Marsh','Blotch','Fen','Dusk','Mud','Stone','Rust','Buff','Dun',
             'Brack','Mire','Tarn','Sedge','Crag','Silt','Heath','Moor','Peat','Holt',
             'Gorse','Brake','Holm','Knoll','Copse','Shale','Dale','Brae','Quag'],
  shortSuf: ['snipe','chat','wing','wren','finch','bird','bill','cap','lark','back',
             'duck','swift','tern','hawk','dive','creep','perch','brush'],
  medSimple:['Russet','Dusky','Pale','Rufous','Brown','Tawny','Sooty','Ashy',
             'Barred','Streaked','Slender','Speckled','Mottled','Dappled','Ochre',
             'Sallow','Dingy','Smudgy','Blotched','Grizzled'],
  medHyphen:['Short-billed','White-throated','Long-tailed','Red-faced','Dark-backed',
             'Thin-billed','Broad-winged','Deep-chested','Stout-legged','Sharp-winged'],
  medMod:   ['Thorn','Bell','Crow','Gap','Mud','Dust','Crest','Brush','Marsh','Stone',
             'Cliff','Reed','Fen','Clatter','Creep','Rattle','Gorse','Sedge','Mire',
             'Brake','Shale','Brack','Quag','Holt','Dale'],
  medType:  ['wren','chat','finch','bird','wing','warbler','creeper','runner','diver',
             'shrike','martin','swift','hawk','lark'],
  longColor:['Pale','Golden','Black','Rufous','White','Buff','Dusky','Russet','Streaked',
             'Barred','Spotted','Sooty','Ash','Ochre','Tawny','Smudgy','Grizzled'],
  longPart: ['crowned','browed','breasted','vented','winged','backed','capped','fronted',
             'bellied','throated','billed','rumped','tailed','naped','faced','shouldered'],
  longHab:  ['Dust','Whistle','Crest','Bell','Mud','Crown','Thorn','Creep','Marsh','Reed',
             'Cliff','Mire','Heath','Rattle','Gap','Sedge','Gorse','Brake','Dale','Shale'],
  longType: ['wren','finch','bird','chat','warbler','runner','shrike','diver','lark','hawk'],
  scale:    ['Lesser','Greater','Common','Northern','Southern','Eastern','Western','Spotted'],
};

// HARD: follows real bird naming conventions — subtle and convincing
// Three distinct formats, one per length:
//   short  → "Color-bodypart Type"            e.g. Rufous-bellied Warbler
//   medium → "Scale Color-bodypart Type"       e.g. Lesser Yellow-throated Flycatcher
//   long   → "Geographic Color-bodypart Type"  e.g. Himalayan Black-crowned Babbler
const SNEAKY = {
  color:    ['Yellow','Red','Black','White','Blue','Purple','Golden','Rufous','Chestnut',
             'Olive','Grey','Brown','Tawny','Orange','Cinnamon','Crimson','Indigo','Scarlet',
             'Buff','Ochre','Slate','Rusty','Sooty','Fulvous','Vinous','Isabelline',
             'Pale','Dark','Dusky','Ash','Ferruginous','Lavender','Umber'],
  bodyPart: ['crowned','throated','backed','winged','breasted','bellied','faced','headed',
             'capped','vented','rumped','tailed','billed','footed','cheeked','eared','browed',
             'fronted','collared','naped','shouldered','flanked','ringed','spotted','barred'],
  type:     ['Warbler','Tanager','Finch','Sparrow','Flycatcher','Vireo','Thrush','Wren',
             'Nuthatch','Kingfisher','Hummingbird','Hawk','Dove','Plover','Heron','Bunting',
             'Grosbeak','Swallow','Pipit','Babbler','Sunbird','Honeyeater','Manakin',
             'Trogon','Barbet','Woodpecker','Pitta','Monarch','Fantail','Laughingthrush',
             'Cisticola','Prinia','Bulbul','White-eye','Flowerpecker','Leafbird',
             'Chat','Robin','Redstart','Wheatear','Nightjar','Shortwing','Drongo'],
  scale:    ['Lesser','Greater','Common','Little','Slender','Pale','Plain','Streaked'],
  geo:      ['Eastern','Western','Northern','Southern','Eurasian','African','Asian',
             'American','Himalayan','Amazonian','Andean','Sumatran','Bornean',
             'Mountain','Forest','Highland','Coastal','Island','Desert','Marsh'],
};

// EXPERT: ultra-convincing — mimics HARD_BIRDS compound naming patterns
// e.g. "Rufous-bellied Cisticola", "Bornean Chestnut-backed Tit-babbler"
const ULTRA = {
  color:    [...SNEAKY.color, 'Marbled', 'Streaked', 'Scaly', 'Mottled', 'Scaled',
             'Banded', 'Barred', 'Spotted', 'Freckled', 'Flecked'],
  bodyPart: [...SNEAKY.bodyPart, 'sided', 'mantled', 'lored', 'tipped', 'washed',
             'fringed', 'streaked', 'mottled', 'scaled'],
  type:     ['Cisticola', 'Prinia', 'Fulvetta', 'Niltava', 'Flufftail', 'Tit-babbler',
             'Wren-babbler', 'Bush-warbler', 'Reed-warbler', 'Foliage-gleaner',
             'Woodcreeper', 'Antshrike', 'Antpitta', 'Laughingthrush', 'Puffbird',
             'Nunlet', 'Spinetail', 'Thornbill', 'Broadbill', 'Babbler',
             'Honeyeater', 'Flowerpecker', 'Sunbird', 'Bee-eater', 'Kingfisher',
             'Philentoma', 'Malimbe', 'Pytilia', 'Firefinch', 'Indigobird'],
  scale:    [...SNEAKY.scale],
  geo:      [...SNEAKY.geo, 'Papuan', 'Sulawesi', 'Philippine', 'Javan',
             'Wallacean', 'Moluccan', 'Sundaic'],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const usedFakeNames = new Set();

function generateFakeName() {
  let name, attempts = 0;
  const style = getStyle();
  do {
    const len = Math.floor(Math.random() * 3); // 0=short, 1=medium, 2=long
    if (style === 'easy') {
      if (len === 0) {
        name = pick(SILLY.shortPre) + pick(SILLY.shortSuf);
      } else if (len === 1) {
        name = `${pick(SILLY.medAdj)} ${pick(SILLY.medNoun)}${pick(SILLY.medSuf)}`;
      } else {
        name = `${pick(SILLY.longScale)} ${pick(SILLY.longAdj)} ${pick(SILLY.longNoun)}${pick(SILLY.longSuf)}`;
      }
    } else if (style === 'medium') {
      // Weighted: 40% short, 40% medium, 20% long — so name length doesn't give away the fake
      const medLen = Math.random() < 0.4 ? 0 : Math.random() < 0.67 ? 1 : 2;
      if (medLen === 0) {
        name = pick(PLAUSIBLE.shortPre) + pick(PLAUSIBLE.shortSuf);
      } else if (medLen === 1) {
        const adj = Math.random() < 0.3 ? pick(PLAUSIBLE.medHyphen) : pick(PLAUSIBLE.medSimple);
        name = `${adj} ${pick(PLAUSIBLE.medMod)}${pick(PLAUSIBLE.medType)}`;
      } else {
        if (Math.random() < 0.5) {
          name = `${pick(PLAUSIBLE.longColor)}-${pick(PLAUSIBLE.longPart)} ${pick(PLAUSIBLE.longHab)}${pick(PLAUSIBLE.longType)}`;
        } else {
          name = `${pick(PLAUSIBLE.scale)} ${pick(PLAUSIBLE.longHab)}${pick(PLAUSIBLE.longType)}`;
        }
      }
    } else if (style === 'expert') {
      // Ultra-convincing — mimics HARD_BIRDS compound naming patterns
      if (len === 0) {
        name = `${pick(ULTRA.color)}-${pick(ULTRA.bodyPart)} ${pick(ULTRA.type)}`;
      } else if (len === 1) {
        name = `${pick(ULTRA.scale)} ${pick(ULTRA.color)}-${pick(ULTRA.bodyPart)} ${pick(ULTRA.type)}`;
      } else {
        name = `${pick(ULTRA.geo)} ${pick(ULTRA.color)}-${pick(ULTRA.bodyPart)} ${pick(ULTRA.type)}`;
      }
    } else {
      // hard (and auto-hard) — medium-style fakes, easier to spot against obscure real birds
      if (len === 0) {
        name = pick(PLAUSIBLE.shortPre) + pick(PLAUSIBLE.shortSuf);
      } else if (len === 1) {
        const adj = Math.random() < 0.3 ? pick(PLAUSIBLE.medHyphen) : pick(PLAUSIBLE.medSimple);
        name = `${adj} ${pick(PLAUSIBLE.medMod)}${pick(PLAUSIBLE.medType)}`;
      } else {
        if (Math.random() < 0.7) {
          name = `${pick(PLAUSIBLE.longColor)}-${pick(PLAUSIBLE.longPart)} ${pick(PLAUSIBLE.longHab)}${pick(PLAUSIBLE.longType)}`;
        } else {
          name = `${pick(PLAUSIBLE.scale)} ${pick(PLAUSIBLE.longHab)}${pick(PLAUSIBLE.longType)}`;
        }
      }
    }
    attempts++;
  } while (usedFakeNames.has(name) && attempts < 100);
  usedFakeNames.add(name);
  return name;
}
