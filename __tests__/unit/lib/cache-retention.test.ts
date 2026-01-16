import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('lib/cache retention config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses default when REPORTS_MAX_RUNS is unset', async () => {
    delete process.env.REPORTS_MAX_RUNS;
    const { getReportsMaxRunsFromEnv } = await import('@/lib/cache');
    expect(getReportsMaxRunsFromEnv()).toBe(30);
  });

  it('accepts a valid REPORTS_MAX_RUNS value', async () => {
    process.env.REPORTS_MAX_RUNS = '25';
    const { getReportsMaxRunsFromEnv } = await import('@/lib/cache');
    expect(getReportsMaxRunsFromEnv()).toBe(25);
  });

  it('rejects non-numeric REPORTS_MAX_RUNS', async () => {
    process.env.REPORTS_MAX_RUNS = 'abc';
    const { getReportsMaxRunsFromEnv } = await import('@/lib/cache');
    expect(() => getReportsMaxRunsFromEnv()).toThrow('REPORTS_MAX_RUNS must be an integer');
  });

  it('rejects out-of-range REPORTS_MAX_RUNS', async () => {
    process.env.REPORTS_MAX_RUNS = '0';
    const { getReportsMaxRunsFromEnv } = await import('@/lib/cache');
    expect(() => getReportsMaxRunsFromEnv()).toThrow('REPORTS_MAX_RUNS must be between');
  });
});
