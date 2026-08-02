import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Profile from "@/components/Profile";
import LogoutButton from "@/components/LogoutButton";

export default async function ProtectedPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <main className="min-h-screen bg-[#060812] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[300px] md:h-[450px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10">
          <h1 className="text-2xl font-semibold text-white mb-6">Protected Content</h1>
          <p className="text-slate-400 mb-8">Welcome to the members-only area, {session.user.name}!</p>

          <div className="space-y-6">
            <Profile />
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
