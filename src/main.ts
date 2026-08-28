import './style.css';
import { closeAudio, playNote, playSequence } from './audio';
import { exercisesByModule, frequencyToMidi, midiName, type Exercise, type ModuleId, type TextureId } from './music';
import { startPitchMonitor, type PitchMonitor } from './pitch';
import { chooseExercise, nextLevel, schedule, type ProgressState } from './scheduler';
import { clearProgress, exportCsv, loadProgress, resetDemoProgress, saveProgress, useDemoStorage } from './storage';
import { captureLicenseFromUrl, checkoutUrl, hasOptimisticUnlock, storeLicense, verifyLicense } from './license';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing');
const app: HTMLDivElement = root;
let routeFocusPending = false;

let isDemo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
useDemoStorage(isDemo);
let progress: ProgressState = loadProgress();
if (isDemo && progress.answered === 0 && Object.keys(progress.reviews).length === 0) progress = resetDemoProgress();
let moduleId: ModuleId = 'intervals';
let exercise: Exercise = chooseExercise(exercisesByModule[moduleId], progress, moduleId);
let answer: string | null = null;
let answerCorrect = false;
let playing = false;
let activeStep = -1;
let micMonitor: PitchMonitor | null = null;
let micActive = false;
let pitchHold = 0;
const capturedLicense = isDemo ? false : captureLicenseFromUrl();
let studioUnlocked = isDemo ? false : hasOptimisticUnlock();
let licenseNotice = capturedLicense ? 'Studio license saved. Welcome.' : '';
let online = navigator.onLine;

const today = new Date().toISOString().slice(0, 10);
if (progress.lastVisit !== today) {
  progress.sessions += 1;
  progress.lastVisit = today;
  saveProgress(progress);
}

function route(): 'practice' | 'privacy' | 'terms' | 'not-found' {
  if (location.pathname.startsWith('/privacy')) return 'privacy';
  if (location.pathname.startsWith('/terms')) return 'terms';
  if (location.pathname === '/' || location.pathname === '/demo') return 'practice';
  return 'not-found';
}

