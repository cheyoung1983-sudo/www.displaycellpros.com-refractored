'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';

export default function AuthStatus() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div className='text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse'>Initializing Auth...</div>;

  if (user) {
    return (
      <div className='flex items-center gap-4'>
        <a href='/profile' className='flex items-center gap-2 hover:opacity-80 transition-all group'>
          {user.picture && (
            <Image
              src={user.picture}
              alt={user.name || 'User'}
              width={32}
              height={32}
              className='rounded-full border border-[#00BFFF]/30 group-hover:border-[#00BFFF] transition-all shadow-sm'
            />
          )}
          <span className='text-xs font-bold text-slate-300 uppercase tracking-wide font-mono'>{user.name}</span>
        </a>
        <a
          href='/auth/logout'
          className='rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-black text-white uppercase tracking-widest hover:bg-zinc-700 transition-colors font-mono'
        >
          Sign out
        </a>
      </div>
    );
  }

  return (
    <a
      href='/auth/login'
      className='rounded-lg bg-[#008080] px-4 py-2 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-[#008080]/20 hover:bg-[#006666] transition-all hover:scale-105 font-mono'
    >
      Initiate Triage
    </a>
  );
}
