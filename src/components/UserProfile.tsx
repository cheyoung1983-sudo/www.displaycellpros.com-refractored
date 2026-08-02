"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function UserProfile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
      <h2 className="text-xl font-bold">{user.name}</h2>
      <p className="text-slate-400">{user.email}</p>
      {user.picture \u0026\u0026 (
        <img src={user.picture} alt="Profile" className="mt-2 w-16 h-16 rounded-full" referrerPolicy="no-referrer" />
      )}
    </div>
  );
}
