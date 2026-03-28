// ── Fake bird images (pre-generated AI art) ─────────────────────────────────
// Populated by generate-fake-birds.js — each entry is { name, file, difficulty }
// The game uses the pre-generated name so the image always matches.
const FAKE_BIRD_IMAGES = [
  {
    "name": "Slate-rumped Vireo",
    "file": "Slate-rumped_Vireo.png",
    "difficulty": "medium"
  },
  {
    "name": "Black-winged Thornrunner",
    "file": "Black-winged_Thornrunner.png",
    "difficulty": "medium"
  },
  {
    "name": "Western Crestwren",
    "file": "Western_Crestwren.png",
    "difficulty": "hard"
  },
  {
    "name": "Scarlet-washed Nunlet",
    "file": "Scarlet-washed_Nunlet.png",
    "difficulty": "expert"
  },
  {
    "name": "Ochre-breasted Babbler",
    "file": "Ochre-breasted_Babbler.png",
    "difficulty": "medium"
  },
  {
    "name": "Golden-capped Cliffhawk",
    "file": "Golden-capped_Cliffhawk.png",
    "difficulty": "medium"
  },
  {
    "name": "Western Dusky-bellied Crownshrike",
    "file": "Western_Dusky-bellied_Crownshrike.png",
    "difficulty": "hard"
  },
  {
    "name": "Scarlet-shouldered Woodcreeper",
    "file": "Scarlet-shouldered_Woodcreeper.png",
    "difficulty": "expert"
  },
  {
    "name": "Scarlet-winged Sparrow",
    "file": "Scarlet-winged_Sparrow.png",
    "difficulty": "medium"
  },
  {
    "name": "Greater Sooty-faced Whistleshrike",
    "file": "Greater_Sooty-faced_Whistleshrike.png",
    "difficulty": "medium"
  },
  {
    "name": "Black-vented Belllark",
    "file": "Black-vented_Belllark.png",
    "difficulty": "hard"
  },
  {
    "name": "Sooty-throated Thornbill",
    "file": "Sooty-throated_Thornbill.png",
    "difficulty": "expert"
  },
  {
    "name": "Highland Indigo-headed Finch",
    "file": "Highland_Indigo-headed_Finch.png",
    "difficulty": "medium"
  },
  {
    "name": "Southern Buff-crowned Gorsewarbler",
    "file": "Southern_Buff-crowned_Gorsewarbler.png",
    "difficulty": "medium"
  },
  {
    "name": "Golden-bellied Crowndiver",
    "file": "Golden-bellied_Crowndiver.png",
    "difficulty": "hard"
  },
  {
    "name": "Dark-rumped Foliage-gleaner",
    "file": "Dark-rumped_Foliage-gleaner.png",
    "difficulty": "expert"
  },
  {
    "name": "Slender Red-billed Redstart",
    "file": "Slender_Red-billed_Redstart.png",
    "difficulty": "medium"
  },
  {
    "name": "Western Rufous-winged Gorsewren",
    "file": "Western_Rufous-winged_Gorsewren.png",
    "difficulty": "medium"
  },
  {
    "name": "Common Golden-breasted Sedgediver",
    "file": "Common_Golden-breasted_Sedgediver.png",
    "difficulty": "hard"
  },
  {
    "name": "Grey-faced Thornbill",
    "file": "Grey-faced_Thornbill.png",
    "difficulty": "expert"
  },
  {
    "name": "Cinnamon-throated Pitta",
    "file": "Cinnamon-throated_Pitta.png",
    "difficulty": "medium"
  },
  {
    "name": "Dusky-rumped Marshrunner",
    "file": "Dusky-rumped_Marshrunner.png",
    "difficulty": "medium"
  },
  {
    "name": "White-fronted Thorndiver",
    "file": "White-fronted_Thorndiver.png",
    "difficulty": "hard"
  },
  {
    "name": "Scarlet-winged Bee-eater",
    "file": "Scarlet-winged_Bee-eater.png",
    "difficulty": "expert"
  },
  {
    "name": "Bornean Olive-fronted Nightjar",
    "file": "Bornean_Olive-fronted_Nightjar.png",
    "difficulty": "medium"
  },
  {
    "name": "Pale-winged Marshbird",
    "file": "Pale-winged_Marshbird.png",
    "difficulty": "medium"
  },
  {
    "name": "Southern Gorsewarbler",
    "file": "Southern_Gorsewarbler.png",
    "difficulty": "hard"
  },
  {
    "name": "Dark-cheeked Laughingthrush",
    "file": "Dark-cheeked_Laughingthrush.png",
    "difficulty": "expert"
  },
  {
    "name": "Island Dark-tailed Wren",
    "file": "Island_Dark-tailed_Wren.png",
    "difficulty": "medium"
  },
  {
    "name": "Rufous-billed Dalewarbler",
    "file": "Rufous-billed_Dalewarbler.png",
    "difficulty": "medium"
  },
  {
    "name": "Common Reedchat",
    "file": "Common_Reedchat.png",
    "difficulty": "hard"
  },
  {
    "name": "Grey-throated Wren-babbler",
    "file": "Grey-throated_Wren-babbler.png",
    "difficulty": "expert"
  },
  {
    "name": "Chestnut-collared Bunting",
    "file": "Chestnut-collared_Bunting.png",
    "difficulty": "medium"
  },
  {
    "name": "Eastern Thornwarbler",
    "file": "Eastern_Thornwarbler.png",
    "difficulty": "medium"
  },
  {
    "name": "Northern Dalefinch",
    "file": "Northern_Dalefinch.png",
    "difficulty": "hard"
  },
  {
    "name": "Little Rufous-collared Indigobird",
    "file": "Little_Rufous-collared_Indigobird.png",
    "difficulty": "expert"
  },
  {
    "name": "Coastal Grey-crowned Babbler",
    "file": "Coastal_Grey-crowned_Babbler.png",
    "difficulty": "medium"
  },
  {
    "name": "Barred-browed Gorsechat",
    "file": "Barred-browed_Gorsechat.png",
    "difficulty": "medium"
  },
  {
    "name": "Lesser Sedgehawk",
    "file": "Lesser_Sedgehawk.png",
    "difficulty": "hard"
  },
  {
    "name": "Little Scarlet-eared Indigobird",
    "file": "Little_Scarlet-eared_Indigobird.png",
    "difficulty": "expert"
  },
  {
    "name": "Golden-winged Chat",
    "file": "Golden-winged_Chat.png",
    "difficulty": "medium"
  },
  {
    "name": "Southern Barred-throated Mudshrike",
    "file": "Southern_Barred-throated_Mudshrike.png",
    "difficulty": "medium"
  },
  {
    "name": "Ash-bellied Thornhawk",
    "file": "Ash-bellied_Thornhawk.png",
    "difficulty": "hard"
  },
  {
    "name": "Indigo-crowned Nunlet",
    "file": "Indigo-crowned_Nunlet.png",
    "difficulty": "expert"
  },
  {
    "name": "Olive-bellied Barbet",
    "file": "Olive-bellied_Barbet.png",
    "difficulty": "medium"
  },
  {
    "name": "Tawny-tailed Crestfinch",
    "file": "Tawny-tailed_Crestfinch.png",
    "difficulty": "medium"
  },
  {
    "name": "Pale-throated Crestwarbler",
    "file": "Pale-throated_Crestwarbler.png",
    "difficulty": "hard"
  },
  {
    "name": "Amazonian Crimson-sided Cisticola",
    "file": "Amazonian_Crimson-sided_Cisticola.png",
    "difficulty": "expert"
  },
  {
    "name": "Little Blue-browed Grosbeak",
    "file": "Little_Blue-browed_Grosbeak.png",
    "difficulty": "medium"
  },
  {
    "name": "Buff-fronted Reedshrike",
    "file": "Buff-fronted_Reedshrike.png",
    "difficulty": "medium"
  },
  {
    "name": "White-backed Bellwarbler",
    "file": "White-backed_Bellwarbler.png",
    "difficulty": "hard"
  },
  {
    "name": "Dark-washed Bee-eater",
    "file": "Dark-washed_Bee-eater.png",
    "difficulty": "expert"
  },
  {
    "name": "Chestnut-browed Flycatcher",
    "file": "Chestnut-browed_Flycatcher.png",
    "difficulty": "medium"
  },
  {
    "name": "Barred-capped Thornbird",
    "file": "Barred-capped_Thornbird.png",
    "difficulty": "medium"
  },
  {
    "name": "Dusky-crowned Mudwarbler",
    "file": "Dusky-crowned_Mudwarbler.png",
    "difficulty": "hard"
  },
  {
    "name": "Marbled-vented Sunbird",
    "file": "Marbled-vented_Sunbird.png",
    "difficulty": "expert"
  },
  {
    "name": "Slender Grey-throated Honeyeater",
    "file": "Slender_Grey-throated_Honeyeater.png",
    "difficulty": "medium"
  },
  {
    "name": "Northern Spotted-rumped Crestwren",
    "file": "Northern_Spotted-rumped_Crestwren.png",
    "difficulty": "medium"
  },
  {
    "name": "Southern Reedlark",
    "file": "Southern_Reedlark.png",
    "difficulty": "hard"
  },
  {
    "name": "Little Marbled-washed Bee-eater",
    "file": "Little_Marbled-washed_Bee-eater.png",
    "difficulty": "expert"
  },
  {
    "name": "Black-cheeked Babbler",
    "file": "Black-cheeked_Babbler.png",
    "difficulty": "medium"
  },
  {
    "name": "Ochre-rumped Gorsediver",
    "file": "Ochre-rumped_Gorsediver.png",
    "difficulty": "medium"
  },
  {
    "name": "Southern Crestrunner",
    "file": "Southern_Crestrunner.png",
    "difficulty": "hard"
  },
  {
    "name": "American Scarlet-collared Spinetail",
    "file": "American_Scarlet-collared_Spinetail.png",
    "difficulty": "expert"
  },
  {
    "name": "Ochre-tailed Kingfisher",
    "file": "Ochre-tailed_Kingfisher.png",
    "difficulty": "medium"
  },
  {
    "name": "Barred-fronted Whistlelark",
    "file": "Barred-fronted_Whistlelark.png",
    "difficulty": "medium"
  },
  {
    "name": "Tawny-billed Daleshrike",
    "file": "Tawny-billed_Daleshrike.png",
    "difficulty": "hard"
  },
  {
    "name": "Pale Ochre-shouldered Nunlet",
    "file": "Pale_Ochre-shouldered_Nunlet.png",
    "difficulty": "expert"
  },
  {
    "name": "Pale-billed Heron",
    "file": "Pale-billed_Heron.png",
    "difficulty": "medium"
  },
  {
    "name": "Ash-breasted Sedgebird",
    "file": "Ash-breasted_Sedgebird.png",
    "difficulty": "medium"
  },
  {
    "name": "Spotted-naped Dustfinch",
    "file": "Spotted-naped_Dustfinch.png",
    "difficulty": "hard"
  },
  {
    "name": "Dusky-crowned Malimbe",
    "file": "Dusky-crowned_Malimbe.png",
    "difficulty": "expert"
  },
  {
    "name": "Northern Black-naped Trogon",
    "file": "Northern_Black-naped_Trogon.png",
    "difficulty": "medium"
  },
  {
    "name": "Sooty-naped Crestwarbler",
    "file": "Sooty-naped_Crestwarbler.png",
    "difficulty": "medium"
  },
  {
    "name": "Ochre-browed Thornbird",
    "file": "Ochre-browed_Thornbird.png",
    "difficulty": "hard"
  },
  {
    "name": "Eurasian Sooty-headed Bush-warbler",
    "file": "Eurasian_Sooty-headed_Bush-warbler.png",
    "difficulty": "expert"
  },
  {
    "name": "Desert Ochre-naped Hawk",
    "file": "Desert_Ochre-naped_Hawk.png",
    "difficulty": "medium"
  },
  {
    "name": "Black-rumped Sedgewarbler",
    "file": "Black-rumped_Sedgewarbler.png",
    "difficulty": "medium"
  },
  {
    "name": "Ash-crowned Gorsebird",
    "file": "Ash-crowned_Gorsebird.png",
    "difficulty": "hard"
  },
  {
    "name": "Little Dusky-rumped Pytilia",
    "file": "Little_Dusky-rumped_Pytilia.png",
    "difficulty": "expert"
  }
];

