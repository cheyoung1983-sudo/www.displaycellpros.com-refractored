'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';

export default function AuthStatus() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className='text-sm text-zinc-500'>Loading auth...</div>;

  if (user) {
    return (
      <div className='flex items-center gap-4'>
        <a href='/profile' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          {user.picture && (
            <Image
              src={user.picture}
              alt={user.name || 'User'}
              width={32}
              height={32}
              className='rounded-full border border-zinc-200'
            />
          )}
          <span className='text-sm font-medium text-zinc-700'>{user.name}</span>
        </a>
        <a
          href='/auth/logout'
          className='rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50'
        >
          Sign out
        </a>
      </div>
    );
  }

  return (
    <a
      href='/auth/login'
      className='rounded-md bg-[#008080] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#006666] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008080]'
    >
      Sign in
    </a>
  );
}