function navigate(path: string): void {
  if (path === '/demo') {
    enterDemo();
    return;
  }
  if (path === '/' && isDemo) {
    startForReal();
    return;
  }
  history.pushState({}, '', path);
  stopMic();
  routeFocusPending = true;
  render();
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function enterDemo(): void {
  stopMic();
  isDemo = true;
  useDemoStorage(true);
  progress = loadProgress();
  if (progress.answered === 0 && Object.keys(progress.reviews).length === 0) progress = resetDemoProgress();
  history.pushState({}, '', '/demo');
  routeFocusPending = true;
  render();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function startForReal(): void {
  stopMic();
  isDemo = false;
  useDemoStorage(false);
  progress = loadProgress();
  history.pushState({}, '', '/');
  routeFocusPending = true;
  render();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function setExercise(next?: Exercise): void {
  answer = null;
  answerCorrect = false;
  activeStep = -1;
  pitchHold = 0;
  exercise = next ?? chooseExercise(exercisesByModule[moduleId], progress, moduleId);
  renderPractice();
}

function save(): void {
  saveProgress(progress);
}

function texture(): TextureId {
  const selected = progress.texture as TextureId;
  return studioUnlocked || selected === 'warm' ? selected : 'warm';
}

async function playCurrent(): Promise<void> {
  if (playing) return;
  playing = true;
  updatePlayState();
  try {
    await playSequence(exercise.sequence, texture(), index => {
      activeStep = index;
      document.querySelectorAll('.voice-column').forEach((node, i) => node.classList.toggle('is-sounding', i === index));
    });
  } finally {
    playing = false;
    activeStep = -1;
    updatePlayState();
  }
}

function updatePlayState(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-action="play"]');
  if (button) {
    button.disabled = playing;
    button.textContent = playing ? 'Playing…' : answer ? 'Replay context' : 'Play context';
  }
  if (!playing) document.querySelectorAll('.voice-column').forEach(node => node.classList.remove('is-sounding'));
}

function submitAnswer(choice: string): void {
  if (progress.sandbox) {
    const preview = exercisesByModule[moduleId].find(item => item.answer === choice);
    if (preview) void playSequence(preview.sequence, texture());
    announce(`Previewing ${choice}. Sandbox does not score answers.`);
    return;
  }
  if (answer) return;
  answer = choice;
  answerCorrect = choice === exercise.answer;
  progress.reviews[exercise.id] = schedule(progress.reviews[exercise.id], answerCorrect);
  progress.answered += 1;
  progress.correct += Number(answerCorrect);
  progress.level[moduleId] = nextLevel(progress, moduleId);
  save();
  renderPractice();
  window.setTimeout(() => document.querySelector<HTMLButtonElement>('[data-action="next"]')?.focus(), 0);
}

function nextExercise(): void {
  setExercise();
  window.setTimeout(() => document.querySelector<HTMLButtonElement>('[data-action="play"]')?.focus(), 0);
}

function announce(message: string): void {
  const live = document.querySelector<HTMLElement>('#live-status');
  if (live) live.textContent = message;
}

function stopMic(): void {
  micMonitor?.stop();
  micMonitor = null;
  micActive = false;
  pitchHold = 0;
}

async function toggleMic(): Promise<void> {
  if (micActive) {
    stopMic();
    renderPractice();
    return;
  }
  const button = document.querySelector<HTMLButtonElement>('[data-action="mic"]');
  if (button) { button.disabled = true; button.textContent = 'Requesting microphone…'; }
  try {
    micMonitor = await startPitchMonitor(reading => {
      if (!reading) {
        updatePitchUi(null);
        pitchHold = Math.max(0, pitchHold - 1);
        return;
      }
      const midi = frequencyToMidi(reading.frequency);
      updatePitchUi(midi);
      const distance = Math.abs(midi - (exercise.targetMidi ?? 60));
      pitchHold = distance <= 0.35 ? pitchHold + 1 : Math.max(0, pitchHold - 2);
      if (pitchHold >= 9 && !progress.sandbox && !answer) {
        submitAnswer(exercise.answer);
        stopMic();
      }
    });
    micActive = true;
    renderPractice();
  } catch (error) {
    micActive = false;
    renderPractice();
    const message = error instanceof DOMException && error.name === 'NotAllowedError'
      ? 'Microphone access was blocked. Allow it in your browser settings, then try again.'
      : error instanceof Error ? error.message : 'The microphone could not start.';
    const box = document.querySelector<HTMLElement>('#mic-error');
    if (box) { box.hidden = false; box.textContent = message; }
  }
}

function updatePitchUi(midi: number | null): void {
  const marker = document.querySelector<HTMLElement>('#pitch-marker');
  const label = document.querySelector<HTMLElement>('#detected-pitch');
  if (!marker || !label) return;
  if (midi === null || midi < 47.5 || midi > 71.5) {
    marker.hidden = true;
    label.textContent = midi === null ? 'Listening…' : `${midiName(midi)} · outside the shown range`;
    return;
  }
  marker.hidden = false;
  // Positioning is deliberately represented as a data state rather than an
  // inline style. The production CSP prohibits inline styles, and the CSS
  // maps each displayed semitone to its keyboard position.
  marker.dataset.position = String(Math.round(midi) - 48);
  label.textContent = `${midiName(midi)} · ${Math.abs((midi - Math.round(midi)) * 100).toFixed(0)} cents ${midi >= Math.round(midi) ? 'sharp' : 'flat'}`;
}

function voiceDiagram(item: Exercise): string {
  const min = Math.min(...item.sequence.flat()) - 1;
  const max = Math.max(...item.sequence.flat()) + 1;
  const width = 520;
  const height = 166;
  const x = (index: number) => item.sequence.length === 1 ? width / 2 : 30 + index * ((width - 60) / (item.sequence.length - 1));
  const y = (midi: number) => 20 + (max - midi) * ((height - 40) / Math.max(1, max - min));
  const voiceCount = Math.max(...item.sequence.map(chord => chord.length));
  let paths = '';
  for (let voiceIndex = 0; voiceIndex < voiceCount; voiceIndex += 1) {
    const points = item.sequence.map((chord, index) => `${x(index)},${y(chord[Math.min(voiceIndex, chord.length - 1)])}`).join(' ');
    paths += `<polyline points="${points}" />`;
  }
  const columns = item.sequence.map((chord, index) => `<g class="voice-column ${activeStep === index ? 'is-sounding' : ''}">${chord.map(midi => `<circle cx="${x(index)}" cy="${y(midi)}" r="7" />`).join('')}</g>`).join('');
  return `<svg class="voice-map" viewBox="0 0 ${width} ${height}" role="img" aria-label="A voice-leading map with ${item.sequence.length} harmonic events"><g class="voice-paths">${paths}</g>${columns}</svg>`;
}

function pianoKeyboard(): string {
  const whitePitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
  const whites: string[] = [];
  const blacks: string[] = [];
  let whiteIndex = 0;
  for (let midi = 48; midi < 72; midi += 1) {
    const pitchClass = midi % 12;
    if (whitePitchClasses.has(pitchClass)) {
      whites.push(`<span class="piano-key white" aria-hidden="true"><small>${pitchClass === 0 ? midiName(midi) : ''}</small></span>`);
      whiteIndex += 1;
    } else {
      blacks.push(`<span class="piano-key black black-after-white-${whiteIndex}" aria-hidden="true"></span>`);
    }
  }
  return `<div class="keyboard-scroll"><div class="keyboard" role="img" aria-label="Two-octave piano keyboard from C3 to B4. The red marker follows your sung pitch.">${whites.join('')}${blacks.join('')}<span id="pitch-marker" class="pitch-marker" hidden></span></div></div>`;
}

function accuracy(): number {
  return progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;
}

function renderHeader(): string {
  return `<header class="site-header">
    <a class="wordmark" href="/" data-nav="/"><span class="mark" aria-hidden="true"><i></i><i></i><i></i></span> Ear in Context</a>
    <nav aria-label="Site navigation">
      <a href="/" data-nav="/">Practice</a>
      <a href="/demo" data-nav="/demo">Demo</a>
      <a href="/privacy" data-nav="/privacy">Privacy</a>
      <button class="theme-button" data-action="theme" type="button" aria-label="Switch color theme">◐ <span>Theme</span></button>
    </nav>
  </header>`;
}

function renderFooter(): string {
  return `<footer><p>Hear chord patterns, then name or sing the next note.</p><p><a href="/privacy" data-nav="/privacy">Privacy</a> · <a href="/terms" data-nav="/terms">Terms</a> · <a href="https://sociobot.in">Built by Param Factory</a> · v1.1.0</p></footer>`;
}

function renderPolicy(kind: 'privacy' | 'terms'): void {
  const privacy = kind === 'privacy';
  app.innerHTML = `${renderHeader()}<main id="main" class="policy"><p class="eyebrow">Plain-language ${privacy ? 'privacy' : 'terms'}</p><h1 tabindex="-1">${privacy ? 'Privacy for your ear practice' : 'Terms for ear practice'}</h1>
    ${privacy ? `<h2>What is stored</h2><p>Practice history, settings, and any Studio license are stored in your browser's local storage. Microphone audio is analysed live on your device and is never recorded, uploaded, or retained.</p><h2>Network requests</h2><p>The free trainer works without an account. If you buy or verify Studio, your browser contacts the Sociobot billing API with your license token. Sociobot/Dodo is the merchant of record and handles checkout records. This site has no behavioural analytics, ads, or third-party scripts.</p><h2>Your control</h2><p>Use “Erase local progress” in Practice to remove training history. Browser site settings can remove all data, including your locally saved license. CSV export is available to everyone.</p><h2>Contact</h2><p>Questions can be sent through <a href="https://sociobot.in">sociobot.in</a>. Effective 27 August 2026.</p>` : `<h2>Using the trainer</h2><p>Ear in Context is provided as an educational practice aid, without a promise of a specific musical result. Protect your hearing: keep device volume comfortable. You may use the free core indefinitely.</p><h2>Studio purchase</h2><p>Studio is a $24 one-time purchase for the extra Clarity and Reed synthesis textures and JSON backup. Checkout is hosted by Sociobot/Dodo, the merchant of record. Refunds are handled there; a refunded or revoked license stops unlocking Studio. Core practice, CSV export, privacy, and accessibility are never paywalled.</p><h2>License and availability</h2><p>A Studio license is for your personal use and may be restored on your devices. Do not resell or publish it. We may improve or discontinue the hosted site, but your locally stored practice data remains under your control.</p><h2>Contact</h2><p>Questions can be sent through <a href="https://sociobot.in">sociobot.in</a>. Effective 27 August 2026.</p>`}
    <a class="button-link" href="/" data-nav="/">Return to practice</a></main>${renderFooter()}<div id="live-status" class="sr-only" aria-live="polite"></div>`;
  bindCommon();
}

function renderNotFound(): void {
  app.innerHTML = `${renderHeader()}<main id="main" class="policy not-found"><p class="eyebrow">Lost in the progression</p><h1 tabindex="-1">That practice page does not exist</h1><p>Try the practice table or start with the sample cadence.</p><div class="button-row"><a class="button-link primary" href="/" data-nav="/">Go to practice</a><a class="button-link" href="/demo" data-nav="/demo">Try sample practice</a></div></main>${renderFooter()}<div id="live-status" class="sr-only" aria-live="polite"></div>`;
  bindCommon();
}

function setRouteMetadata(current: ReturnType<typeof route>): void {
  const details = current === 'privacy'
    ? { title: 'Privacy — Ear in Context', description: 'Read how Ear in Context stores practice progress and handles microphone audio.' }
    : current === 'terms'
      ? { title: 'Terms — Ear in Context', description: 'Read the terms for Ear in Context ear-training practice.' }
      : current === 'not-found'
        ? { title: 'Page not found — Ear in Context', description: 'This Ear in Context practice page does not exist.' }
        : isDemo
          ? { title: 'Demo — Ear in Context', description: 'Try a sample harmony practice without changing your saved progress.' }
          : { title: 'Ear in Context — practise hearing harmony', description: 'Practice hearing harmony in chord patterns with scale-degree, progression, and sung-note exercises.' };
  document.title = details.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', details.description);
  const canonicalPath = isDemo && current === 'practice' ? '/demo' : location.pathname;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${location.origin}${canonicalPath}`);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', details.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', details.description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', details.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', details.description);
}

