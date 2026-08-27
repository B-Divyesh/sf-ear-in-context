import { midiToFrequency, type TextureId } from './music';

let context: AudioContext | null = null;
let activeNodes: AudioScheduledSourceNode[] = [];

function audioContext(): AudioContext {
  context ??= new AudioContext();
  return context;
}

function stopActive(): void {
  activeNodes.forEach(node => { try { node.stop(); } catch { /* already ended */ } });
  activeNodes = [];
}

function voice(ctx: AudioContext, midi: number, start: number, duration: number, texture: TextureId, destination: AudioNode): void {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(texture === 'clarity' ? 0.075 : 0.095, start + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  gain.connect(destination);

  const oscillator = ctx.createOscillator();
  oscillator.type = texture === 'warm' ? 'triangle' : texture === 'clarity' ? 'sine' : 'sawtooth';
  oscillator.frequency.value = midiToFrequency(midi);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = texture === 'reed' ? 1250 : 2200;
  oscillator.connect(filter).connect(gain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
  activeNodes.push(oscillator);

  if (texture !== 'warm') {
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.value = midiToFrequency(midi) * (texture === 'reed' ? 2 : 3);
    overtoneGain.gain.value = texture === 'reed' ? 0.025 : 0.012;
    overtone.connect(overtoneGain).connect(gain);
    overtone.start(start);
    overtone.stop(start + duration + 0.05);
    activeNodes.push(overtone);
  }
}

export async function playSequence(sequence: number[][], texture: TextureId = 'warm', onStep?: (index: number) => void): Promise<void> {
  const ctx = audioContext();
  await ctx.resume();
  stopActive();
  const master = ctx.createGain();
  master.gain.value = 0.8 / Math.max(1, Math.sqrt(sequence[0]?.length ?? 1));
  master.connect(ctx.destination);
  const beat = 0.72;
  const start = ctx.currentTime + 0.04;
  sequence.forEach((chord, index) => {
    chord.forEach(midi => voice(ctx, midi, start + index * beat, beat * 0.88, texture, master));
    if (onStep) window.setTimeout(() => onStep(index), 40 + index * beat * 1000);
  });
  await new Promise(resolve => window.setTimeout(resolve, sequence.length * beat * 1000 + 80));
}

export async function playNote(midi: number, texture: TextureId = 'warm', duration = 0.8): Promise<void> {
  const ctx = audioContext();
  await ctx.resume();
  stopActive();
  const master = ctx.createGain();
  master.connect(ctx.destination);
  voice(ctx, midi, ctx.currentTime + 0.02, duration, texture, master);
}

export function closeAudio(): void {
  stopActive();
  void context?.close();
  context = null;
}
