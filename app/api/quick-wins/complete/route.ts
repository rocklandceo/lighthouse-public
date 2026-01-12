import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

// Get user-specific cache key for completed quick wins
function getQuickWinsKey(userId: string): string {
  return `quick-wins:completed:${userId}`;
}

/**
 * GET /api/quick-wins/complete
 *
 * Returns list of completed quick win IDs for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = getQuickWinsKey(session.user.id);
    const completed = await kv.get<string[]>(key);

    // Ensure we always return a valid array (handles null, undefined, malformed data)
    const validCompleted = Array.isArray(completed) ? completed : [];

    return NextResponse.json({ completed: validCompleted });
  } catch (error: unknown) {
    console.error('Quick wins fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch completed quick wins', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quick-wins/complete
 *
 * Toggle completion status of a quick win for the current user
 * Body: { id: string, completed: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, completed } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const key = getQuickWinsKey(session.user.id);
    const currentCompleted = await kv.get<string[]>(key);

    // Ensure we start with a valid array (handles null, undefined, malformed data)
    const validCurrent = Array.isArray(currentCompleted) ? currentCompleted : [];

    let updatedCompleted: string[];
    if (completed) {
      // Add to completed list if not already there
      if (!validCurrent.includes(id)) {
        updatedCompleted = [...validCurrent, id];
      } else {
        updatedCompleted = validCurrent;
      }
    } else {
      // Remove from completed list
      updatedCompleted = validCurrent.filter(item => item !== id);
    }

    // Store with 30 day TTL
    await kv.set(key, updatedCompleted, { ex: 60 * 60 * 24 * 30 });

    return NextResponse.json({
      status: 'success',
      completed: updatedCompleted,
    });
  } catch (error: unknown) {
    console.error('Quick wins update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update quick win status', details: errorMessage },
      { status: 500 }
    );
  }
}
