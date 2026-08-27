import { describe, expect, it } from 'vitest';
import { frequencyToMidi, midiName, midiToFrequency, progressionExercises } from '../src/music';

describe('music utilities and material', () => {
  it('round-trips concert A', () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(frequencyToMidi(440)).toBe(69);
    expect(midiName(69)).toBe('A4');
  });

  it('keeps adjacent upper voices compact in the core progression', () => {
    const progression = progressionExercises[0].sequence;
    for (let chord = 1; chord < progression.length; chord += 1) {
      for (let voice = 1; voice < progression[chord].length; voice += 1) {
        expect(Math.abs(progression[chord][voice] - progression[chord - 1][voice])).toBeLessThanOrEqual(5);
      }
    }
  });
});
