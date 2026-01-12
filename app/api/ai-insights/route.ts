import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCachedInsights, isKVAvailable } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-insights
 *
 * Returns cached AI insights immediately. If cache is stale or missing,
 * triggers background refresh and returns whatever data is available.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if KV is available
    const kvAvailable = await isKVAvailable();

    if (!kvAvailable) {
      // KV not configured - return helpful message
      return NextResponse.json({
        error: 'Cache not configured',
        message: 'Vercel KV is not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN to your environment variables.',
        cacheStatus: 'unavailable',
      }, { status: 503 });
    }

    // Get cached insights
    const cached = await getCachedInsights();

    if (cached && !cached.isStale) {
      // Fresh cache - return immediately
      return NextResponse.json({
        ...cached.data,
        cacheStatus: 'fresh',
        cachedAt: new Date(cached.timestamp).toISOString(),
        isGenerating: cached.isGenerating,
      });
    }

    if (cached && cached.isStale) {
      // Stale cache - return stale data and suggest refresh
      return NextResponse.json({
        ...cached.data,
        cacheStatus: 'stale',
        cachedAt: new Date(cached.timestamp).toISOString(),
        isGenerating: cached.isGenerating,
        message: 'Data is stale. Click refresh to get updated insights.',
      });
    }

    // No cache - return empty state
    return NextResponse.json({
      cacheStatus: 'empty',
      isGenerating: false,
      message: 'No AI insights available. Click refresh to generate.',
      summary: null,
      overallHealthScore: null,
      insights: [],
      contentSuggestions: [],
      schemaSuggestions: [],
      copyImprovements: [],
      quickWins: [],
    });

  } catch (error: unknown) {
    console.error('AI insights error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get AI insights', details: errorMessage },
      { status: 500 }
    );
  }
}