// Pool management for fake names (mirrors real-bird pool shuffling)
let fakeImagePool = { easy: [], medium: [], hard: [], expert: [] };

function pickFakeEntry() {
  if (!FAKE_BIRD_IMAGES.length) return null;
  const style = getStyle();
  const matching = FAKE_BIRD_IMAGES.filter(e => e.difficulty === style);
  // Don't fall back to other difficulties — return null and let generateFakeName() handle it
  if (!matching.length) return null;
  if (!fakeImagePool[style] || fakeImagePool[style].length === 0) {
    fakeImagePool[style] = shuffle([...Array(matching.length).keys()]);
  }
  return matching[fakeImagePool[style].pop()];
}

// ── Photo fetching ───────────────────────────────────────────────────────────
// Photos are pre-saved in birds.js as bird.photo (populated by fetch-photos.js).
// This function just returns the stored URL so there's no network call per round.
function fetchBirdPhoto(bird) {
  return Promise.resolve(bird.photo || null);
}

// ── Bird pools ────────────────────────────────────────────────────────────────
// Famous birds excluded from hard mode so recognisable names don't give it away.
// Toco Toucan, Keel-billed Toucan, Victoria Crowned Pigeon, Hoatzin kept in all pools.
// Wandering Albatross, Blue-footed Booby, Tufted Puffin, Roseate Spoonbill,
// Superb Lyrebird, Laughing Kookaburra, Magnificent Frigatebird kept in hard (easier).
const FAMOUS_NAMES = new Set([
  'Ostrich', 'Indian Peafowl', 'Emu', 'Cassowary', 'Kiwi',
  'Atlantic Puffin', 'Snowy Owl', 'Barn Owl',
  'Peregrine Falcon', 'Common Loon', 'Greater Roadrunner', 'Osprey',
  'California Condor', 'Whooping Crane', 'Emperor Penguin',
  'Mandarin Duck', 'Harpy Eagle', 'Resplendent Quetzal', 'Kakapo',
  'Bee Hummingbird', 'Andean Condor', 'Red-tailed Hawk',
]);
const OBSCURE_BIRDS  = BIRDS.filter(b => !FAMOUS_NAMES.has(b.name) && b.photo);
const FAMOUS_BIRDS   = BIRDS.filter(b =>  FAMOUS_NAMES.has(b.name) && b.photo);
const ALL_BIRDS      = BIRDS.filter(b => b.photo);
const HARD_BIRDS_P   = HARD_BIRDS.filter(b => b.photo);