function finishRoute(): void {
  if (!routeFocusPending) return;
  routeFocusPending = false;
  window.setTimeout(() => {
    const heading = document.querySelector<HTMLElement>('main h1');
    heading?.focus();
    announce(document.title);
  }, 0);
}

function render(): void {
  const current = route();
  if (current === 'not-found') { renderNotFound(); setRouteMetadata(current); finishRoute(); return; }
  if (current !== 'practice') { renderPolicy(current); setRouteMetadata(current); finishRoute(); return; }
  app.innerHTML = `${renderHeader()}<main id="main">
    ${isDemo ? `<aside class="demo-banner" aria-label="Demo status"><strong>Demo — sample data, nothing is saved</strong><span>Try the cadence, choices, and sung-note view.</span><span class="demo-actions"><button data-action="reset-demo">Reset demo</button><button data-action="start-real">Start for real</button></span></aside>` : ''}
    ${!online ? '<div class="offline-banner" role="status">Offline practice is ready. License checks will resume when you reconnect.</div>' : ''}
    <section class="hero ${isDemo ? 'demo-hero' : ''}" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="eyebrow">${isDemo ? 'Sample cadence loaded' : 'Ear training for self-taught musicians'}</p><h1 id="hero-title" tabindex="-1">${isDemo ? 'Sample harmony practice' : 'Practice hearing harmony in real songs'}</h1><p class="dek">${isDemo ? 'Press play, choose the next note, or open Sing it back.' : 'For self-taught musicians who want to hear how notes move together.'}</p>${isDemo ? '' : '<div class="hero-actions"><a class="button-link primary" href="/demo" data-nav="/demo">Try sample practice</a><span>Hear a short chord pattern, then choose the next note.</span></div><ul class="plain-facts"><li>No account</li><li>Practice audio stays in your browser</li><li>$24 Studio is optional</li></ul>'}</div>
      <picture><source srcset="/assets/voice-paths.webp" type="image/webp"><img src="/assets/voice-paths.jpg" width="1200" height="800" alt="Paper pitch tokens connected by gently moving teal voice paths" fetchpriority="high" decoding="async"></picture>
    </section>
    <section id="practice" class="practice-shell" aria-labelledby="practice-title">
      <div class="practice-heading"><div><p class="eyebrow">Listen, choose, sing</p><h2 id="practice-title">Today’s ear practice</h2></div><div class="score" aria-label="Session progress"><strong>${progress.answered}</strong> answered <span>·</span> <strong>${accuracy()}%</strong> right</div></div>
      <div class="global-controls" aria-label="Practice controls">
        <label class="switch"><input type="checkbox" data-control="sandbox" ${progress.sandbox ? 'checked' : ''}><span>Sandbox</span><small>${progress.sandbox ? 'Explore—nothing is scored' : 'Test—answers are scheduled'}</small></label>
        <label class="switch"><input type="checkbox" data-control="hold" ${progress.holdLevel ? 'checked' : ''}><span>Hold level</span><small>${progress.holdLevel ? 'Difficulty stays here' : 'Advance when ready'}</small></label>
        <label class="level-control"><span>Level</span><select data-control="level" aria-label="Difficulty level"><option value="1" ${progress.level[moduleId] === 1 ? 'selected' : ''}>1 · Ground</option><option value="2" ${progress.level[moduleId] === 2 ? 'selected' : ''}>2 · Colour</option><option value="3" ${progress.level[moduleId] === 3 ? 'selected' : ''}>3 · Tension</option></select></label>
      </div>
      <div class="module-tabs" role="tablist" aria-label="Training module">
        <button id="module-tab-intervals" role="tab" aria-controls="practice-panel" aria-selected="${moduleId === 'intervals'}" tabindex="${moduleId === 'intervals' ? '0' : '-1'}" data-module="intervals"><span>01</span> Scale degrees</button>
        <button id="module-tab-progressions" role="tab" aria-controls="practice-panel" aria-selected="${moduleId === 'progressions'}" tabindex="${moduleId === 'progressions' ? '0' : '-1'}" data-module="progressions"><span>02</span> Progressions</button>
        <button id="module-tab-sing" role="tab" aria-controls="practice-panel" aria-selected="${moduleId === 'sing'}" tabindex="${moduleId === 'sing' ? '0' : '-1'}" data-module="sing"><span>03</span> Sing it back</button>
      </div>
      <div id="practice-panel" role="tabpanel" tabindex="0" aria-labelledby="module-tab-${moduleId}"></div>
    </section>
    ${!isDemo ? `<section class="studio" aria-labelledby="studio-title"><div><p class="eyebrow">Optional Studio</p><h2 id="studio-title">Choose extra sound textures</h2><p>Studio adds Clarity and Reed textures plus a JSON backup. CSV export stays free.</p></div><div class="studio-buy"><strong>$24</strong><span>one-time purchase</span>${studioUnlocked ? '<span class="unlocked">✓ Studio unlocked</span>' : `<a class="button-link dark" href="${checkoutUrl()}">Buy Studio</a>`}</div></section>` : ''}
    <section class="settings" aria-labelledby="settings-title"><details><summary id="settings-title">Progress, sound & license</summary><div class="settings-grid">
      <div><h3>Sound texture</h3><div class="texture-options"><button data-texture="warm" aria-label="Warm texture, free" aria-pressed="${texture() === 'warm'}">Warm <small>Free</small></button><button data-texture="clarity" aria-label="Clarity texture, ${studioUnlocked ? 'Studio' : 'locked'}" aria-pressed="${texture() === 'clarity'}" ${studioUnlocked ? '' : 'data-locked="true"'}>Clarity <small>${studioUnlocked ? 'Studio' : 'Locked'}</small></button><button data-texture="reed" aria-label="Reed texture, ${studioUnlocked ? 'Studio' : 'locked'}" aria-pressed="${texture() === 'reed'}" ${studioUnlocked ? '' : 'data-locked="true"'}>Reed <small>${studioUnlocked ? 'Studio' : 'Locked'}</small></button></div></div>
      <div><h3>Your data</h3><p>${Object.keys(progress.reviews).length ? `${Object.keys(progress.reviews).length} items have a local review schedule.` : 'No scored answers yet. Start in Test mode when you are ready.'}</p><div class="button-row"><button aria-label="Export progress as CSV" data-action="export">Export CSV</button>${studioUnlocked ? '<button aria-label="Back up progress as JSON" data-action="backup">Backup JSON</button>' : ''}<button aria-label="Erase local progress" data-action="erase" class="quiet-danger">Erase local progress</button></div></div>
      <form id="license-form"><h3>Restore Studio</h3><label for="license-token">Have a license? Paste it here.</label><input id="license-token" name="license" autocomplete="off" spellcheck="false" required><button aria-label="Verify Studio license" type="submit">Verify license</button><p id="license-status" role="status">${licenseNotice}</p><p class="fine">Checkout and refunds are handled by Sociobot/Dodo. <a href="/terms" data-nav="/terms">Read the terms</a>.</p></form>
    </div></details></section>
  </main>${renderFooter()}<div id="live-status" class="sr-only" aria-live="polite"></div>`;
  bindCommon();
  bindPracticeShell();
  renderPractice();
  setRouteMetadata('practice');
  finishRoute();
}

