import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

// Completion data includes timestamp for archive display
interface CompletedItem {
  id: string;
  completedAt: string;
}

// Get user-specific cache key for completed action items
function getActionItemsKey(userId: string): string {
  return `action-items:completed:${userId}`;
}

/**
 * GET /api/action-items/complete
 *
 * Returns list of completed action item IDs with timestamps for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = getActionItemsKey(session.user.id);
    const completed = await kv.get<CompletedItem[]>(key);

    // Ensure we always return a valid array (handles null, undefined, malformed data)
    const validCompleted = Array.isArray(completed) ? completed : [];

    return NextResponse.json({ completed: validCompleted });
  } catch (error: unknown) {
    console.error('Action items fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch completed action items', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/action-items/complete
 *
 * Toggle completion status of an action item for the current user
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

    const key = getActionItemsKey(session.user.id);
    const currentCompleted = await kv.get<CompletedItem[]>(key);

    // Ensure we start with a valid array (handles null, undefined, malformed data)
    const validCurrent = Array.isArray(currentCompleted) ? currentCompleted : [];

    let updatedCompleted: CompletedItem[];
    if (completed) {
      // Add to completed list if not already there
      const exists = validCurrent.some(item => item.id === id);
      if (!exists) {
        updatedCompleted = [
          ...validCurrent,
          { id, completedAt: new Date().toISOString() },
        ];
      } else {
        updatedCompleted = validCurrent;
      }
    } else {
      // Remove from completed list (restore action)
      updatedCompleted = validCurrent.filter(item => item.id !== id);
    }

    // Store with 30 day TTL
    await kv.set(key, updatedCompleted, { ex: 60 * 60 * 24 * 30 });

    return NextResponse.json({
      status: 'success',
      completed: updatedCompleted,
    });
  } catch (error: unknown) {
    console.error('Action items update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update action item status', details: errorMessage },
      { status: 500 }
    );
  }
}
