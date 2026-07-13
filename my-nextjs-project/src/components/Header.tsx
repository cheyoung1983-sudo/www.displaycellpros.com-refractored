import AuthStatus from './AuthStatus';

export default function Header() {
  return (
    <header className='flex h-16 items-center justify-between border-b bg-white px-8 dark:bg-zinc-900 dark:border-zinc-800'>
      <div className='flex items-center gap-2'>
        <a href='/' className='flex items-center gap-2'>
          <div className='h-8 w-8 bg-[#008080] rounded flex items-center justify-center text-white font-bold'>
            D
          </div>
          <span className='text-lg font-bold text-[#008080] hidden sm:inline'>
            Diagnostics Hub
          </span>
        </a>
      </div>
      <AuthStatus />
    </header>
  );
}
