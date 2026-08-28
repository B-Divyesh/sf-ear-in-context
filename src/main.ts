import './style.css';
import { closeAudio, playNote, playSequence } from './audio';
import { exercisesByModule, frequencyToMidi, midiName, type Exercise, type ModuleId, type TextureId } from './music';
import { startPitchMonitor, type PitchMonitor } from './pitch';
import { chooseExercise, nextLevel, schedule, type ProgressState } from './scheduler';
import { clearProgress, discardDemoProgress, exportCsv, exportProgressBackup, loadProgress, parseProgressBackup, resetDemoProgress, saveProgress, useDemoStorage, type RestorableBackup } from './storage';
import { captureLicenseFromUrl, checkoutUrl, hasOptimisticUnlock, hasStoredLicense, removeLicense, storeLicense, verifyLicense } from './license';

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
let pendingBackup: RestorableBackup | null = null;
let backupNotice = '';

const today = new Date().toISOString().slice(0, 10);
if (progress.lastVisit !== today) {
  progress.sessions += 1;
  progress.lastVisit = today;
  saveProgress(progress);
}

function route(): 'practice' | 'privacy' | 'terms' | 'not-found' {
  if (location.pathname === '/privacy') return 'privacy';
  if (location.pathname === '/terms') return 'terms';
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
  discardDemoProgress();
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
    const label = playing ? 'Playing…' : answer ? 'Replay chord pattern' : 'Play chord pattern';
    button.innerHTML = `<span class="play-icon" aria-hidden="true">▶</span>${label} <kbd>Space</kbd>`;
  }
  if (!playing) document.querySelectorAll('.voice-column').forEach(node => node.classList.remove('is-sounding'));
}

