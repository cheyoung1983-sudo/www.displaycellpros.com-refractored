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
    <div className='flex flex-col min-h-screen bg-[#111111] font-sans text-slate-200'>
      <Header />

      <main className='flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-[#111111]'>
        <div className='max-w-4xl mx-auto bg-zinc-900/50 backdrop-blur-md rounded-3xl shadow-2xl border border-zinc-800 p-8 sm:p-12 relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-[#008080]/5 rounded-bl-full pointer-events-none'></div>

          <div className='flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-zinc-800/80'>
            {user.picture && (
              <Image
                src={user.picture}
                alt={user.name || 'User'}
                width={120}
                height={120}
                className='rounded-full border-4 border-[#008080]/30 shadow-lg shadow-[#008080]/10'
              />
            )}
            <div className='text-center sm:text-left space-y-2'>
              <h1 className='text-3xl font-black text-white uppercase tracking-tight font-mono'>{user.name}</h1>
              <p className='text-slate-400 font-mono text-sm'>{user.email}</p>
              <div className='inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-[#008080]/10 text-[#008080] border border-[#008080]/20 uppercase tracking-widest font-mono'>
                Silicon-Layer Forensic Analyst
              </div>
            </div>
          </div>

          <div className='space-y-8'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xs font-black text-slate-400 uppercase tracking-[0.2em] font-mono flex items-center gap-3'>
                <span className='h-2 w-2 bg-[#00BFFF] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,191,255,0.6)]'></span>
                Telemetry Trace Data
              </h2>
              <span className='text-[9px] font-mono text-slate-500 uppercase tracking-widest'>NIST SP 800-88 R1 compliant</span>
            </div>

            <div className='bg-black/60 rounded-2xl p-6 font-mono text-[11px] overflow-auto border border-zinc-800/50 shadow-inner relative group'>
              <div className='absolute top-3 right-4 text-[9px] text-zinc-700 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity'>Raw_Payload_L3</div>
              <pre className='text-slate-300 leading-relaxed'>
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </main>

      <footer className='py-12 border-t border-zinc-800 bg-[#111111] text-center'>
        <p className='text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em] font-bold'>
          Audit Compliance: NIST SP 800-88 R1 Verified Session Archive
        </p>
      </footer>
    </div>
  );
}

