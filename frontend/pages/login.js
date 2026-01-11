import { useRouter } from 'next/router';
import { useState } from 'react';
import { AuthApi } from '../lib/api';
import { useAuth } from '../components/AuthContext';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await AuthApi.login({ email, password });
      signIn(data);
      router.push('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 className="h1">Вхід</h1>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="alert alertError">{error}</div>}
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" disabled={loading}>{loading ? '...' : 'Увійти'}</button>
            <a className="btnSecondary" href="/register">Немає акаунту?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
