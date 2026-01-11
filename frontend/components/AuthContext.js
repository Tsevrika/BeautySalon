import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { UsersApi } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t) setToken(t);
    if (u) {
      try { setUser(JSON.parse(u)); } catch {}
    }
    setLoading(false);
  }, []);

  async function refresh() {
    try {
      const me = await UsersApi.me();
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
    } catch {
    }
  }

  function signIn({ token: t, user: u }) {
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }

  function signOut() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const value = useMemo(() => ({ token, user, loading, signIn, signOut, refresh }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function hasRole(user, ...roles) {
  return !!user && roles.includes(user.role);
}
