import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAnalyticsOverview, getAnalyticsTrend } from '@/lib/google-analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const includesTrend = searchParams.get('trend') === 'true';

    const overview = await getAnalyticsOverview(days);

    let trend = null;
    if (includesTrend) {
      trend = await getAnalyticsTrend(days);
    }

    return NextResponse.json({
      overview,
      trend,
      success: true,
    });

  } catch (error: unknown) {
    console.error('Google Analytics API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for common configuration errors
    if (errorMessage.includes('Property ID')) {
      return NextResponse.json(
        { error: 'Google Analytics not configured. Add GOOGLE_ANALYTICS_PROPERTY_ID to environment.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: errorMessage },
      { status: 500 }
    );
  }
}
