import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCompetitorConfig, setCompetitorConfig } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/competitors/config
 * Returns the current competitor configuration
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getCompetitorConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to get competitor config:', error);
    return NextResponse.json(
      { error: 'Failed to get competitor configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/competitors/config
 * Updates the competitor configuration
 *
 * Body: {
 *   competitors?: string[],
 *   keywords?: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate competitors
    if (body.competitors !== undefined) {
      if (!Array.isArray(body.competitors)) {
        return NextResponse.json(
          { error: 'competitors must be an array' },
          { status: 400 }
        );
      }
      if (body.competitors.length > 10) {
        return NextResponse.json(
          { error: 'Maximum 10 competitors allowed' },
          { status: 400 }
        );
      }
      // Clean up competitor domains
      body.competitors = body.competitors
        .map((c: string) => c.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''))
        .filter((c: string) => c.length > 0);
    }

    // Validate keywords
    if (body.keywords !== undefined) {
      if (!Array.isArray(body.keywords)) {
        return NextResponse.json(
          { error: 'keywords must be an array' },
          { status: 400 }
        );
      }
      if (body.keywords.length > 20) {
        return NextResponse.json(
          { error: 'Maximum 20 keywords allowed' },
          { status: 400 }
        );
      }
      // Clean up keywords
      body.keywords = body.keywords
        .map((k: string) => k.trim().toLowerCase())
        .filter((k: string) => k.length > 0);
    }

    const updated = await setCompetitorConfig({
      competitors: body.competitors,
      keywords: body.keywords,
    });

    return NextResponse.json({
      success: true,
      config: updated,
    });
  } catch (error) {
    console.error('Failed to update competitor config:', error);
    return NextResponse.json(
      { error: 'Failed to update competitor configuration' },
      { status: 500 }
    );
  }
}
