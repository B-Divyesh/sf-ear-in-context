import { initialProgress, type ProgressState } from './scheduler';

const REAL_KEY = 'ear-in-context:progress:v1';
const DEMO_KEY = 'demo:ear-in-context:progress:v1';
let key = REAL_KEY;

/** Demo state is deliberately kept in a different localStorage namespace. */
export function useDemoStorage(demo: boolean): void {
  key = demo ? DEMO_KEY : REAL_KEY;
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return initialProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...initialProgress(),
      ...parsed,
      level: { ...initialProgress().level, ...parsed.level },
      reviews: parsed.reviews ?? {},
    };
  } catch {
    return initialProgress();
  }
}

export function saveProgress(progress: ProgressState): void {
  try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* private browsing can deny storage */ }
}

export function clearProgress(): void {
  localStorage.removeItem(key);
}

export function resetDemoProgress(): ProgressState {
  const sample = initialProgress();
  // A small, representative practice record makes the sample feel used while
  // remaining entirely separate from a visitor's actual progress.
  sample.answered = 3;
  sample.correct = 2;
  sample.sessions = 1;
  sample.lastVisit = new Date().toISOString().slice(0, 10);
  sample.reviews['degree-1'] = { attempts: 2, correct: 1, ease: 2.3, intervalDays: 1, dueAt: Date.now() + 86_400_000 };
  sample.reviews['progression-1'] = { attempts: 1, correct: 1, ease: 2.6, intervalDays: 2, dueAt: Date.now() + 172_800_000 };
  saveProgress(sample);
  return sample;
}

export const storageKeys = { real: REAL_KEY, demo: DEMO_KEY };

export function exportCsv(progress: ProgressState): string {
  const rows = ['exercise,attempts,correct,accuracy,next_review'];
  for (const [id, review] of Object.entries(progress.reviews)) {
    rows.push([id, review.attempts, review.correct, Math.round((review.correct / review.attempts) * 100) + '%', new Date(review.dueAt).toISOString()].join(','));
  }
  return rows.join('\n');
}
