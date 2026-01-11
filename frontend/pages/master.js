import { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { AppointmentsApi } from '../lib/api';
import { hasRole, useAuth } from '../components/AuthContext';

function MasterAppointmentsInner() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await AppointmentsApi.master();
      setItems(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && hasRole(user, 'master')) {
      load();
    }
  }, [user]);

  if (!hasRole(user, 'master')) {
    return <p>Доступ заборонено</p>;
  }

  return (
<div className="container">
  <div className="card">
    <h1 className="h1">Мої записи</h1>

    {loading && <div className="alert">Завантаження…</div>}
    {error && <div className="alert alertError">{error}</div>}

    {!loading && items.length === 0 && (
      <div className="alert">Записів немає</div>
    )}

    {!loading && items.length > 0 && (
      <table className="table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Час</th>
            <th>Клієнт</th>
            <th>Послуга</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map(a => {
            return (
              <tr key={a.id}>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <div>
                    <div>{a.client_name}</div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {a.client_email}
                    </div>
                  </div>
                </td>

                <td>{a.service_name}</td>

                <td>
                  <span
                    className="badge"
                  >
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
            );
          })}
        </tbody>
      </table>
    )}
  </div>
</div>

  );
}

export default function MasterAppointments() {
  return (
    <RequireAuth>
      <MasterAppointmentsInner />
    </RequireAuth>
  );
}