function renderPractice(): void {
  const panel = document.querySelector<HTMLDivElement>('#practice-panel');
  if (!panel) return;
  const modeLabel = progress.sandbox ? 'Sandbox · audition choices freely' : 'Test · answer when ready';
  const result = answer ? `<div class="feedback ${answerCorrect ? 'correct' : 'incorrect'}" role="status"><strong>${answerCorrect ? '✓ You heard the path.' : `↗ The answer was ${exercise.answer}.`}</strong><p>${exercise.explanation}</p><button class="primary" data-action="next">Next sound <kbd>N</kbd></button></div>` : '';
  const choices = exercise.choices.filter(choice => {
    const source = exercisesByModule[moduleId].find(item => item.answer === choice);
    return !source || source.level <= progress.level[moduleId];
  });
  panel.innerHTML = `<article class="exercise" aria-labelledby="exercise-title">
    <div class="context-panel"><div class="exercise-meta"><span>${modeLabel}</span><span>Level ${exercise.level}</span></div>${voiceDiagram(exercise)}<p class="diagram-caption">Each line is one voice. Short paths mean smoother, more musical movement.</p><button class="listen-button" data-action="play" ${playing ? 'disabled' : ''}><span class="play-icon" aria-hidden="true">▶</span>${playing ? 'Playing…' : answer ? 'Replay context' : 'Play context'} <kbd>Space</kbd></button></div>
    <div class="answer-panel"><p class="eyebrow">${moduleId === 'sing' ? 'Voice feedback' : 'Your ear'}</p><h3 id="exercise-title">${exercise.prompt}</h3><p class="instruction">${moduleId === 'sing' ? 'Listen first, then start the mic. The marker shows your current note—not a waveform.' : progress.sandbox ? 'Choose any answer to hear that sound. Toggle Sandbox off when you want feedback.' : 'Listen for function, not an isolated shape.'}</p>
      ${moduleId === 'sing' ? `${pianoKeyboard()}<div class="pitch-readout"><strong id="detected-pitch">${micActive ? 'Listening…' : 'Mic is off'}</strong><span>Target: ${exercise.answer}</span></div><div class="button-row"><button data-action="mic" class="mic-button">${micActive ? 'Stop microphone' : 'Start microphone'}</button>${progress.sandbox ? '<button data-action="next" class="target-button">Try another target</button>' : ''}</div><p id="mic-error" class="inline-error" role="alert" hidden></p>` : `<div class="choice-grid">${choices.map((choice, index) => `<button data-choice="${choice}" ${answer ? 'disabled' : ''} class="${answer && choice === exercise.answer ? 'answer-correct' : answer === choice ? 'answer-wrong' : ''}"><kbd>${index + 1}</kbd><span>${choice}</span>${progress.sandbox ? '<small>Preview</small>' : ''}</button>`).join('')}</div>`}
      ${result}
    </div>
  </article>`;
  panel.querySelector<HTMLButtonElement>('[data-action="play"]')?.addEventListener('click', () => void playCurrent());
  panel.querySelector<HTMLButtonElement>('[data-action="next"]')?.addEventListener('click', nextExercise);
  panel.querySelector<HTMLButtonElement>('[data-action="mic"]')?.addEventListener('click', () => void toggleMic());
  panel.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(button => button.addEventListener('click', () => submitAnswer(button.dataset.choice ?? '')));
}

