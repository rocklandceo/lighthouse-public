'use client';

import { signOut, useSession } from 'next-auth/react';

export function AuthButton() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {session.user.name}
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">{session.user.email}</p>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
