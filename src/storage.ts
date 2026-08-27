import { initialProgress, type ProgressState } from './scheduler';

const KEY = 'ear-in-context:progress:v1';

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
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
  try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* private browsing can deny storage */ }
}

export function clearProgress(): void {
  localStorage.removeItem(KEY);
}

export function exportCsv(progress: ProgressState): string {
  const rows = ['exercise,attempts,correct,accuracy,next_review'];
  for (const [id, review] of Object.entries(progress.reviews)) {
    rows.push([id, review.attempts, review.correct, Math.round((review.correct / review.attempts) * 100) + '%', new Date(review.dueAt).toISOString()].join(','));
  }
  return rows.join('\n');
}
