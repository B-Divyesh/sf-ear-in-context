import { initialProgress, type ProgressState, type Review } from './scheduler';

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

/** Leaving the sample removes its disposable state without touching real progress. */
export function discardDemoProgress(): void {
  localStorage.removeItem(DEMO_KEY);
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

const BACKUP_FORMAT = 'ear-in-context-progress';
const BACKUP_VERSION = 1;

export interface ProgressBackup {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  progress: ProgressState;
}

export interface RestorableBackup {
  progress: ProgressState;
  recordCount: number;
}

/**
 * Backups are deliberately a small, versioned envelope rather than a raw
 * localStorage value. That makes a downloaded file safe to recognise before a
 * restore can replace anything on the device.
 */
export function exportProgressBackup(progress: ProgressState): string {
  const backup: ProgressBackup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    progress,
  };
  return JSON.stringify(backup, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isReview(value: unknown): value is Review {
  if (!isRecord(value)) return false;
  return typeof value.ease === 'number' && Number.isFinite(value.ease)
    && typeof value.intervalDays === 'number' && Number.isFinite(value.intervalDays) && value.intervalDays >= 0
    && typeof value.dueAt === 'number' && Number.isFinite(value.dueAt) && value.dueAt >= 0
    && isCount(value.attempts) && isCount(value.correct) && value.correct <= value.attempts;
}

/** Validates every stored field before a restore is allowed to replace progress. */
export function parseProgressBackup(text: string): RestorableBackup {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!isRecord(value) || value.format !== BACKUP_FORMAT || value.version !== BACKUP_VERSION || typeof value.exportedAt !== 'string' || !isRecord(value.progress)) {
    throw new Error('This file is not an Ear in Context progress backup.');
  }
  const source = value.progress;
  if (!isRecord(source.reviews) || !isRecord(source.level)
    || !isCount(source.sessions) || !isCount(source.answered) || !isCount(source.correct)
    || source.correct > source.answered || typeof source.holdLevel !== 'boolean'
    || typeof source.sandbox !== 'boolean' || typeof source.lastVisit !== 'string'
    || !['warm', 'clarity', 'reed'].includes(String(source.texture))) {
    throw new Error('This backup has missing or invalid progress fields.');
  }
  const level = source.level;
  if (!['intervals', 'progressions', 'sing'].every(module => Number.isInteger(level[module]) && Number(level[module]) >= 1 && Number(level[module]) <= 3)) {
    throw new Error('This backup has invalid difficulty settings.');
  }
  const reviews: Record<string, Review> = Object.create(null) as Record<string, Review>;
  for (const [id, review] of Object.entries(source.reviews)) {
    if (!id || !isReview(review)) throw new Error('This backup has an invalid saved record.');
    reviews[id] = review;
  }
  return {
    progress: {
      reviews,
      level: { intervals: Number(level.intervals), progressions: Number(level.progressions), sing: Number(level.sing) },
      holdLevel: source.holdLevel,
      sandbox: source.sandbox,
      sessions: source.sessions,
      answered: source.answered,
      correct: source.correct,
      lastVisit: source.lastVisit,
      texture: String(source.texture),
    },
    recordCount: Object.keys(reviews).length,
  };
}
