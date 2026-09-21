(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const giftId = (params.get('g') || 'angie-yellow-flowers-v1').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  const storageKey = `yellowFlowers:${giftId}`;

  const intro = document.getElementById('intro');
  const story = document.getElementById('story');
  const returnScreen = document.getElementById('returnScreen');
  const openGift = document.getElementById('openGift');
  const openMuted = document.getElementById('openMuted');
  const returnButton = document.getElementById('returnButton');
  const soundToggle = document.getElementById('soundToggle');
  const storyLine = document.getElementById('storyLine');
  const finalCard = document.getElementById('finalCard');
  const secretFlower = document.getElementById('secretFlower');
  const secretNote = document.getElementById('secretNote');
  const secretClose = document.getElementById('secretClose');
  const petals = document.getElementById('petals');

  let audio = null;
  let muted = false;
  let sequenceToken = 0;

  function readMemory() {
    try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); }
    catch { return null; }
  }

  function writeMemory(memory) {
    try { localStorage.setItem(storageKey, JSON.stringify(memory)); }
    catch { /* El regalo sigue funcionando aunque el navegador bloquee almacenamiento. */ }
  }

  function rememberVisit() {
    const now = new Date().toISOString();
    const memory = readMemory();
    if (!memory) {
      writeMemory({ firstOpenedAt: now, lastOpenedAt: now, visits: 1 });
      return;
    }
    memory.lastOpenedAt = now;
    memory.visits = Math.max(1, Number(memory.visits) || 1) + 1;
    writeMemory(memory);
  }

  function setScreen(active) {
    [intro, story, returnScreen].forEach(el => el.classList.toggle('is-active', el === active));
  }

  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async function say(text, hold = 2500) {
    const token = sequenceToken;
    storyLine.className = 'story-line';
    storyLine.textContent = text;
    // Fuerza reflow para reiniciar animación de forma fiable.
    void storyLine.offsetWidth;
    storyLine.classList.add('show');
    await wait(hold);
    if (token !== sequenceToken) return false;
    storyLine.classList.remove('show');
    storyLine.classList.add('hide');
    await wait(620);
    return token === sequenceToken;
  }

  function createPetals(count = 14) {
    petals.replaceChildren();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('i');
      p.className = 'petal';
      p.style.left = `${5 + Math.random() * 90}%`;
      p.style.setProperty('--dur', `${5.5 + Math.random() * 4}s`);
      p.style.setProperty('--drift', `${-45 + Math.random() * 90}px`);
      p.style.animationDelay = `${Math.random() * 2.2}s`;
      p.style.transform = `scale(${.65 + Math.random() * .8})`;
      petals.appendChild(p);
    }
  }

  function ensureAudio() {
    if (audio) return audio;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = .18;
    master.connect(ctx.destination);
    audio = { ctx, master, timers: [] };
    return audio;
  }

  function tone(freq, start, duration, gain = .08, type = 'sine') {
    if (!audio || muted) return;
    const { ctx, master } = audio;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(gain, start + .03);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(env); env.connect(master);
    osc.start(start); osc.stop(start + duration + .03);
  }

  function playChime() {
    if (!audio || muted) return;
    const t = audio.ctx.currentTime + .02;
    [659.25, 783.99, 987.77].forEach((f, i) => tone(f, t + i * .10, .9, .06));
    tone(1318.51, t + .33, 1.15, .035);
  }

  function startAmbience() {
    if (!audio || muted) return;
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
      const now = ctx.currentTime + .02;
      const chord = chords[step % chords.length];
      chord.forEach((f, i) => tone(f, now + i * .24, 2.4, .015, 'sine'));
      step++;
    };
    play();
    const timer = setInterval(play, 2600);
    audio.timers.push(timer);
  }

  function stopAmbience() {
    if (!audio) return;
    audio.timers.forEach(clearInterval);
    audio.timers = [];
  }

  function setMuted(value) {
    muted = value;
    soundToggle.classList.toggle('is-muted', muted);
    soundToggle.textContent = muted ? '×' : '♪';
    soundToggle.setAttribute('aria-label', muted ? 'Activar sonido' : 'Desactivar sonido');
    if (muted) stopAmbience(); else if (story.classList.contains('is-active')) startAmbience();
  }

  async function startStory(withSound = true) {
    sequenceToken++;
    setScreen(story);
    rememberVisit();
    finalCard.classList.remove('show');
    story.classList.remove('returned');
    story.classList.add('growing');
    createPetals();

    if (withSound) {
      const a = ensureAudio();
      if (a) {
        await a.ctx.resume();
        setMuted(false);
        playChime();
        startAmbience();
      }
    } else {
      setMuted(true);
    }

    await wait(550);
    if (!await say('Gracias por compartir tu tiempo conmigo.', 2600)) return;
    if (!await say('El viernes pasado fue bonito.', 2350)) return;
    if (!await say('Me gustó mucho compartir ese ratito contigo.', 2700)) return;
    if (!await say('Ojalá podamos volver a coincidir…', 2250)) return;
    if (!await say('…y seguir sumando momentos así.', 2450)) return;
    if (!await say('Estas flores amarillas son para ti. 🌻', 2500)) return;

    storyLine.textContent = '';
    finalCard.classList.add('show');
  }

  function openReturnedGarden() {
    sequenceToken++;
    rememberVisit();
    setScreen(story);
    story.classList.remove('growing');
    story.classList.add('returned');
    finalCard.classList.add('show');
    createPetals(10);
  }

  function showSecret() { secretNote.classList.add('show'); }
  function hideSecret() { secretNote.classList.remove('show'); }

  openGift.addEventListener('click', () => startStory(true));
  openMuted.addEventListener('click', () => startStory(false));
  returnButton.addEventListener('click', openReturnedGarden);
  soundToggle.addEventListener('click', async () => {
    if (muted) {
      const a = ensureAudio();
      if (a) await a.ctx.resume();
      setMuted(false);
      playChime();
    } else setMuted(true);
  });
  secretFlower.addEventListener('click', showSecret);
  secretFlower.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSecret(); }
  });
  secretClose.addEventListener('click', hideSecret);

  // ?reset=1 facilita probar la experiencia inicial sin abrir DevTools.
  if (params.get('reset') === '1') {
    try { localStorage.removeItem(storageKey); } catch {}
    history.replaceState({}, '', location.pathname + (giftId !== 'angie-yellow-flowers-v1' ? `?g=${encodeURIComponent(giftId)}` : ''));
  }

  const memory = readMemory();
  setScreen(memory ? returnScreen : intro);
})();
