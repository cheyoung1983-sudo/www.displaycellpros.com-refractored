import { auth0 } from '@/lib/auth0';
import Header from '@/components/Header';
import { ShieldCheck, AlertTriangle, Terminal, Cpu, Database } from 'lucide-react';

export default async function Auth0DiagnosticPage() {
  const envStatus = {
    AUTH0_DOMAIN: !!process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: !!process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: !!process.env.AUTH0_CLIENT_SECRET && !process.env.AUTH0_CLIENT_SECRET.includes('REPLACE_WITH'),
    AUTH0_SECRET: !!process.env.AUTH0_SECRET,
    APP_BASE_URL: !!process.env.APP_BASE_URL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('REPLACE_WITH'),
  };

  const allPassed = Object.values(envStatus).every(Boolean);

  return (
    <div className='flex flex-col min-h-screen bg-[#111111] font-sans text-slate-200'>
      <Header />

      <main className='flex-1 py-16 px-4 sm:px-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-center gap-4 mb-10'>
            <div className='p-3 bg-[#008080]/20 border border-[#008080]/30 rounded-2xl text-[#008080]'>
              <ShieldCheck className='w-8 h-8' />
            </div>
            <div>
              <h1 className='text-3xl font-black text-white uppercase font-mono tracking-tight'>
                Auth0 & Environment <span className='text-[#008080]'>Audit</span>
              </h1>
              <p className='text-slate-400 font-mono text-sm uppercase tracking-widest'>
                System Integrity Verification Loop
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Audit Results */}
            <div className='space-y-6'>
              <h2 className='text-xs font-black text-slate-500 uppercase tracking-[0.2em] font-mono flex items-center gap-2'>
                <Terminal className='w-4 h-4' />
                Environmental Variable Sweep
              </h2>

              <div className='space-y-3'>
                {Object.entries(envStatus).map(([key, value]) => (
                  <div key={key} className='flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm'>
                    <span className='text-xs font-bold text-slate-300 font-mono'>{key}</span>
                    {value ? (
                      <span className='text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-mono'>
                        LOCKED
                      </span>
                    ) : (
                      <span className='text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase font-mono animate-pulse'>
                        MISSING
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {allPassed ? (
                <div className='p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono leading-relaxed'>
                  <strong className='block mb-1 uppercase'>✓ Audit Pass:</strong>
                  All required forensic identity parameters are present and securely mounted in the environment registry.
                </div>
              ) : (
                <div className='p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-mono leading-relaxed'>
                  <strong className='block mb-1 uppercase'>⚠ Fidelity Breach:</strong>
                  Some environment variables are missing or utilizing placeholder values. Update your .env.local file to restore system integrity.
                </div>
              )}
            </div>

            {/* Documentation / Instructions */}
            <div className='space-y-6'>
              <h2 className='text-xs font-black text-slate-500 uppercase tracking-[0.2em] font-mono flex items-center gap-2'>
                <Cpu className='w-4 h-4' />
                Integration Protocol
              </h2>

              <div className='p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-4'>
                <div className='flex gap-4 items-start'>
                  <div className='w-6 h-6 rounded bg-[#008080] flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-1'>01</div>
                  <div>
                    <h4 className='text-sm font-bold text-white uppercase font-mono mb-1'>Auth0 Dashboard</h4>
                    <p className='text-xs text-slate-400 leading-relaxed'>Ensure Callback URLs and Logout URLs are configured for your deployment environment.</p>
                  </div>
                </div>
                <div className='flex gap-4 items-start'>
                  <div className='w-6 h-6 rounded bg-[#008080] flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-1'>02</div>
                  <div>
                    <h4 className='text-sm font-bold text-white uppercase font-mono mb-1'>Secret Management</h4>
                    <p className='text-xs text-slate-400 leading-relaxed'>Utilize Vercel's encrypted environment variable vault for production secrets.</p>
                  </div>
                </div>
                <div className='flex gap-4 items-start'>
                  <div className='w-6 h-6 rounded bg-[#008080] flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-1'>03</div>
                  <div>
                    <h4 className='text-sm font-bold text-white uppercase font-mono mb-1'>Firebase IAM</h4>
                    <p className='text-xs text-slate-400 leading-relaxed'>Verify that the Service Account utilized for server-side telemetry has adequate IAM permissions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className='py-12 border-t border-zinc-800 bg-[#111111] text-center'>
        <p className='text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em] font-bold'>
          System Diagnostic Complete // CoV Integrity Locked
        </p>
      </footer>
    </div>
  );
}