function submitAnswer(choice: string): void {
  if (progress.sandbox) {
    const preview = exercisesByModule[moduleId].find(item => item.answer === choice);
    if (preview) void playSequence(preview.sequence, texture());
    announce(`Previewing ${choice}. Explore mode does not score answers.`);
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
  const countNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
  const groupCount = countNames[item.sequence.length] ?? String(item.sequence.length);
  return `<svg class="voice-map" viewBox="0 0 ${width} ${height}" role="img" aria-label="Chord pattern with ${groupCount} note groups and one line for each voice."><g class="voice-paths">${paths}</g>${columns}</svg>`;
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

function backupPreview(): string {
  if (!pendingBackup) return backupNotice;
  const restored = pendingBackup.progress;
  const record = pendingBackup.recordCount === 1 ? 'record' : 'records';
  const mode = restored.sandbox ? 'Explore mode' : 'Scoring mode';
  const levelChange = restored.holdLevel ? 'Keep current level' : 'Automatic level changes';
  return `<p>Backup ready: ${pendingBackup.recordCount} saved ${record}.</p><p>Levels: Note roles ${restored.level.intervals}, Progressions ${restored.level.progressions}, Sing it back ${restored.level.sing}. ${mode}; ${levelChange}; ${restored.texture} sound.</p><div class="button-row"><button data-action="confirm-restore" class="primary">Replace local progress</button><button data-action="cancel-restore">Cancel restore</button></div>`;
}

function renderHeader(): string {
  const themeAction = document.documentElement.dataset.theme === 'dark' ? 'Use light theme' : 'Use dark theme';
  return `<header class="site-header">
    <a class="wordmark" href="/" data-nav="/"><span class="mark" aria-hidden="true"><i></i><i></i><i></i></span> Ear in Context</a>
    <nav aria-label="Site navigation">
      <a href="/" data-nav="/">Practice</a>
      <a href="/demo" data-nav="/demo">Demo</a>
      <a href="/privacy" data-nav="/privacy">Privacy</a>
    </nav>
    <button class="theme-button" data-action="theme" type="button" aria-label="${themeAction}"><span aria-hidden="true">◐</span><span class="theme-label">${themeAction}</span></button>
  </header>`;
}

function renderFooter(): string {
  return `<footer><p>Hear chord patterns, then name or sing the next note.</p><p><a href="/privacy" data-nav="/privacy">Privacy</a> · <a href="/terms" data-nav="/terms">Terms</a> · <a href="https://sociobot.in">Built by Param Factory (external)</a> · v1.2.0</p></footer>`;
}

function practiceControls(): string {
  const controls = `<div class="global-controls" aria-label="Practice controls">
    <label class="switch"><input type="checkbox" data-control="sandbox" ${progress.sandbox ? 'checked' : ''}><span>Explore mode</span><small>${progress.sandbox ? 'Nothing is scored' : 'Scoring is on'}</small></label>
    <label class="switch"><input type="checkbox" data-control="hold" ${progress.holdLevel ? 'checked' : ''}><span>Keep current level</span><small>${progress.holdLevel ? 'Level changes are paused' : 'Level can change with your score'}</small></label>
    <label class="level-control"><span>Difficulty</span><select data-control="level" aria-label="Difficulty level"><option value="1" ${progress.level[moduleId] === 1 ? 'selected' : ''}>1 · Starter set</option><option value="2" ${progress.level[moduleId] === 2 ? 'selected' : ''}>2 · Larger set</option><option value="3" ${progress.level[moduleId] === 3 ? 'selected' : ''}>3 · Full set</option></select><small>Higher levels add note roles, chord patterns, or singing targets.</small></label>
  </div>`;
  return isDemo ? `<details class="demo-setup"><summary>Practice settings</summary>${controls}</details>` : controls;
}

function renderPolicy(kind: 'privacy' | 'terms'): void {
  const privacy = kind === 'privacy';
  app.innerHTML = `${renderHeader()}<main id="main" class="policy"><p class="eyebrow">Plain-language ${privacy ? 'privacy' : 'terms'}</p><h1 tabindex="-1">${privacy ? 'Privacy for your ear practice' : 'Terms for ear practice'}</h1>
    ${privacy ? `<h2>What is stored</h2><p>Practice history, settings, and any Studio license are stored in your browser's local storage. Microphone audio is analysed live on your device and is never recorded, uploaded, or retained.</p><h2>Network requests</h2><p>Core practice works without an account. Studio checkout opens on Sociobot. When you verify Studio, your browser sends its license token to Sociobot. This site loads no behavioural analytics, ads, or third-party scripts.</p><h2>Your control</h2><p>Use “Erase local progress” in Practice to remove training history. Use “Remove stored license” to remove the Studio license on this browser. CSV export works without Studio.</p><h2>Contact</h2><p>Questions can be sent through <a href="https://sociobot.in">sociobot.in (external)</a>. Effective 28 August 2026.</p>` : `<h2>Using the trainer</h2><p>Ear in Context is an educational practice aid. It does not promise a specific musical result. Keep device volume comfortable.</p><h2>Studio purchase</h2><p>Studio is a $24 one-time purchase. It adds Clarity and Reed textures plus a progress backup you can restore. Core practice and CSV export work without Studio. Studio checkout opens on Sociobot.</p><h2>Studio license</h2><p>Paste an active Studio license to restore Studio on this browser. Invalid or revoked licenses do not unlock Studio. Remove the stored license whenever you need to.</p><h2>Contact</h2><p>Questions can be sent through <a href="https://sociobot.in">sociobot.in (external)</a>. Effective 28 August 2026.</p>`}
    <a class="button-link" href="/" data-nav="/">Return to practice</a></main>${renderFooter()}<div id="live-status" class="sr-only" aria-live="polite"></div>`;
  bindCommon();
}

function renderNotFound(): void {
  app.innerHTML = `${renderHeader()}<main id="main" class="policy not-found"><p class="eyebrow">Wrong turn</p><h1 tabindex="-1">That practice page does not exist</h1><p>Open your practice or try the sample practice.</p><div class="button-row"><a class="button-link primary" href="/" data-nav="/">Open practice</a><a class="button-link" href="/demo" data-nav="/demo">Try sample practice</a></div></main>${renderFooter()}<div id="live-status" class="sr-only" aria-live="polite"></div>`;
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
          ? { title: 'Demo — Ear in Context', description: 'Try the sample practice without changing your saved progress.' }
          : { title: 'Ear in Context — practice hearing harmony', description: 'Practice hearing harmony in generated chord patterns with note-role, progression, and sung-pitch exercises.' };
  document.title = details.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', details.description);
  const canonicalPath = isDemo && current === 'practice' ? '/demo' : location.pathname;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${location.origin}${canonicalPath}`);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', details.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', details.description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', details.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', details.description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${location.origin}${canonicalPath}`);
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
    ${isDemo ? `<aside class="demo-banner" aria-label="Demo status"><strong>Demo — sample data, nothing is saved</strong><span class="demo-actions"><button data-action="reset-demo">Reset demo</button><button data-action="start-real" aria-describedby="demo-exit-note">Open your practice</button></span><span id="demo-exit-note" class="sr-only">Sample progress is discarded. Saved progress is unchanged.</span></aside>` : ''}
    ${!online ? '<div class="offline-banner" role="status">Offline practice is ready.</div>' : ''}
    ${!isDemo ? `<section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><p class="eyebrow">Ear training for self-taught musicians</p><h1 id="hero-title" tabindex="-1">Practice hearing harmony in chord patterns</h1><p class="dek">For self-taught musicians who want to hear how notes move together.</p><div class="hero-actions"><a class="button-link primary" href="/demo" data-nav="/demo">Try sample practice</a><span>Hear a short chord pattern, then choose the next note.</span></div><ul class="plain-facts"><li>No account</li><li>Practice audio stays in your browser</li><li>Core practice and CSV export work without Studio</li></ul></div>
      <picture><source srcset="/assets/voice-paths.webp" type="image/webp"><img src="/assets/voice-paths.jpg" width="1200" height="800" alt="Paper pitch tokens connected by gently moving teal voice paths" fetchpriority="high" decoding="async"></picture>
    </section>` : ''}
    <section id="practice" class="practice-shell ${isDemo ? 'sample-practice-shell' : ''}" aria-labelledby="practice-title">
      <div class="practice-heading"><div>${isDemo ? '<h1 id="practice-title" tabindex="-1">Sample practice</h1>' : '<p class="eyebrow">Listen, choose, sing</p><h2 id="practice-title">Today’s ear practice</h2>'}</div><div class="score" aria-label="Session progress"><strong>${progress.answered}</strong> answered <span>·</span> <strong>${accuracy()}%</strong> right</div></div>
      ${practiceControls()}
      <div class="module-tabs" role="tablist" aria-label="Training module">
        <button id="module-tab-intervals" role="tab" aria-controls="practice-panel" aria-selected="${moduleId === 'intervals'}" tabindex="${moduleId === 'intervals' ? '0' : '-1'}" data-module="intervals"><span>01</span> Note roles <small>(scale degrees)</small></button>
        <button id="module-tab-progressions" role="tab" aria-controls="practice-panel" aria-selected="${moduleId === 'progressions'}" tabindex="${moduleId === 'progressions' ? '0' : '-1'}" data-module="progressions"><span>02</span> Progressions</button>
        <button id="module-tab-sing" role="tab" aria-controls="practice-panel" aria-selected="${moduleId === 'sing'}" tabindex="${moduleId === 'sing' ? '0' : '-1'}" data-module="sing"><span>03</span> Sing it back</button>
      </div>
      <div id="practice-panel" role="tabpanel" tabindex="0" aria-labelledby="module-tab-${moduleId}"></div>
    </section>
    ${!isDemo ? `<section class="how-it-works" aria-labelledby="how-title"><p class="eyebrow">Three ways to practice</p><h2 id="how-title">Listen, choose, then sing</h2><ol><li><strong>Play a chord pattern.</strong><span>Hear where the home chord settles.</span></li><li><strong>Name the next note.</strong><span>Use Note roles or compare Progressions.</span></li><li><strong>Sing it back.</strong><span>See one sung pitch on the two-octave keyboard.</span></li></ol></section><section class="boundaries" aria-labelledby="boundaries-title"><div><p class="eyebrow">Clear boundaries</p><h2 id="boundaries-title">Generated patterns, not song recordings</h2></div><p>The practice makes short chord patterns in your browser. It does not load songs or record your voice. Microphone sound is analysed live and is not retained.</p></section><section class="studio" aria-labelledby="studio-title"><div><p class="eyebrow">Optional Studio</p><h2 id="studio-title">Choose extra sound textures</h2><p>Studio adds Clarity and Reed textures plus a progress backup you can restore. Core practice and CSV export work without Studio.</p></div><div class="studio-buy"><strong>$24</strong><span>one-time purchase</span>${studioUnlocked ? '<span class="unlocked">✓ Studio unlocked</span>' : `<a class="button-link dark" href="${checkoutUrl()}">Open Studio checkout (external)</a>`}</div></section>` : ''}
    <section class="settings" aria-labelledby="settings-title"><details><summary id="settings-title">Progress, sound & license</summary><div class="settings-grid">
      <div><h3>Sound texture</h3><div class="texture-options"><button data-texture="warm" aria-label="Warm texture, free" aria-pressed="${texture() === 'warm'}">Warm <small>Free</small></button><button data-texture="clarity" aria-label="Clarity texture, ${studioUnlocked ? 'Studio' : 'locked'}" aria-pressed="${texture() === 'clarity'}" ${studioUnlocked ? '' : 'data-locked="true"'}>Clarity <small>${studioUnlocked ? 'Studio' : 'Locked'}</small></button><button data-texture="reed" aria-label="Reed texture, ${studioUnlocked ? 'Studio' : 'locked'}" aria-pressed="${texture() === 'reed'}" ${studioUnlocked ? '' : 'data-locked="true"'}>Reed <small>${studioUnlocked ? 'Studio' : 'Locked'}</small></button></div></div>
      <div><h3>Your data</h3><p>${Object.keys(progress.reviews).length ? `${Object.keys(progress.reviews).length} items have scored answers.` : 'No scored answers yet. Turn off Explore mode when you are ready.'}</p><div class="button-row"><button aria-label="Export progress as CSV" data-action="export">Export CSV</button>${studioUnlocked ? '<button aria-label="Download progress backup" data-action="backup">Download progress backup</button><button aria-label="Restore progress backup" data-action="restore-backup">Restore progress backup</button><input id="backup-file" data-action="backup-file" type="file" accept="application/json,.json" hidden>' : ''}<button aria-label="Erase local progress" data-action="erase" class="quiet-danger">Erase local progress</button></div>${studioUnlocked ? `<div id="backup-status" class="backup-status" role="status" aria-live="polite" tabindex="-1">${backupPreview()}</div>` : ''}</div>
      <form id="license-form"><h3>Restore Studio</h3><label for="license-token">Have a license? Paste it here.</label><input id="license-token" name="license" autocomplete="off" spellcheck="false" required><button aria-label="Verify Studio license" type="submit">Verify license</button>${hasStoredLicense() ? '<button type="button" data-action="remove-license">Remove stored license</button>' : ''}<p id="license-status" role="status" tabindex="-1">${licenseNotice}</p><p class="fine">Studio checkout opens on Sociobot. <a href="/terms" data-nav="/terms">Read the terms</a>.</p></form>
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
  const modeLabel = progress.sandbox ? 'Explore mode · preview sounds' : 'Scoring mode · answer when ready';
  const result = answer ? `<div class="feedback ${answerCorrect ? 'correct' : 'incorrect'}" role="status"><strong>${answerCorrect ? '✓ You heard the path.' : `↗ The answer was ${exercise.answer}.`}</strong><p>${exercise.explanation}</p><button class="primary" data-action="next">Open next question <kbd>N</kbd></button></div>` : '';
  const exerciseHeading = isDemo ? 'h2' : 'h3';
  const choices = exercise.choices.filter(choice => {
    const source = exercisesByModule[moduleId].find(item => item.answer === choice);
    return !source || source.level <= progress.level[moduleId];
  });
  panel.innerHTML = `<article class="exercise" aria-labelledby="exercise-title">
    <div class="context-panel"><div class="exercise-meta"><span>${modeLabel}</span><span>Level ${exercise.level}</span></div>${voiceDiagram(exercise)}<p class="diagram-caption">Each line shows one voice. Short paths show notes changing by small steps.</p><button class="listen-button" data-action="play" ${playing ? 'disabled' : ''}><span class="play-icon" aria-hidden="true">▶</span>${playing ? 'Playing…' : answer ? 'Replay chord pattern' : 'Play chord pattern'} <kbd>Space</kbd></button></div>
    <div class="answer-panel"><p class="eyebrow">${moduleId === 'sing' ? 'Voice feedback' : 'Your ear'}</p><${exerciseHeading} id="exercise-title">${exercise.prompt}</${exerciseHeading}><p class="instruction">${moduleId === 'sing' ? 'Listen first, then start the mic. The marker shows your current note—not a recording.' : progress.sandbox ? 'Choose any answer to preview its sound. Turn off Explore mode to score your answer.' : 'Listen for the note’s role in the chord pattern.'}</p>
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
  document.querySelector<HTMLButtonElement>('[data-action="backup"]')?.addEventListener('click', () => download('ear-in-context-backup.json', exportProgressBackup(progress), 'application/json'));
  document.querySelector<HTMLButtonElement>('[data-action="restore-backup"]')?.addEventListener('click', () => {
    document.querySelector<HTMLInputElement>('#backup-file')?.click();
  });
  document.querySelector<HTMLInputElement>('[data-action="backup-file"]')?.addEventListener('change', async event => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      pendingBackup = parseProgressBackup(await file.text());
      backupNotice = '';
    } catch (error) {
      pendingBackup = null;
      backupNotice = error instanceof Error ? `${error.message} Local progress was not changed.` : 'This backup could not be read. Local progress was not changed.';
    }
    render();
    const details = document.querySelector<HTMLDetailsElement>('.settings details');
    if (details) details.open = true;
    document.querySelector<HTMLElement>('#backup-status')?.focus();
  });
  document.querySelector<HTMLButtonElement>('[data-action="confirm-restore"]')?.addEventListener('click', () => {
    if (!pendingBackup) return;
    progress = pendingBackup.progress;
    pendingBackup = null;
    backupNotice = 'Progress backup restored.';
    answer = null;
    exercise = chooseExercise(exercisesByModule[moduleId], progress, moduleId);
    save();
    render();
    const details = document.querySelector<HTMLDetailsElement>('.settings details');
    if (details) details.open = true;
    document.querySelector<HTMLElement>('#backup-status')?.focus();
  });
  document.querySelector<HTMLButtonElement>('[data-action="cancel-restore"]')?.addEventListener('click', () => {
    pendingBackup = null;
    backupNotice = 'Restore cancelled. Local progress was not changed.';
    render();
    const details = document.querySelector<HTMLDetailsElement>('.settings details');
    if (details) details.open = true;
    document.querySelector<HTMLElement>('#backup-status')?.focus();
  });
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
    const details = document.querySelector<HTMLDetailsElement>('.settings details');
    if (details) details.open = true;
    document.querySelector<HTMLElement>('#license-status')?.focus();
  });
  document.querySelector<HTMLButtonElement>('[data-action="remove-license"]')?.addEventListener('click', () => {
    removeLicense();
    studioUnlocked = false;
    licenseNotice = 'Stored Studio license removed.';
    render();
    const details = document.querySelector<HTMLDetailsElement>('.settings details');
    if (details) details.open = true;
    document.querySelector<HTMLElement>('#license-status')?.focus();
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
    const button = document.querySelector<HTMLButtonElement>('[data-action="theme"]');
    const nextAction = dark ? 'Use light theme' : 'Use dark theme';
    button?.setAttribute('aria-label', nextAction);
    const label = button?.querySelector<HTMLElement>('.theme-label');
    if (label) label.textContent = nextAction;
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
  if (event.key.toLowerCase() === 'e') { progress.sandbox = !progress.sandbox; answer = null; save(); render(); }
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
