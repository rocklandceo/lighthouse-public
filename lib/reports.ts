import {
  getLatestReport as getLatestFromKV,
  getAllReportRuns,
  type LighthouseScore,
  type DeviceScores,
  type StoredReportRun,
  type StoredPageScore,
} from './cache';

// Re-export types for backward compatibility
export type { LighthouseScore, DeviceScores };

export interface ReportData {
  timestamp: string;
  scores: DeviceScores;
  url: string;
}

export interface ReportRun {
  timestamp: string;
  date: Date;
  reports: ReportData[];
}

export interface PageScore {
  path: string;
  url: string;
  scores: DeviceScores;
}

export interface TrendDataPoint {
  date: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

/**
 * Get the latest report from KV storage
 */
export async function getLatestReport(): Promise<ReportData | null> {
  const data = await getLatestFromKV();

  if (!data || (!data.scores.mobile && !data.scores.desktop)) {
    return null;
  }

  return {
    timestamp: data.timestamp || 'latest',
    scores: data.scores,
    url: 'Multiple URLs',
  };
}

/**
 * Get all historical runs from KV storage
 */
export async function getAllRuns(): Promise<ReportRun[]> {
  const storedRuns = await getAllReportRuns();

  return storedRuns
    .map((run: StoredReportRun) => {
      // Parse timestamp format YYYYMMDD-HHMMSS
      const ts = run.timestamp;
      const date = new Date(
        parseInt(ts.slice(0, 4)),     // year
        parseInt(ts.slice(4, 6)) - 1, // month (0-indexed)
        parseInt(ts.slice(6, 8)),     // day
        parseInt(ts.slice(9, 11)),    // hours
        parseInt(ts.slice(11, 13)),   // minutes
        parseInt(ts.slice(13, 15))    // seconds
      );

      return {
        timestamp: run.timestamp,
        date,
        reports: run.reports,
      };
    })
    .filter(run => !isNaN(run.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Calculate average scores across all runs
 */
export function getAverageScores(runs: ReportRun[]): LighthouseScore {
  if (runs.length === 0) {
    return {
      performance: 0,
      accessibility: 0,
      'best-practices': 0,
      seo: 0,
    };
  }

  const totals = runs.reduce(
    (acc, run) => {
      run.reports.forEach(report => {
        if (report.scores.mobile) {
          acc.performance += report.scores.mobile.performance;
          acc.accessibility += report.scores.mobile.accessibility;
          acc['best-practices'] += report.scores.mobile['best-practices'];
          acc.seo += report.scores.mobile.seo;
          acc.count++;
        }
        if (report.scores.desktop) {
          acc.performance += report.scores.desktop.performance;
          acc.accessibility += report.scores.desktop.accessibility;
          acc['best-practices'] += report.scores.desktop['best-practices'];
          acc.seo += report.scores.desktop.seo;
          acc.count++;
        }
      });
      return acc;
    },
    { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0, count: 0 }
  );

  if (totals.count === 0) {
    return {
      performance: 0,
      accessibility: 0,
      'best-practices': 0,
      seo: 0,
    };
  }

  return {
    performance: Math.round(totals.performance / totals.count),
    accessibility: Math.round(totals.accessibility / totals.count),
    'best-practices': Math.round(totals['best-practices'] / totals.count),
    seo: Math.round(totals.seo / totals.count),
  };
}

/**
 * Get trend data for charts
 */
export function getTrendData(runs: ReportRun[], device: 'mobile' | 'desktop', limit = 10): TrendDataPoint[] {
  return runs
    .slice(0, limit)
    .reverse()
    .map(run => {
      const deviceScores = run.reports[0]?.scores[device];

      if (!deviceScores) {
        return null;
      }

      return {
        date: run.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        performance: deviceScores.performance,
        accessibility: deviceScores.accessibility,
        bestPractices: deviceScores['best-practices'],
        seo: deviceScores.seo,
      };
    })
    .filter((point): point is TrendDataPoint => point !== null);
}

/**
 * Get per-page scores from the latest report
 */
export async function getLatestPageScores(): Promise<PageScore[]> {
  const data = await getLatestFromKV();

  if (!data || !data.pageScores) {
    return [];
  }

  // Sort by path (homepage first, then alphabetical)
  return data.pageScores.sort((a: StoredPageScore, b: StoredPageScore) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    return a.path.localeCompare(b.path);
  });
}

/**
 * Get scores for a specific page
 */
export async function getPageScores(pagePath: string): Promise<PageScore | null> {
  const pages = await getLatestPageScores();
  return pages.find(p => p.path === pagePath) || null;
}
