import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLatestPageScores, getPageScores } from '@/lib/reports';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reports/pages
 * Returns per-page scores from the latest scan.
 *
 * Query params:
 * - path: Optional specific page path to get scores for (e.g., "/support")
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const pagePath = searchParams.get('path');

    if (pagePath) {
      // Get scores for a specific page (now async)
      const pageScores = await getPageScores(pagePath);

      if (!pageScores) {
        return NextResponse.json(
          { error: `Page not found: ${pagePath}` },
          { status: 404 }
        );
      }

      return NextResponse.json({ page: pageScores });
    }

    // Get all page scores (now async)
    const pages = await getLatestPageScores();

    return NextResponse.json({
      pages,
      count: pages.length,
    });
  } catch (error) {
    console.error('Error fetching page scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page scores' },
      { status: 500 }
    );
  }
}