// ── Game state ───────────────────────────────────────────────────────────────
const ROUNDS_PER_GAME = 5;
let questionCount = 0, gameScore = 0;
let score = 0, streak = 0, bestStreak = 0;
let currentRound = null, answered = false;
let birdPool = [];        // shuffled indices for BIRDS (easy)
let famousBirdPool = [];  // shuffled indices for FAMOUS_BIRDS (medium)
let obscureBirdPool = []; // shuffled indices for OBSCURE_BIRDS (hard)
let hardBirdPool = [];    // shuffled indices for HARD_BIRDS (expert)
let photoPromises = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickTwoBirds() {
  const style = getStyle();
  if (style === 'expert') {
    if (hardBirdPool.length < 2) hardBirdPool = shuffle([...Array(HARD_BIRDS_P.length).keys()]);
    return [HARD_BIRDS_P[hardBirdPool.pop()], HARD_BIRDS_P[hardBirdPool.pop()]];
  }
  if (style === 'hard') {
    if (obscureBirdPool.length < 2) obscureBirdPool = shuffle([...Array(OBSCURE_BIRDS.length).keys()]);
    return [OBSCURE_BIRDS[obscureBirdPool.pop()], OBSCURE_BIRDS[obscureBirdPool.pop()]];
  }
  if (style === 'medium') {
    if (famousBirdPool.length < 2) famousBirdPool = shuffle([...Array(FAMOUS_BIRDS.length).keys()]);
    return [FAMOUS_BIRDS[famousBirdPool.pop()], FAMOUS_BIRDS[famousBirdPool.pop()]];
  }
  if (birdPool.length < 2) birdPool = shuffle([...Array(ALL_BIRDS.length).keys()]);
  return [ALL_BIRDS[birdPool.pop()], ALL_BIRDS[birdPool.pop()]];
}

