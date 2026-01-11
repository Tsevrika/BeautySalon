import { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { AppointmentsApi } from '../lib/api';

function AppointmentsAdminInner() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

function formatNL(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}


  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await AppointmentsApi.admin();
      setItems(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!confirm('Скасувати запис?')) return;
    try {
      await AppointmentsApi.cancel(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  
  async function markDone(id) {
    if (!confirm('Позначити запис як виконаний?')) return;

    try {
      await AppointmentsApi.done(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  function fmt(d) {
    try { return new Date(d).toLocaleString(); } catch { return d; }
  }

  return (
    <div className="container">
      <h1 className="h1">Усі записи</h1>
      <p className="muted">Список записів для адміністратора.</p>

      {error && <div className="alert alertError" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="card">
        {loading ? (
          <div className="muted">Завантаження...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Час</th>
                <th>Клієнт</th>
                <th>Майстер</th>
                <th>Послуга</th>
                <th>Статус</th>
                <th></th> {}
                
                <th />
              </tr>
            </thead>
           <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  {a.client_name}
                  <div className="muted" style={{ fontSize: 12 }}>
                    {a.client_email}
                  </div>
                </td>
                <td>{a.master_name}</td>
                <td>{a.service_name}</td>
                <td>
                  <span className="badge">
                    {a.status}
                  </span>
                </td>
                <td>
                  {a.status === 'created' ? (
                    <button className="btn" onClick={() => markDone(a.id)}>
                      Done
                    </button>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>

                <td style={{ textAlign: 'right' }}>
                    {a.status === 'created' ? (
                      <button className="btnDanger" onClick={() => cancel(a.id)}>Cancel</button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
              </tr>
            ))}
          </tbody>

          </table>
        )}
      </div>
    </div>
  );
}

export default function AppointmentsAdmin() {
  return (
    <RequireAuth roles={['admin']}>
      <AppointmentsAdminInner />
    </RequireAuth>
  );
}
