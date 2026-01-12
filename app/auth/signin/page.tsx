'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import { getBranding } from '@/lib/branding';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');
  const branding = getBranding();

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--brand-background)' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-[var(--warm-200)] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Image
              src={branding.logoPath}
              alt={branding.name}
              width={64}
              height={64}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--brand-text)' }}>
              {branding.name}
            </h1>
            <p style={{ color: 'var(--brand-text)', opacity: 0.6 }}>
              Sign in to view performance metrics
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">
                {error === 'AccessDenied'
                  ? 'Access denied. Your email address is not authorized to access this dashboard.'
                  : error === 'Configuration'
                  ? 'There is a problem with the server configuration. Please contact support.'
                  : 'An error occurred during sign in. Please try again.'}
              </p>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-[var(--warm-200)] rounded-xl hover:bg-[var(--warm-50)] hover:border-[var(--bronze-300)] transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-semibold text-[var(--navy-800)]">
              Sign in with Google
            </span>
          </button>

          {/* Info Text */}
          <p className="mt-6 text-center text-sm text-[var(--navy-800)]/50">
            Sign in with your authorized Google account
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm" style={{ color: 'var(--brand-text)', opacity: 0.4 }}>
          {branding.name}
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[var(--warm-50)]">
        <div className="text-[var(--navy-800)]/60">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
