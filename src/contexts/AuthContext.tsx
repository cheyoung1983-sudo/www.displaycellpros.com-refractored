import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // In a real Vercel/Auth.js setup, we would fetch /api/auth/session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        }
      } catch (err) {
        console.error('Session fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const login = async (email: string) => {
    // This would trigger a Magic Link or OAuth flow
    // For the demo/migration, we'll set the user locally if the email is valid
    if (email) {
      setUser({ email, name: email.split('@')[0] });
    }
  };

  const logout = async () => {
    setUser(null);
    await fetch('/api/auth/signout', { method: 'POST' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