function startRound() {
  answered = false;

  document.getElementById('question-progress').textContent =
    `Question ${questionCount + 1} of ${ROUNDS_PER_GAME}`;

  const [bird1, bird2] = pickTwoBirds();
  const fakeEntry = pickFakeEntry();
  currentRound = {
    real: [bird1, bird2],
    fake: fakeEntry ? fakeEntry.name : generateFakeName(),
    fakeImage: fakeEntry ? fakeEntry.file : null,
  };

  // Kick off photo fetches in background while user is thinking
  photoPromises = currentRound.real.map(b => fetchBirdPhoto(b));

  const options = shuffle([
    { name: currentRound.fake, isFake: true },
    { name: currentRound.real[0].name, isFake: false, birdIdx: 0 },
    { name: currentRound.real[1].name, isFake: false, birdIdx: 1 }
  ]);

  const questionEl = document.querySelector('.question');
  questionEl.className = 'question';
  questionEl.innerHTML = 'Tap the bird you think is <strong>made up</strong>';

  const cards = document.getElementById('bird-cards');
  cards.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'bird-btn';
    btn.dataset.fake = opt.isFake;
    if (!opt.isFake) btn.dataset.birdIdx = opt.birdIdx;
    btn.innerHTML = `<div class="bird-name">${opt.name}</div>`;
    btn.onclick = () => handleGuess(opt.isFake, opt.name);
    cards.appendChild(btn);
  });

  document.getElementById('result-panel').style.display = 'none';
}

