import Header from '@/components/Header';

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen bg-[#111111] font-sans text-slate-200'>
      <Header />

      <main className='flex flex-1 flex-col items-center justify-center py-20 px-4 sm:px-16'>
        <div className='max-w-4xl w-full flex flex-col items-center gap-12'>
          <div className='flex flex-col items-center gap-6 text-center'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008080]/10 border border-[#008080]/20 text-[#008080] text-xs font-semibold uppercase tracking-widest font-mono'>
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008080] opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-[#008080]'></span>
              </span>
              Forensic Lab Sub-Application
            </div>
            <h1 className='text-4xl font-black tracking-tight text-white sm:text-6xl uppercase font-mono'>
              Hardware <span className='text-[#008080]'>Forensics</span> Lab
            </h1>
            <p className='max-w-3xl text-xl leading-relaxed text-slate-400'>
              High-prestige silicon-layer diagnostic portal utilizing deep hardware telemetry logic
              and <span className='text-[#00BFFF] font-bold'>Forensic RAG intelligence</span> to audit
              mobile hardware failures with industrial precision.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
            <div className='p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-[#008080]/50 transition-all group'>
              <h3 className='text-lg font-black text-[#008080] mb-3 uppercase font-mono group-hover:text-[#00BFFF] transition-colors'>S2C Mapping Engine</h3>
              <p className='text-sm text-slate-400 leading-relaxed'>Programmatic Symptom-to-Circuit linkage targeting specific circuit board nodes and voltage rails.</p>
            </div>
            <div className='p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-[#008080]/50 transition-all group'>
              <h3 className='text-lg font-black text-[#008080] mb-3 uppercase font-mono group-hover:text-[#00BFFF] transition-colors'>CoV Audit Trail</h3>
              <p className='text-sm text-slate-400 leading-relaxed'>Strict Chain-of-Verification protocols ensuring every diagnostic claim is grounded in local source vaults.</p>
            </div>
            <div className='p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-[#008080]/50 transition-all group'>
              <h3 className='text-lg font-black text-[#008080] mb-3 uppercase font-mono group-hover:text-[#00BFFF] transition-colors'>NIST Compliance</h3>
              <p className='text-sm text-slate-400 leading-relaxed'>SP 800-88 R1 compliant cryptographic sanitization workflows for secure hardware disposition.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className='py-12 border-t border-zinc-800 bg-[#111111] text-center'>
        <p className='text-xs font-mono text-slate-500 uppercase tracking-widest'>
          © {new Date().getFullYear()} Display & Cell Pros LLC. Silicon Forensic Audit Facility.
        </p>
      </footer>
    </div>
  );
}

