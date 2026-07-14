import AuthStatus from './AuthStatus';

export default function Header() {
  return (
    <header className='flex h-16 items-center justify-between border-b border-zinc-800 bg-[#111111] px-8 sticky top-0 z-50 backdrop-blur-md bg-opacity-80'>
      <div className='flex items-center gap-2'>
        <a href='/' className='flex items-center gap-3'>
          <div className='h-9 w-9 bg-[#008080] rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-[#008080]/20'>
            D
          </div>
          <span className='text-lg font-black text-white uppercase tracking-tighter hidden sm:inline font-mono'>
            Forensic <span className='text-[#008080]'>Lab</span>
          </span>
        </a>
      </div>
      <AuthStatus />
    </header>
  );
}
