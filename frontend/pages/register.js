import { useRouter } from 'next/router';
import { useState } from 'react';
import { AuthApi } from '../lib/api';
import { useAuth } from '../components/AuthContext';

export default function Register() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await AuthApi.register({ name, email, password });
      signIn({ token: data.token, user: { ...data.user, role: 'user' } });
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
        <h1 className="h1">Реєстрація</h1>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Ім'я</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
            <button className="btn" disabled={loading}>{loading ? '...' : 'Створити акаунт'}</button>
            <a className="btnSecondary" href="/login">Вже є акаунт</a>
          </div>
        </form>
      </div>
    </div>
  );
}
