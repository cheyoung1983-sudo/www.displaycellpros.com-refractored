import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { signInWithGoogle, signOutUser } from '../services/auth';
import { LogIn, LogOut } from 'lucide-react';

export const AuthStatus: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <div className="flex items-center space-x-2">
      {user ? (
        <button
          onClick={signOutUser}
          className="flex items-center px-3 py-2 text-xs font-bold text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg hover:bg-red-900/40 uppercase tracking-wider"
        >
          <LogOut className="w-3 h-3 mr-2" />
          Sign Out
        </button>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="flex items-center px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 uppercase tracking-wider"
        >
          <LogIn className="w-3 h-3 mr-2" />
          Sign In
        </button>
      )}
    </div>
  );
};
