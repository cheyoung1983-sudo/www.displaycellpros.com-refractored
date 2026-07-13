import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';

export default async function ProfilePage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { user } = session;

  return (
    <div className='flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black'>
      <Header />

      <main className='flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black'>
        <div className='max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8'>
          <div className='flex items-center gap-6 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800'>
            {user.picture && (
              <Image
                src={user.picture}
                alt={user.name || 'User'}
                width={96}
                height={96}
                className='rounded-full border-4 border-[#008080]/20'
              />
            )}
            <div>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>{user.name}</h1>
              <p className='text-zinc-500 dark:text-zinc-400'>{user.email}</p>
              <div className='mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#008080]/10 text-[#008080] border border-[#008080]/20'>
                S2C Forensic Analyst
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <h2 className='text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2'>
              <div className='h-2 w-2 bg-[#008080] rounded-full animate-pulse'></div>
              Session Metadata Trace
            </h2>
            <div className='bg-zinc-50 dark:bg-black rounded-xl p-4 font-mono text-xs overflow-auto border border-zinc-200 dark:border-zinc-800 shadow-inner'>
              <pre className='text-zinc-600 dark:text-zinc-400'>
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </main>

      <footer className='py-10 border-t border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 text-center'>
        <p className='text-[10px] text-zinc-400 font-mono uppercase tracking-widest'>
          Audit Compliance: NIST SP 800-88 R1 Verified Session
        </p>
      </footer>
    </div>
  );
}
