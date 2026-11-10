const STORAGE_KEY = 'bytebrief_sound';

let enabled = true;
let audio = null;
let noiseBuffer = null;

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function getAudio() {
  if (!audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio = new Ctx();
  }
  if (audio.state === 'suspended') audio.resume().catch(() => {});
  return audio;
}

function getNoise(ctx) {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  const length = Math.floor(ctx.sampleRate * 0.4);
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

function noiseBurst({ duration = 0.07, volume = 0.04, type = 'highpass', frequency = 900, q = 0.7, sweep = 0 }) {
  const ctx = getAudio();
  if (!ctx) return;
  const source = ctx.createBufferSource();
  source.buffer = getNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (sweep) filter.frequency.exponentialRampToValueAtTime(sweep, ctx.currentTime + duration);
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration + 0.02);
}

function playClick() {
  noiseBurst({ duration: 0.045, volume: 0.028, type: 'highpass', frequency: 1600 });
  const ctx = getAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(420, ctx.currentTime);
  gain.gain.setValueAtTime(0.018, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.06);
}

function playTurn() {
  noiseBurst({ duration: 0.3, volume: 0.05, type: 'bandpass', frequency: 500, q: 0.9, sweep: 2400 });
}

function playToggle() {
  noiseBurst({ duration: 0.06, volume: 0.03, type: 'bandpass', frequency: 1200, q: 1.2 });
}

function updateButtons() {
  document.querySelectorAll('#soundToggle, [data-sound-toggle]').forEach(button => {
    button.innerHTML = enabled
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';
    button.setAttribute('aria-label', enabled ? 'Mute sound effects' : 'Turn on sound effects');
    button.setAttribute('title', enabled ? 'Mute sound effects' : 'Turn on sound effects');
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  });
}

function saveEnabled() {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {}
}

export function initSound() {
  if (window.__bytebriefSoundInit) return;
  window.__bytebriefSoundInit = true;
  enabled = readEnabled();
  updateButtons();

  const unlock = () => {
    if (enabled) getAudio();
  };
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  document.addEventListener('keydown', unlock, { once: true, capture: true });

  document.addEventListener('click', event => {
    const toggle = event.target.closest('#soundToggle, [data-sound-toggle]');
    if (toggle) {
      event.preventDefault();
      enabled = !enabled;
      saveEnabled();
      if (enabled) {
        getAudio();
        playToggle();
      }
      updateButtons();
      return;
    }
    if (!enabled) return;

    const internal = event.target.closest('a[href]');
    if (internal) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = internal.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (internal.target && internal.target !== '_self') return;
      if (internal.hasAttribute('download')) return;
      const url = new URL(internal.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      playTurn();
      window.setTimeout(() => {
        window.location.href = url.href;
      }, 190);
      return;
    }

    if (event.target.closest('button, [role="tab"], .chip, [data-close-modal]')) playClick();
  });

  document.addEventListener('keydown', event => {
    if (!enabled) return;
    if (!event.target.closest('input[type="search"], input[type="text"], textarea')) return;
    if (event.key.length !== 1 && event.key !== 'Backspace') return;
    if (Math.random() > 0.55) return;
    noiseBurst({ duration: 0.025, volume: 0.012, type: 'highpass', frequency: 2200 });
  });
}
