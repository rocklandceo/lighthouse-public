import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getConfig, isAnalyticsEnabled } from '@/lib/config';

/**
 * Check if Google Analytics is available before making API calls.
 * Use this to conditionally show/hide analytics features.
 */
export { isAnalyticsEnabled };

// Get service account credentials from either JSON or separate env vars
function getServiceAccountCredentials() {
  const config = getConfig();

  // Option 1: Full JSON object in GOOGLE_SERVICE_ACCOUNT_JSON
  if (config.analytics.serviceAccountJson) {
    try {
      const json = JSON.parse(config.analytics.serviceAccountJson);
      return {
        client_email: json.client_email,
        private_key: json.private_key,
      };
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
    }
  }

  // Option 2: Separate environment variables
  return {
    client_email: config.analytics.serviceAccountEmail,
    private_key: config.analytics.serviceAccountPrivateKey?.replace(/\\n/g, '\n'),
  };
}

// Lazy initialization of the client to avoid issues at build time
let _analyticsDataClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient(): BetaAnalyticsDataClient {
  if (!_analyticsDataClient) {
    const credentials = getServiceAccountCredentials();
    _analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
  }
  return _analyticsDataClient;
}

function getPropertyId(): string {
  const config = getConfig();
  if (!config.analytics.propertyId) {
    throw new Error(
      'Google Analytics Property ID not configured. ' +
        'Set GOOGLE_ANALYTICS_PROPERTY_ID environment variable.'
    );
  }
  return config.analytics.propertyId;
}

export interface GAMetrics {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  screenPageViews: number;
  engagementRate: number;
  conversions: number;
}

export interface GATrafficSource {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

export interface GATopPage {
  pagePath: string;
  pageTitle: string;
  screenPageViews: number;
  avgEngagementTime: number;
  bounceRate: number;
}

export interface GADeviceBreakdown {
  deviceCategory: string;
  users: number;
  sessions: number;
  percentage: number;
}

export interface GoogleAnalyticsData {
  metrics: GAMetrics;
  trafficSources: GATrafficSource[];
  topPages: GATopPage[];
  deviceBreakdown: GADeviceBreakdown[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  fetchedAt: string;
}

export async function getAnalyticsOverview(days: number = 30): Promise<GoogleAnalyticsData> {
  const propertyId = getPropertyId();
  const analyticsDataClient = getAnalyticsClient();

  const startDate = `${days}daysAgo`;
  const endDate = 'today';

  // Fetch core metrics
  const [metricsResponse] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
      { name: 'engagementRate' },
      { name: 'conversions' },
    ],
  });

  const metricsRow = metricsResponse.rows?.[0]?.metricValues || [];
  const metrics: GAMetrics = {
    totalUsers: parseInt(metricsRow[0]?.value || '0'),
    newUsers: parseInt(metricsRow[1]?.value || '0'),
    sessions: parseInt(metricsRow[2]?.value || '0'),
    bounceRate: parseFloat(metricsRow[3]?.value || '0'),
    avgSessionDuration: parseFloat(metricsRow[4]?.value || '0'),
    screenPageViews: parseInt(metricsRow[5]?.value || '0'),
    engagementRate: parseFloat(metricsRow[6]?.value || '0'),
    conversions: parseInt(metricsRow[7]?.value || '0'),
  };

  // Fetch traffic sources
  const [trafficResponse] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10,
  });

  const trafficSources: GATrafficSource[] = (trafficResponse.rows || []).map(row => ({
    source: row.dimensionValues?.[0]?.value || 'unknown',
    medium: row.dimensionValues?.[1]?.value || 'unknown',
    users: parseInt(row.metricValues?.[0]?.value || '0'),
    sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
  }));

  // Fetch top pages
  const [pagesResponse] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'pagePath' },
      { name: 'pageTitle' },
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });

  const topPages: GATopPage[] = (pagesResponse.rows || []).map(row => ({
    pagePath: row.dimensionValues?.[0]?.value || '/',
    pageTitle: row.dimensionValues?.[1]?.value || 'Untitled',
    screenPageViews: parseInt(row.metricValues?.[0]?.value || '0'),
    avgEngagementTime: parseFloat(row.metricValues?.[1]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
  }));

  // Fetch device breakdown
  const [deviceResponse] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
    ],
  });

  const totalDeviceUsers = (deviceResponse.rows || []).reduce(
    (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'),
    0
  );

  const deviceBreakdown: GADeviceBreakdown[] = (deviceResponse.rows || []).map(row => {
    const users = parseInt(row.metricValues?.[0]?.value || '0');
    return {
      deviceCategory: row.dimensionValues?.[0]?.value || 'unknown',
      users,
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      percentage: totalDeviceUsers > 0 ? (users / totalDeviceUsers) * 100 : 0,
    };
  });

  return {
    metrics,
    trafficSources,
    topPages,
    deviceBreakdown,
    dateRange: {
      startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    fetchedAt: new Date().toISOString(),
  };
}

export async function getAnalyticsTrend(days: number = 30): Promise<{
  dates: string[];
  users: number[];
  sessions: number[];
  pageViews: number[];
}> {
  const propertyId = getPropertyId();
  const analyticsDataClient = getAnalyticsClient();

  const [response] = await analyticsDataClient.runReport({
    property: propertyId,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
    ],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
  });

  const dates: string[] = [];
  const users: number[] = [];
  const sessions: number[] = [];
  const pageViews: number[] = [];

  (response.rows || []).forEach(row => {
    const dateStr = row.dimensionValues?.[0]?.value || '';
    // Format YYYYMMDD to YYYY-MM-DD
    const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    dates.push(formattedDate);
    users.push(parseInt(row.metricValues?.[0]?.value || '0'));
    sessions.push(parseInt(row.metricValues?.[1]?.value || '0'));
    pageViews.push(parseInt(row.metricValues?.[2]?.value || '0'));
  });

  return { dates, users, sessions, pageViews };
}
