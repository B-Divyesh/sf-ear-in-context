import type { Exercise, ModuleId } from './music';

export interface Review {
  ease: number;
  intervalDays: number;
  dueAt: number;
  attempts: number;
  correct: number;
}

export interface ProgressState {
  reviews: Record<string, Review>;
  level: Record<ModuleId, number>;
  holdLevel: boolean;
  sandbox: boolean;
  sessions: number;
  answered: number;
  correct: number;
  lastVisit: string;
  texture: string;
}

export const initialProgress = (): ProgressState => ({
  reviews: {},
  level: { intervals: 1, progressions: 1, sing: 1 },
  holdLevel: false,
  sandbox: true,
  sessions: 0,
  answered: 0,
  correct: 0,
  lastVisit: '',
  texture: 'warm',
});

export function schedule(review: Review | undefined, correct: boolean, now = Date.now()): Review {
  const current = review ?? { ease: 2.3, intervalDays: 0, dueAt: now, attempts: 0, correct: 0 };
  const ease = Math.max(1.3, Math.min(2.8, current.ease + (correct ? 0.08 : -0.2)));
  const intervalDays = correct
    ? current.intervalDays === 0 ? 1 : Math.max(1, Math.round(current.intervalDays * ease))
    : 0;
  return {
    ease,
    intervalDays,
    dueAt: now + (correct ? intervalDays * 86_400_000 : 10 * 60_000),
    attempts: current.attempts + 1,
    correct: current.correct + Number(correct),
  };
}

export function chooseExercise(exercises: Exercise[], state: ProgressState, module: ModuleId, now = Date.now(), random = Math.random): Exercise {
  const eligible = exercises.filter(item => item.level <= state.level[module]);
  const due = eligible.filter(item => (state.reviews[item.id]?.dueAt ?? 0) <= now);
  const pool = due.length ? due : eligible;
  const sorted = [...pool].sort((a, b) => (state.reviews[a.id]?.dueAt ?? 0) - (state.reviews[b.id]?.dueAt ?? 0));
  const window = sorted.slice(0, Math.min(3, sorted.length));
  return window[Math.floor(random() * window.length)] ?? exercises[0];
}

export function nextLevel(state: ProgressState, module: ModuleId): number {
  if (state.holdLevel) return state.level[module];
  const recent = Object.entries(state.reviews)
    .filter(([id]) => id.startsWith(module === 'intervals' ? 'degree-' : module === 'progressions' ? 'progression-' : 'sing-'))
    .map(([, review]) => review)
    .filter(review => review.attempts > 0);
  const attempts = recent.reduce((sum, review) => sum + review.attempts, 0);
  const accuracy = recent.reduce((sum, review) => sum + review.correct, 0) / Math.max(1, attempts);
  if (attempts >= 8 && accuracy >= 0.8) return Math.min(3, state.level[module] + 1);
  return state.level[module];
}
