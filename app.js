(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const giftId = (params.get('g') || 'angie-yellow-flowers-v3').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  const storageKey = `yellowFlowers:${giftId}`;

  const $ = id => document.getElementById(id);
  const intro = $('intro');
  const story = $('story');
  const returnScreen = $('returnScreen');
  const openGift = $('openGift');
  const openMuted = $('openMuted');
  const returnButton = $('returnButton');
  const soundToggle = $('soundToggle');
  const storyLine = $('storyLine');
  const secretFlower = $('secretFlower');
  const secretNote = $('secretNote');
  const secretBackdrop = $('secretBackdrop');
  const secretClose = $('secretClose');
  const petals = $('petals');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let audio = null;
  let muted = false;
  let token = 0;

  /* ---------- memoria local ---------- */
  function readMemory() {
    try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); }
    catch { return null; }
  }
  function writeMemory(m) {
    try { localStorage.setItem(storageKey, JSON.stringify(m)); } catch { /* sin almacenamiento: sigue funcionando */ }
  }
  function rememberVisit() {
    const now = new Date().toISOString();
    const m = readMemory();
    if (!m) { writeMemory({ firstOpenedAt: now, lastOpenedAt: now, visits: 1 }); return; }
    m.lastOpenedAt = now;
    m.visits = (Number(m.visits) || 1) + 1;
    writeMemory(m);
  }

  /* ---------- pantallas ---------- */
  function setScreen(active) {
    [intro, story, returnScreen].forEach(el => el.classList.toggle('is-active', el === active));
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function say(text, hold = 2400) {
    const mine = token;
    storyLine.className = 'story-line';
    storyLine.textContent = text;
    void storyLine.offsetWidth;
    storyLine.classList.add('show');
    await wait(reduceMotion ? Math.min(hold, 1400) : hold);
    if (mine !== token) return false;
    storyLine.classList.remove('show');
    storyLine.classList.add('hide');
    await wait(reduceMotion ? 60 : 780);
    return mine === token;
  }

  function createPetals(count = 10) {
    petals.replaceChildren();
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('i');
      p.className = 'falling-petal';
      p.style.left = `${6 + Math.random() * 88}%`;
      p.style.setProperty('--dur', `${7 + Math.random() * 5}s`);
      p.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
      p.style.animationDelay = `${Math.random() * 6}s`;
      p.style.scale = `${0.6 + Math.random() * 0.7}`;
      petals.appendChild(p);
    }
  }

  /* ---------- audio ---------- */
  function ensureAudio() {
    if (audio) return audio;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.17;
      master.connect(ctx.destination);
      audio = { ctx, master, timers: [] };
      return audio;
    } catch { return null; }
  }
  function tone(freq, start, duration, gain = 0.08, type = 'sine') {
    if (!audio || muted) return;
    const { ctx, master } = audio;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(gain, start + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(env); env.connect(master);
    osc.start(start); osc.stop(start + duration + 0.05);
  }
  function playChime() {
    if (!audio || muted) return;
    const t = audio.ctx.currentTime + 0.02;
    [659.25, 783.99, 987.77].forEach((f, i) => tone(f, t + i * 0.1, 0.9, 0.055));
    tone(1318.51, t + 0.33, 1.15, 0.03);
  }
  function startAmbience() {
    if (!audio || muted) return;
    stopAmbience();
    const { ctx } = audio;
    const chords = [
      [261.63, 329.63, 392.00],
      [220.00, 329.63, 392.00],
      [246.94, 293.66, 369.99],
      [196.00, 293.66, 392.00]
    ];
    let step = 0;
    const play = () => {
      if (!audio || muted || document.hidden) return;
      const now = ctx.currentTime + 0.02;
      chords[step % chords.length].forEach((f, i) => tone(f, now + i * 0.24, 2.4, 0.014));
      step++;
    };
    play();
    audio.timers.push(setInterval(play, 2600));
  }
  function stopAmbience() {
    if (!audio) return;
    audio.timers.forEach(clearInterval);
    audio.timers = [];
  }
  function setMuted(v) {
    muted = v;
    soundToggle.classList.toggle('is-muted', muted);
    soundToggle.textContent = '♪';
    soundToggle.setAttribute('aria-label', muted ? 'Activar sonido' : 'Desactivar sonido');
    if (muted) stopAmbience();
    else if (story.classList.contains('is-active')) startAmbience();
  }

  /* ---------- secuencia ---------- */
  const LINES = [
    ['Gracias por compartir tu tiempo conmigo.', 2500],
    ['Me gustan esos momentos simples que hemos compartido.', 2700],
    ['A veces es una conversación, acompañarnos en la micro o simplemente coincidir.', 3200],
    ['El viernes fue uno de esos momentos bonitos.', 2450],
    ['Ojalá podamos seguir sumando momentos así.', 2550],
    ['Estas flores amarillas son para ti. 🌻', 2400]
  ];

  async function startStory(withSound = true) {
    token++;
    const mine = token;
    setScreen(story);
    rememberVisit();
    story.classList.remove('is-returned', 'has-card', 'is-growing');
    void story.offsetWidth;
    createPetals();

    // deja que el cruce de pantallas termine antes de que empiece a crecer el ramo
    await wait(reduceMotion ? 0 : 380);
    if (mine !== token) return;
    story.classList.add('is-growing');

    if (withSound) {
      const a = ensureAudio();
      if (a) {
        try { await a.ctx.resume(); } catch { /* ignore */ }
        setMuted(false);
        playChime();
        startAmbience();
      }
    } else {
      setMuted(true);
    }

    await wait(reduceMotion ? 120 : 620);
    for (const [text, hold] of LINES) {
      if (!await say(text, hold)) return;
    }
    if (mine !== token) return;
    storyLine.className = 'story-line';
    storyLine.textContent = '';
    story.classList.add('has-card');
  }

  async function openReturnedGarden() {
    token++;
    const mine = token;
    rememberVisit();
    setScreen(story);
    story.classList.remove('is-growing', 'has-card');
    story.classList.add('is-returned');
    storyLine.className = 'story-line';
    storyLine.textContent = '';
    createPetals(8);
    if (!muted && audio) startAmbience();
    await wait(reduceMotion ? 0 : 900);
    if (mine === token) story.classList.add('has-card');
  }

  /* ---------- nota secreta ---------- */
  function showSecret() {
    secretNote.hidden = false;
    secretBackdrop.hidden = false;
    void secretNote.offsetWidth;
    secretNote.classList.add('show');
    secretBackdrop.classList.add('show');
    secretClose.focus();
  }
  function hideSecret() {
    secretNote.classList.remove('show');
    secretBackdrop.classList.remove('show');
    setTimeout(() => {
      if (!secretNote.classList.contains('show')) { secretNote.hidden = true; secretBackdrop.hidden = true; }
    }, 320);
  }

  /* ---------- eventos ---------- */
  openGift.addEventListener('click', () => startStory(true));
  openMuted.addEventListener('click', () => startStory(false));
  returnButton.addEventListener('click', openReturnedGarden);

  soundToggle.addEventListener('click', async () => {
    if (muted) {
      const a = ensureAudio();
      if (a) { try { await a.ctx.resume(); } catch { /* ignore */ } }
      setMuted(false);
      playChime();
    } else {
      setMuted(true);
    }
  });

  secretFlower.addEventListener('click', showSecret);
  secretFlower.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSecret(); }
  });
  secretClose.addEventListener('click', hideSecret);
  secretBackdrop.addEventListener('click', hideSecret);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && secretNote.classList.contains('show')) hideSecret();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAmbience();
    else if (!muted && story.classList.contains('is-active')) startAmbience();
  });

  // ?reset=1 vuelve a mostrar la primera visita.
  if (params.get('reset') === '1') {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    const keep = params.get('g') ? `?g=${encodeURIComponent(giftId)}` : '';
    try { history.replaceState({}, '', location.pathname + keep); } catch { /* ignore */ }
  }

  setScreen(readMemory() ? returnScreen : intro);
})();
