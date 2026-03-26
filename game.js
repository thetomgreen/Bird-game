// ── Photo fetching ───────────────────────────────────────────────────────────
// Photos are pre-saved in birds.js as bird.photo (populated by fetch-photos.js).
// This function just returns the stored URL so there's no network call per round.
function fetchBirdPhoto(bird) {
  return Promise.resolve(bird.photo || null);
}

// ── Bird pools ────────────────────────────────────────────────────────────────
// Famous birds excluded from hard mode so recognisable names don't give it away.
// Toco Toucan, Keel-billed Toucan, Victoria Crowned Pigeon, Hoatzin kept in all pools.
const FAMOUS_NAMES = new Set([
  'Ostrich', 'Indian Peafowl', 'Emu', 'Cassowary', 'Kiwi',
  'Atlantic Puffin', 'Tufted Puffin', 'Snowy Owl', 'Barn Owl',
  'Peregrine Falcon', 'Common Loon', 'Greater Roadrunner', 'Osprey',
  'California Condor', 'Whooping Crane', 'Emperor Penguin',
  'Wandering Albatross', 'Blue-footed Booby', 'Mandarin Duck',
  'Harpy Eagle', 'Resplendent Quetzal', 'Kakapo', 'Laughing Kookaburra',
  'Bee Hummingbird', 'Andean Condor', 'Red-tailed Hawk',
  'Superb Lyrebird', 'Magnificent Frigatebird', 'Roseate Spoonbill',
]);
const OBSCURE_BIRDS = BIRDS.filter(b => !FAMOUS_NAMES.has(b.name));

// ── Game state ───────────────────────────────────────────────────────────────
const ROUNDS_PER_GAME = 5;
let questionCount = 0, gameScore = 0;
let score = 0, streak = 0, bestStreak = 0;
let currentRound = null, answered = false;
let birdPool = [];        // shuffled indices for main BIRDS pool (easy/medium)
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
    if (hardBirdPool.length < 2) hardBirdPool = shuffle([...Array(HARD_BIRDS.length).keys()]);
    return [HARD_BIRDS[hardBirdPool.pop()], HARD_BIRDS[hardBirdPool.pop()]];
  }
  if (style === 'hard') {
    if (obscureBirdPool.length < 2) obscureBirdPool = shuffle([...Array(OBSCURE_BIRDS.length).keys()]);
    return [OBSCURE_BIRDS[obscureBirdPool.pop()], OBSCURE_BIRDS[obscureBirdPool.pop()]];
  }
  if (birdPool.length < 2) birdPool = shuffle([...Array(BIRDS.length).keys()]);
  return [BIRDS[birdPool.pop()], BIRDS[birdPool.pop()]];
}

function startRound() {
  answered = false;

  document.getElementById('question-progress').textContent =
    `Question ${questionCount + 1} of ${ROUNDS_PER_GAME}`;

  const [bird1, bird2] = pickTwoBirds();
  currentRound = { real: [bird1, bird2], fake: generateFakeName() };

  // Kick off photo fetches in background while user is thinking
  photoPromises = currentRound.real.map(b => fetchBirdPhoto(b));

  const options = shuffle([
    { name: currentRound.fake, isFake: true },
    { name: currentRound.real[0].name, isFake: false },
    { name: currentRound.real[1].name, isFake: false }
  ]);

  const cards = document.getElementById('bird-cards');
  cards.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'bird-btn';
    btn.dataset.fake = opt.isFake;
    btn.innerHTML = `<div class="bird-name">${opt.name}</div>`;
    btn.onclick = () => handleGuess(opt.isFake, opt.name);
    cards.appendChild(btn);
  });

  document.getElementById('result-panel').style.display = 'none';
}

async function handleGuess(pickedFake, pickedName) {
  if (answered) return;
  answered = true;

  if (pickedFake) {
    score++;
    gameScore++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
  } else {
    streak = 0;
  }

  if (selectedDifficulty === 'auto') updateAdaptiveDifficulty(pickedFake);

  document.getElementById('score').textContent = score;
  document.getElementById('best-streak').textContent = bestStreak;

  document.querySelectorAll('.bird-btn').forEach(btn => {
    btn.disabled = true;
    const isFakeBtn = btn.dataset.fake === 'true';
    const wasClicked = btn.querySelector('.bird-name').textContent === pickedName;
    btn.classList.add(isFakeBtn ? 'reveal-fake' : 'reveal-real');
    btn.innerHTML += `<div class="result-label ${isFakeBtn ? 'label-fake' : 'label-real'}">${isFakeBtn ? '✗ FAKE' : '✓ REAL'}</div>`;
    if (wasClicked && pickedFake)  btn.classList.add('correct');
    if (wasClicked && !pickedFake) btn.classList.add('wrong');
  });

  const header = document.getElementById('result-header');
  header.textContent = pickedFake
    ? (streak >= 3 ? `✓ Correct! 🔥 ${streak} in a row!` : '✓ Correct!')
    : `✗ Nope! The fake was: ${currentRound.fake}`;
  header.className = `result-header ${pickedFake ? 'win' : 'lose'}`;

  // Build result panel with photo placeholders
  const info = document.getElementById('real-birds-info');
  info.innerHTML = '';
  currentRound.real.forEach((bird, i) => {
    const div = document.createElement('div');
    div.className = 'real-bird';
    div.innerHTML = `
      <h3>${bird.name}</h3>
      <div class="photo-wrap" id="photo-wrap-${i}">
        <div class="photo-loading">loading photo…</div>
        <img id="bird-photo-${i}" class="bird-photo" alt="${bird.name}">
      </div>
      <p class="fun-fact">${bird.fact}</p>
    `;
    info.appendChild(div);
  });

  document.getElementById('streak-display').innerHTML =
    streak >= 2 ? `🔥 Current streak: <span>${streak}</span>` : '';

  const panel = document.getElementById('result-panel');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

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
