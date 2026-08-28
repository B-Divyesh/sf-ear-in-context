import { describe, expect, it } from 'vitest';
import { exportProgressBackup, parseProgressBackup } from '../src/storage';
import { initialProgress } from '../src/scheduler';

describe('versioned progress backups', () => {
  it('round-trips every progress field in a versioned envelope', () => {
    const progress = initialProgress();
    progress.reviews['degree-1'] = { attempts: 2, correct: 1, ease: 2.3, intervalDays: 1, dueAt: 1_800_000_000_000 };
    progress.level = { intervals: 2, progressions: 3, sing: 1 };
    progress.holdLevel = true;
    progress.sandbox = false;
    progress.sessions = 4;
    progress.answered = 2;
    progress.correct = 1;
    progress.lastVisit = '2026-08-28';
    progress.texture = 'clarity';

    const envelope = JSON.parse(exportProgressBackup(progress));
    expect(envelope).toMatchObject({ format: 'ear-in-context-progress', version: 1, progress });
    expect(parseProgressBackup(JSON.stringify(envelope))).toEqual({ progress, recordCount: 1 });
  });

  it('rejects malformed or incompatible backups before they can replace progress', () => {
    expect(() => parseProgressBackup('{')).toThrow('not valid JSON');
    expect(() => parseProgressBackup(JSON.stringify({ format: 'ear-in-context-progress', version: 2, exportedAt: '', progress: {} }))).toThrow('not an Ear in Context progress backup');
    const invalidProgress = { ...initialProgress(), answered: 1, correct: 2 };
    expect(() => parseProgressBackup(JSON.stringify({ format: 'ear-in-context-progress', version: 1, exportedAt: new Date().toISOString(), progress: invalidProgress }))).toThrow('missing or invalid progress fields');
  });
});
