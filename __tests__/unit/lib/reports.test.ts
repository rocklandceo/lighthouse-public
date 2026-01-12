import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the cache module
vi.mock('@/lib/cache', () => ({
  getLatestReport: vi.fn(),
  getAllReportRuns: vi.fn(),
}));

import { getAverageScores, getTrendData, type ReportRun } from '@/lib/reports';

describe('lib/reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAverageScores', () => {
    it('returns zeros for empty runs array', () => {
      const result = getAverageScores([]);

      expect(result).toEqual({
        performance: 0,
        accessibility: 0,
        'best-practices': 0,
        seo: 0,
      });
    });

    it('calculates average scores from mobile data', () => {
      const runs: ReportRun[] = [
        {
          timestamp: '20240115-120000',
          date: new Date('2024-01-15'),
          reports: [
            {
              timestamp: '20240115-120000',
              url: 'https://example.com',
              scores: {
                mobile: {
                  performance: 80,
                  accessibility: 90,
                  'best-practices': 85,
                  seo: 95,
                },
              },
            },
          ],
        },
        {
          timestamp: '20240116-120000',
          date: new Date('2024-01-16'),
          reports: [
            {
              timestamp: '20240116-120000',
              url: 'https://example.com',
              scores: {
                mobile: {
                  performance: 90,
                  accessibility: 80,
                  'best-practices': 75,
                  seo: 85,
                },
              },
            },
          ],
        },
      ];

      const result = getAverageScores(runs);

      expect(result.performance).toBe(85); // (80 + 90) / 2
      expect(result.accessibility).toBe(85); // (90 + 80) / 2
      expect(result['best-practices']).toBe(80); // (85 + 75) / 2
      expect(result.seo).toBe(90); // (95 + 85) / 2
    });

    it('includes both mobile and desktop in average', () => {
      const runs: ReportRun[] = [
        {
          timestamp: '20240115-120000',
          date: new Date('2024-01-15'),
          reports: [
            {
              timestamp: '20240115-120000',
              url: 'https://example.com',
              scores: {
                mobile: {
                  performance: 70,
                  accessibility: 70,
                  'best-practices': 70,
                  seo: 70,
                },
                desktop: {
                  performance: 90,
                  accessibility: 90,
                  'best-practices': 90,
                  seo: 90,
                },
              },
            },
          ],
        },
      ];

      const result = getAverageScores(runs);

      // Average of mobile (70) and desktop (90) = 80
      expect(result.performance).toBe(80);
      expect(result.accessibility).toBe(80);
      expect(result['best-practices']).toBe(80);
      expect(result.seo).toBe(80);
    });
  });

  describe('getTrendData', () => {
    const createRun = (timestamp: string, mobilePerf: number, desktopPerf: number): ReportRun => ({
      timestamp,
      date: new Date(
        parseInt(timestamp.slice(0, 4)),
        parseInt(timestamp.slice(4, 6)) - 1,
        parseInt(timestamp.slice(6, 8))
      ),
      reports: [
        {
          timestamp,
          url: 'https://example.com',
          scores: {
            mobile: { performance: mobilePerf, accessibility: 90, 'best-practices': 85, seo: 95 },
            desktop: { performance: desktopPerf, accessibility: 92, 'best-practices': 88, seo: 98 },
          },
        },
      ],
    });

    it('returns trend data for mobile device', () => {
      const runs = [
        createRun('20240115-120000', 80, 85),
        createRun('20240114-120000', 75, 80),
      ];

      const result = getTrendData(runs, 'mobile', 10);

      // Should be reversed (oldest first for charting)
      expect(result.length).toBe(2);
      expect(result[0].performance).toBe(75);
      expect(result[1].performance).toBe(80);
    });

    it('returns trend data for desktop device', () => {
      const runs = [
        createRun('20240115-120000', 80, 85),
        createRun('20240114-120000', 75, 80),
      ];

      const result = getTrendData(runs, 'desktop', 10);

      expect(result.length).toBe(2);
      expect(result[0].performance).toBe(80);
      expect(result[1].performance).toBe(85);
    });

    it('respects limit parameter', () => {
      const runs = [
        createRun('20240115-120000', 80, 85),
        createRun('20240114-120000', 75, 80),
        createRun('20240113-120000', 70, 75),
      ];

      const result = getTrendData(runs, 'mobile', 2);

      expect(result.length).toBe(2);
    });

    it('handles runs without device data', () => {
      const runs: ReportRun[] = [
        {
          timestamp: '20240115-120000',
          date: new Date('2024-01-15'),
          reports: [
            {
              timestamp: '20240115-120000',
              url: 'https://example.com',
              scores: {
                // No mobile data
                desktop: { performance: 85, accessibility: 92, 'best-practices': 88, seo: 98 },
              },
            },
          ],
        },
      ];

      const result = getTrendData(runs, 'mobile', 10);

      expect(result.length).toBe(0);
    });
  });
});
