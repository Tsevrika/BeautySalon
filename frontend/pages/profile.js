import { useEffect, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { AppointmentsApi } from '../lib/api';

function ProfileInner() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await AppointmentsApi.my();
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

  return (
    <div className="container">
      <h1 className="h1">Мій профіль</h1>
      <p className="muted">Тут показані ваші записи.</p>

      {error && <div className="alert alertError" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="card">
        {loading ? (
          <div className="muted">Завантаження...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Послуга</th>
                <th>Початок</th>
                <th>Кінець</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
  {items.map((a) => (
    <tr key={a.id}>
      <td>
        <div>
          <div>{a.service_name}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {a.master_name}
            </div>
          </div>
      </td>
      <td>
        {a.start_time}
        <div className="muted" style={{ fontSize: 12 }}>
          {a.start_date}
        </div>
      </td>

      <td>
        {a.end_time}
        <div className="muted" style={{ fontSize: 12 }}>
          {a.end_date}
        </div>
      </td>

      <td>
        <span className="badge">{a.status}</span>
      </td>

      <td style={{ textAlign: 'right' }}>
        {a.status === 'created' ? (
          <button className="btnDanger" onClick={() => cancel(a.id)}>
            Cancel
          </button>
        ) : (
          <span className="muted">—</span>
        )}
      </td>
    </tr>
  ))}

  {items.length === 0 && (
    <tr>
      <td colSpan={5} className="muted">
        Немає записів
      </td>
    </tr>
  )}
</tbody>

          </table>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <RequireAuth roles={["user"]}>
      <ProfileInner />
    </RequireAuth>
  );
}
