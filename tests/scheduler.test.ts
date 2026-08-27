import { describe, expect, it } from 'vitest';
import { intervalExercises } from '../src/music';
import { chooseExercise, initialProgress, nextLevel, schedule } from '../src/scheduler';

describe('spaced review scheduler', () => {
  it('returns missed items soon without forcing a replay', () => {
    const now = 1_700_000_000_000;
    const review = schedule(undefined, false, now);
    expect(review.attempts).toBe(1);
    expect(review.intervalDays).toBe(0);
    expect(review.dueAt).toBe(now + 10 * 60_000);
  });

  it('expands intervals after a correct review', () => {
    const first = schedule(undefined, true, 0);
    const second = schedule(first, true, 0);
    expect(first.intervalDays).toBe(1);
    expect(second.intervalDays).toBeGreaterThan(1);
  });

  it('only selects exercises at the chosen level', () => {
    const state = initialProgress();
    const selected = chooseExercise(intervalExercises, state, 'intervals', Date.now(), () => 0.99);
    expect(selected.level).toBe(1);
  });

  it('respects hold level even after strong accuracy', () => {
    const state = initialProgress();
    state.holdLevel = true;
    state.reviews['degree-1'] = { ease: 2.8, intervalDays: 8, dueAt: 0, attempts: 10, correct: 10 };
    expect(nextLevel(state, 'intervals')).toBe(1);
  });
});
