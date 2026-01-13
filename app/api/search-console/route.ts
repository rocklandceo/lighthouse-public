import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

interface SearchConsoleMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchConsoleData {
  date: string;
  metrics: SearchConsoleMetrics;
}

// Raw row from Google Search Console API response
interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// Error type with code property
interface GoogleAPIError extends Error {
  code?: number;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get service account credentials from config
    const config = getConfig();
    const credentials = config.analytics.serviceAccountJson;
    if (!credentials) {
      return NextResponse.json(
        { error: 'Google Search Console credentials not configured' },
        { status: 500 }
      );
    }

    // Parse credentials
    const serviceAccountKey = JSON.parse(credentials);

    // Create JWT auth client
    const auth = new google.auth.JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    // Initialize Search Console API
    const searchconsole = google.searchconsole({
      version: 'v1',
      auth,
    });

    // Get site URL from config
    const baseSiteUrl = config.app.targetBaseUrl;
    const domain = config.app.targetDomain;

    // Try different property formats (Search Console accepts different URL formats)
    const siteUrlVariants = [
      baseSiteUrl,                                    // https://example.com
      baseSiteUrl + '/',                              // https://example.com/
      `sc-domain:${domain}`,                          // sc-domain:example.com
    ];

    // Get date range from query params (default: last 7 days)
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7', 10);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Try each URL variant until one works
    let response = null;
    let successfulSiteUrl = '';
    let lastError = null;

    for (const siteUrl of siteUrlVariants) {
      try {
        response = await searchconsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            dimensions: ['date'],
            rowLimit: days,
          },
        });
        successfulSiteUrl = siteUrl;
        break; // Success, exit loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        continue; // Try next variant
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to access Search Console');
    }

    const siteUrl = successfulSiteUrl;

    // Process results
    const rows = (response.data.rows || []) as SearchConsoleRow[];
    const data: SearchConsoleData[] = rows.map((row) => ({
      date: row.keys[0],
      metrics: {
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      },
    }));

    // Calculate aggregated metrics
    const totalMetrics = data.reduce(
      (acc, item) => ({
        clicks: acc.clicks + item.metrics.clicks,
        impressions: acc.impressions + item.metrics.impressions,
        ctr: 0,
        position: 0,
      }),
      { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    );

    // Calculate average CTR and position
    if (data.length > 0) {
      totalMetrics.ctr = totalMetrics.clicks / totalMetrics.impressions;
      totalMetrics.position = data.reduce((sum, item) => sum + item.metrics.position, 0) / data.length;
    }

    return NextResponse.json({
      siteUrl,
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(endDate),
      },
      total: totalMetrics,
      daily: data,
    });

  } catch (error: unknown) {
    console.error('Search Console API error:', error);

    const apiError = error as GoogleAPIError;
    const errorMessage = apiError.message || 'Unknown error';

    // Return appropriate error response with helpful guidance
    if (apiError.code === 403) {
      const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
        ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON).client_email
        : 'unknown';

      return NextResponse.json(
        {
          error: 'Access denied to Search Console data',
          details: `Service account "${serviceAccount}" does not have access. Add this email as a user in Google Search Console: Settings → Users and permissions → Add user`,
          serviceAccount,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch Search Console data',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