function bindPracticeShell(): void {
  const moduleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-module]'));
  const selectModule = (button: HTMLButtonElement): void => {
    stopMic();
    moduleId = button.dataset.module as ModuleId;
    exercise = chooseExercise(exercisesByModule[moduleId], progress, moduleId);
    answer = null;
    render();
    document.querySelector<HTMLButtonElement>(`[data-module="${moduleId}"]`)?.focus();
  };
  moduleButtons.forEach(button => {
    button.addEventListener('click', () => selectModule(button));
    button.addEventListener('keydown', event => {
      let nextIndex: number | null = null;
      const currentIndex = moduleButtons.indexOf(button);
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % moduleButtons.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + moduleButtons.length) % moduleButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = moduleButtons.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      selectModule(moduleButtons[nextIndex]);
    });
  });
  document.querySelector<HTMLInputElement>('[data-control="sandbox"]')?.addEventListener('change', event => {
    progress.sandbox = (event.currentTarget as HTMLInputElement).checked;
    answer = null;
    save(); render();
  });
  document.querySelector<HTMLInputElement>('[data-control="hold"]')?.addEventListener('change', event => {
    progress.holdLevel = (event.currentTarget as HTMLInputElement).checked;
    save(); render();
  });
  document.querySelector<HTMLSelectElement>('[data-control="level"]')?.addEventListener('change', event => {
    progress.level[moduleId] = Number((event.currentTarget as HTMLSelectElement).value);
    save(); setExercise();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-texture]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.locked) {
      document.querySelector<HTMLElement>('.studio')?.scrollIntoView({ behavior: 'smooth' });
      announce('That texture is included with Studio.');
      return;
    }
    progress.texture = button.dataset.texture ?? 'warm';
    save(); render();
    void playNote(60, texture());
  }));
  document.querySelector<HTMLButtonElement>('[data-action="export"]')?.addEventListener('click', () => download('ear-in-context-progress.csv', exportCsv(progress), 'text/csv'));
  document.querySelector<HTMLButtonElement>('[data-action="backup"]')?.addEventListener('click', () => download('ear-in-context-backup.json', JSON.stringify(progress, null, 2), 'application/json'));
  document.querySelector<HTMLButtonElement>('[data-action="erase"]')?.addEventListener('click', () => {
    if (!confirm('Erase all practice history and settings on this device? Your Studio license will be kept.')) return;
    clearProgress(); progress = loadProgress(); setExercise(); render();
  });
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('#license-token');
    if (!input?.value.trim()) return;
    storeLicense(input.value);
    const status = document.querySelector<HTMLElement>('#license-status');
    if (status) status.textContent = 'Checking license…';
    const verdict = await verifyLicense(true);
    studioUnlocked = verdict?.valid ?? false;
    licenseNotice = verdict === null ? 'Could not verify while offline. Try again when connected.' : verdict.valid ? 'License verified. Studio is unlocked.' : 'That license is not active. Check the token or buy Studio.';
    render();
  });
}