async function handleGuess(pickedFake, pickedName) {
  if (answered) return;
  answered = true;

  if (selectedDifficulty === 'auto') updateAdaptiveDifficulty(pickedFake);

  // Show suspense message, then reveal after 1s
  const questionEl = document.querySelector('.question');
  questionEl.className = 'question suspense';
  questionEl.innerHTML = `Let's find out…`;

  await new Promise(r => setTimeout(r, 1000));

  if (pickedFake) {
    score++;
    gameScore++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
  } else {
    streak = 0;
  }

  document.getElementById('score').textContent = score;
  document.getElementById('best-streak').textContent = bestStreak;

  // Update question text with result feedback
  if (pickedFake) {
    questionEl.className = 'question correct';
    questionEl.innerHTML = streak >= 3
      ? `✓ Correct! 🔥 ${streak} in a row!`
      : `✓ Correct!`;
  } else {
    questionEl.className = 'question wrong';
    questionEl.innerHTML = `✗ Wrong! The fake was: <em>${currentRound.fake}</em>`;
  }

  document.querySelectorAll('.bird-btn').forEach(btn => {
    btn.disabled = true;
    const isFakeBtn = btn.dataset.fake === 'true';
    const wasClicked = btn.querySelector('.bird-name').textContent === pickedName;

    btn.classList.add(isFakeBtn ? 'reveal-fake' : 'reveal-real');
    if (wasClicked && pickedFake)  btn.classList.add('correct');
    if (wasClicked && !pickedFake) btn.classList.add('wrong');

    // Big check or cross on the clicked card
    if (wasClicked) {
      const icon = document.createElement('div');
      icon.className = pickedFake ? 'result-icon correct-icon' : 'result-icon wrong-icon';
      icon.textContent = pickedFake ? '✓' : '✗';
      btn.appendChild(icon);
    }

    // "You picked" tag on the selected wrong card
    if (wasClicked && !pickedFake) {
      const picked = document.createElement('div');
      picked.className = 'you-picked-label';
      picked.textContent = 'You picked';
      btn.querySelector('.bird-name').after(picked);
    }

    // Bird/robot label
    const label = document.createElement('div');
    label.className = `result-label ${isFakeBtn ? 'label-fake' : 'label-real'}`;
    label.textContent = isFakeBtn ? '🤖 Fake' : '🐦 Real';
    btn.appendChild(label);

    // Expand real bird cards with photo + fact
    if (!isFakeBtn) {
      const birdIdx = parseInt(btn.dataset.birdIdx);
      const bird = currentRound.real[birdIdx];
      const expand = document.createElement('div');
      expand.className = 'bird-expand';
      expand.innerHTML = `
        <div class="photo-wrap" id="photo-wrap-${birdIdx}">
          <div class="photo-loading">loading photo…</div>
          <img id="bird-photo-${birdIdx}" class="bird-photo" alt="${bird.name}">
        </div>
        <p class="fun-fact">${bird.fact}</p>
      `;
      btn.appendChild(expand);
    }

    // "Imagine this bird" button on fake bird card
    if (isFakeBtn && currentRound.fakeImage) {
      const fakeName = btn.querySelector('.bird-name').textContent;
      const expand = document.createElement('div');
      expand.className = 'bird-expand fake-imagine';
      expand.innerHTML = `
        <button class="imagine-btn" onclick="this.style.display='none'; this.nextElementSibling.style.display='block';">
          🎨 Imagine this bird
        </button>
        <div class="fake-bird-reveal" style="display:none">
          <p class="imagine-caption">AI imagined: <em>${fakeName}</em></p>
          <div class="photo-wrap">
            <img class="bird-photo loaded" src="fake-bird-images/${currentRound.fakeImage}" alt="AI imagined ${fakeName}">
          </div>
        </div>
      `;
      btn.appendChild(expand);
    }
  });

  document.getElementById('streak-display').innerHTML =
    streak >= 2 ? `🔥 Current streak: <span>${streak}</span>` : '';

  const panel = document.getElementById('result-panel');
  panel.style.display = 'block';

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.textContent = questionCount === ROUNDS_PER_GAME - 1 ? 'See Results →' : 'Next bird →';
  }

  // Resolve photos (likely already fetched while user was thinking)
  const photos = await Promise.all(photoPromises);
  photos.forEach((src, i) => {
    const wrap = document.getElementById(`photo-wrap-${i}`);
    const img  = document.getElementById(`bird-photo-${i}`);
    if (!wrap || !img) return;
    if (src) {
      img.onload  = () => {
        img.classList.add('loaded');
        const lbl = wrap.querySelector('.photo-loading');
        if (lbl) lbl.style.display = 'none';
      };
      img.onerror = () => { wrap.style.display = 'none'; };
      img.src = src;
    } else {
      wrap.style.display = 'none';
    }
  });
}

function nextRound() {
  questionCount++;
  if (questionCount >= ROUNDS_PER_GAME) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(showEndScreen, 300);
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(startRound, 300);
}

function showEndScreen() {
  const diffEl = document.getElementById('final-difficulty');
  diffEl.textContent = selectedDifficulty === 'auto'
    ? 'Auto'
    : selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);

  const messages = [
    'Better luck next time! 🐣',
    'Getting there! 🐤',
    'Not bad! 🐦',
    'Nice work! 🦅',
    'Great game! 🦜',
    'Perfect score! 🏆'
  ];

  document.getElementById('end-title').textContent = messages[gameScore] ?? 'Game Over!';
  document.getElementById('final-score').textContent = gameScore;

  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.level === selectedDifficulty);
  });

  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('end-screen').style.display = 'block';
}

function startGame() {
  questionCount = 0;
  gameScore = 0;
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  startRound();
}

startGame();
