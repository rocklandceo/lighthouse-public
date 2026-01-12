import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getHistoricalInsights } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-insights/history
 *
 * Returns historical AI insights for tracking recommendation progress over time.
 * Stores up to 10 analyses with 30-day TTL.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = await getHistoricalInsights();

    return NextResponse.json({
      status: 'success',
      count: history.length,
      data: history,
    });
  } catch (error: unknown) {
    console.error('AI insights history error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch AI insights history', details: errorMessage },
      { status: 500 }
    );
  }
}
