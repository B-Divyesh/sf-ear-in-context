import { describe, expect, it } from 'vitest';
import { detectPitch } from '../src/pitch';

function sine(frequency: number, length = 4096, sampleRate = 48_000): Float32Array {
  return Float32Array.from({ length }, (_, index) => Math.sin(2 * Math.PI * frequency * index / sampleRate) * 0.6);
}

describe('local pitch detection', () => {
  it('detects A4 without a network model', () => {
    const result = detectPitch(sine(440), 48_000);
    expect(result).not.toBeNull();
    expect(result!.frequency).toBeCloseTo(440, 0);
  });

  it('rejects silence', () => {
    expect(detectPitch(new Float32Array(4096), 48_000)).toBeNull();
  });
});