function download(filename: string, body: string, type: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([body], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function bindCommon(): void {
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); navigate(link.getAttribute('href') ?? '/');
  }));
  document.querySelector<HTMLButtonElement>('[data-action="theme"]')?.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    if (!isDemo) localStorage.setItem('ear-in-context:theme', dark ? 'dark' : 'light');
  });
  document.querySelector<HTMLButtonElement>('[data-action="reset-demo"]')?.addEventListener('click', () => {
    progress = resetDemoProgress();
    moduleId = 'intervals';
    answer = null;
    render();
    announce('Sample practice reset.');
  });
  document.querySelector<HTMLButtonElement>('[data-action="start-real"]')?.addEventListener('click', startForReal);
}

window.addEventListener('popstate', () => {
  const nextDemo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
  if (nextDemo !== isDemo) {
    isDemo = nextDemo;
    useDemoStorage(isDemo);
    progress = loadProgress();
    if (isDemo && progress.answered === 0 && Object.keys(progress.reviews).length === 0) progress = resetDemoProgress();
  }
  routeFocusPending = true;
  render();
});
window.addEventListener('online', () => { online = true; render(); void reconcileLicense(); });
window.addEventListener('offline', () => { online = false; render(); });
window.addEventListener('beforeunload', () => { stopMic(); closeAudio(); });
window.addEventListener('keydown', event => {
  if (route() !== 'practice' || ['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return;
  if (event.code === 'Space') { event.preventDefault(); void playCurrent(); }
  if (event.key.toLowerCase() === 's') { progress.sandbox = !progress.sandbox; answer = null; save(); render(); }
  if (event.key.toLowerCase() === 'h') { progress.holdLevel = !progress.holdLevel; save(); render(); }
  if (event.key.toLowerCase() === 'n' && answer) nextExercise();
  const number = Number(event.key);
  if (number >= 1 && number <= 9) document.querySelectorAll<HTMLButtonElement>('[data-choice]')[number - 1]?.click();
});

const savedTheme = isDemo ? null : localStorage.getItem('ear-in-context:theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

async function reconcileLicense(): Promise<void> {
  if (isDemo) return;
  const verdict = await verifyLicense();
  if (!verdict) return;
  if (studioUnlocked !== verdict.valid) {
    studioUnlocked = verdict.valid;
    licenseNotice = verdict.valid ? 'Studio license verified.' : 'Your Studio license is no longer active.';
    render();
  }
}

render();
if (!isDemo) void reconcileLicense();
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
