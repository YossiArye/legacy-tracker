import { describe, it, expect, afterEach, vi } from 'vitest';
import { getTaskAgeInDays } from '../utils/taskAge.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const NOW = new Date('2026-08-03T12:00:00.000Z');

describe('getTaskAgeInDays', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0 for a task created at the current moment', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    expect(getTaskAgeInDays({ createdAt: NOW.getTime() })).toBe(0);
  });

  it('returns the whole number of days for an exact multiple of a day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    expect(getTaskAgeInDays({ createdAt: NOW.getTime() - 3 * MS_PER_DAY })).toBe(3);
  });

  it('floors partial days instead of rounding them up', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    // 2 days and 23 hours old — still 2 whole days, not 3.
    const createdAt = NOW.getTime() - (2 * MS_PER_DAY + 23 * 60 * 60 * 1000);

    expect(getTaskAgeInDays({ createdAt })).toBe(2);
  });

  it('is not affected by the time of day a task was created', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    // Created one minute before midnight, five days back. Calendar-day counting
    // would call this 5; elapsed-time counting calls it 4. This pins the latter.
    const createdAt = new Date('2026-07-29T23:59:00.000Z').getTime();

    expect(getTaskAgeInDays({ createdAt })).toBe(4);
  });
});
