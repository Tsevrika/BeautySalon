import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth, hasRole } from './AuthContext';

export default function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (roles && roles.length && !hasRole(user, ...roles)) {
      router.replace('/');
    }
  }, [loading, user, roles, router]);

  if (loading) return <div className="container"><div className="card">Завантаження...</div></div>;
  if (!user) return null;
  if (roles && roles.length && !hasRole(user, ...roles)) return null;
  return children;
}
