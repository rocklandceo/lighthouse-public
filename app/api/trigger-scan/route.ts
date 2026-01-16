import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConfig, isGitHubTriggerEnabled } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger GitHub Actions workflow via repository dispatch
    if (!isGitHubTriggerEnabled()) {
      return NextResponse.json(
        { error: 'GitHub trigger not configured. Set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME in Vercel environment variables.' },
        { status: 500 }
      );
    }

    const config = getConfig();
    const { token, repoOwner, repoName } = config.github;

    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'manual-scan',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Scan triggered successfully. Results will be available in 5-10 minutes.',
    });

  } catch (error: unknown) {
    console.error('Trigger scan error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to trigger scan', details: errorMessage },
      { status: 500 }
    );
  }
}
