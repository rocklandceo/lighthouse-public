'use client';

import { useSession } from 'next-auth/react';

export default function AuthDebug() {
  const { data: session, status } = useSession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Authentication Debug Info
          </h1>

          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Session Status
              </h2>
              <div className="bg-zinc-100 dark:bg-zinc-700 rounded p-3">
                <code className="text-sm text-zinc-900 dark:text-zinc-50">
                  {status}
                </code>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Session Data
              </h2>
              <div className="bg-zinc-100 dark:bg-zinc-700 rounded p-3 overflow-auto">
                <pre className="text-xs text-zinc-900 dark:text-zinc-50">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Environment Check
              </h2>
              <div className="bg-zinc-100 dark:bg-zinc-700 rounded p-3">
                <ul className="text-sm space-y-1">
                  <li className="text-zinc-900 dark:text-zinc-50">
                    NEXTAUTH_URL: {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set publicly'}
                  </li>
                  <li className="text-zinc-600 dark:text-zinc-400">
                    (Server-side env vars won&apos;t show here)
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="/auth/signin"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
