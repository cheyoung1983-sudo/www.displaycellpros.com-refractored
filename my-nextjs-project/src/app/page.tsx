import Header from '@/components/Header';

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black'>
      <Header />

      <main className='flex flex-1 flex-col items-center justify-center py-20 px-4 sm:px-16 bg-white dark:bg-black'>
        <div className='max-w-3xl w-full flex flex-col items-center gap-12'>
          <div className='flex flex-col items-center gap-6 text-center'>
            <h1 className='text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl'>
              Display & Cell Pros Diagnostics Hub
            </h1>
            <p className='max-w-2xl text-xl leading-8 text-zinc-600 dark:text-zinc-400'>
              This application provides specialized hardware diagnostic tools for mobile device triage,
              battery health analysis, and screen performance verification for Display & Cell Pros customers.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
            <div className='p-6 rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800'>
              <h3 className='text-lg font-semibold text-[#008080] mb-2'>Triage Tool</h3>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>Rapid assessment of device condition and functionality.</p>
            </div>
            <div className='p-6 rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800'>
              <h3 className='text-lg font-semibold text-[#008080] mb-2'>Battery Health</h3>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>Deep analysis of battery cycles, capacity, and performance.</p>
            </div>
            <div className='p-6 rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800'>
              <h3 className='text-lg font-semibold text-[#008080] mb-2'>Screen Check</h3>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>Verification of display performance and touch responsiveness.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className='py-10 border-t border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 text-center'>
        <p className='text-sm text-zinc-500'>
          © {new Date().getFullYear()} Display & Cell Pros. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
