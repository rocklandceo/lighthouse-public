'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Authentication Error
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {error === 'AccessDenied'
                ? 'Your email address is not authorized to access this dashboard.'
                : error === 'Configuration'
                ? 'There is a problem with the authentication configuration.'
                : error === 'Verification'
                ? 'The verification link is invalid or has expired.'
                : 'An error occurred during authentication.'}
            </p>
          </div>

          {/* Additional Info */}
          {error === 'AccessDenied' && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Please sign in with an authorized Google account to access the dashboard.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 font-medium rounded-lg text-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>

        {/* Support */}
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Contact your administrator for access.
        </p>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
