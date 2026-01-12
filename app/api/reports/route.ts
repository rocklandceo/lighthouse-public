import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLatestReport, getAllRuns, getTrendData } from '@/lib/reports';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Now async - fetch from KV storage
    const [latestReport, allRuns] = await Promise.all([
      getLatestReport(),
      getAllRuns(),
    ]);

    // Get trend data for both devices
    const mobileTrend = getTrendData(allRuns, 'mobile', 14);
    const desktopTrend = getTrendData(allRuns, 'desktop', 14);

    return NextResponse.json({
      latest: latestReport,
      runs: allRuns.slice(0, 14), // Last 14 runs
      trends: {
        mobile: mobileTrend,
        desktop: desktopTrend,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
