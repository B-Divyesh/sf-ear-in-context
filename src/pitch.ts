export interface PitchReading {
  frequency: number;
  confidence: number;
}

/** YIN-style autocorrelation tuned for monophonic voice. Returns null for silence/noise. */
export function detectPitch(buffer: Float32Array, sampleRate: number): PitchReading | null {
  let rms = 0;
  for (const sample of buffer) rms += sample * sample;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.012) return null;

  const minLag = Math.floor(sampleRate / 1000);
  const maxLag = Math.min(Math.floor(sampleRate / 70), Math.floor(buffer.length / 2));
  const difference = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0;
    for (let i = 0; i < buffer.length - lag; i += 1) {
      const delta = buffer[i] - buffer[i + lag];
      sum += delta * delta;
    }
    difference[lag] = sum;
  }

  let running = 0;
  const threshold = 0.15;
  let bestLag = -1;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    running += difference[lag];
    const normalized = running === 0 ? 1 : difference[lag] * lag / running;
    if (normalized < threshold && difference[lag] <= difference[lag - 1]) {
      bestLag = lag;
      while (bestLag + 1 <= maxLag && difference[bestLag + 1] < difference[bestLag]) bestLag += 1;
      break;
    }
  }
  if (bestLag < 0) return null;

  const before = difference[bestLag - 1] ?? difference[bestLag];
  const current = difference[bestLag];
  const after = difference[bestLag + 1] ?? current;
  const divisor = 2 * (2 * current - before - after);
  const refinedLag = divisor === 0 ? bestLag : bestLag + (after - before) / divisor;
  const frequency = sampleRate / refinedLag;
  if (!Number.isFinite(frequency) || frequency < 70 || frequency > 1000) return null;
  return { frequency, confidence: Math.max(0, Math.min(1, 1 - current / (rms * rms * buffer.length))) };
}

export interface PitchMonitor {
  stop: () => void;
}

export async function startPitchMonitor(onPitch: (reading: PitchReading | null) => void): Promise<PitchMonitor> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone input is not supported in this browser.');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = 0;
  const source = ctx.createMediaStreamSource(stream);
  source.connect(analyser);
  const buffer = new Float32Array(analyser.fftSize);
  let animation = 0;
  let lastRun = 0;
  const loop = (time: number): void => {
    if (time - lastRun > 70) {
      analyser.getFloatTimeDomainData(buffer);
      onPitch(detectPitch(buffer, ctx.sampleRate));
      lastRun = time;
    }
    animation = requestAnimationFrame(loop);
  };
  animation = requestAnimationFrame(loop);
  return {
    stop: () => {
      cancelAnimationFrame(animation);
      stream.getTracks().forEach(track => track.stop());
      void ctx.close();
    },
  };
}
