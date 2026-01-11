import { useEffect, useState, useMemo } from 'react';
import { ServicesApi } from '../lib/api';
import { hasRole, useAuth } from '../components/AuthContext';

export default function Services() {
  const { user } = useAuth();
  const isAdmin = hasRole(user, 'admin');

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await ServicesApi.list();
      setServices(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      category: '',
      price: '',
      duration: '',
    });
  }

  function startEdit(s) {
    setEditingId(s.id);
    setForm({
      name: s.name || '',
      description: s.description || '',
      category: s.category || '',
      price: String(s.price ?? ''),
      duration: String(s.duration_minutes ?? ''),
    });
  }

  async function submit(e) {
    e.preventDefault();
    if (!isAdmin) return;

    setError(null);

    const price = Number(form.price);
    const duration = Number(form.duration);

    if (
      !form.name ||
      !form.category ||
      Number.isNaN(price) ||
      Number.isNaN(duration) ||
      duration <= 0
    ) {
      setError('Заповніть всі обовʼязкові поля');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      category: form.category,
      price,
      duration,
    };

    try {
      setSaving(true);

      if (editingId) {
        await ServicesApi.update(editingId, payload);
      } else {
        await ServicesApi.create(payload);
      }

      resetForm();
      await load();
    } catch (e) {
      setError(e.message || 'Server error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!isAdmin) return;
    if (!confirm('Видалити послугу?')) return;

    try {
      await ServicesApi.remove(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const grouped = useMemo(() => {
    const map = {};
    for (const s of services) {
      const cat = s.category || 'Інше';
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    }
    return map;
  }, [services]);

  return (
    <div className="container">
      <h1 className="h1">Послуги</h1>
      <p className="muted">Перелік послуг, їх ціна та тривалість.</p>

      {error && (
        <div className="alert alertError" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className={`grid ${isAdmin ? 'grid2' : 'gridHalf'}`}>

        <div className="card">
          <h2 className="h2">Список</h2>

          {loading ? (
            <div className="muted">Завантаження…</div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="card" style={{ marginBottom: 12 }}>
                <h3 className="h2">{category}</h3>

                <table className="table">
                  <thead>
                    <tr>
                      <th>Назва</th>
                      <th>Опис</th>
                      <th>Ціна</th>
                      <th>Тривалість</th>
                      {isAdmin && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td className="muted">{s.description || '—'}</td>
                        <td>{s.price}</td>
                        <td>{s.duration_minutes} хв</td>
                        {isAdmin && (
                          <td>
                            <div className="row">
                              <button
                                className="btnSecondary"
                                onClick={() => startEdit(s)}
                              >
                                Ред.
                              </button>
                              <button
                                className="btnDanger"
                                onClick={() => remove(s.id)}
                              >
                                Видалити
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>

        {isAdmin && (
          <div className="card">
            <h2 className="h2">
              {editingId ? 'Редагувати послугу' : 'Додати послугу'}
            </h2>

            <form onSubmit={submit}>
              <div className="field">
                <label>Назва *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Категорія *</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Оберіть категорію</option>
                  <option value="нігті">Нігті</option>
                  <option value="вії">Вії</option>
                  <option value="брови">Брови</option>
                </select>
              </div>

              <div className="field">
                <label>Опис</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid2">
                <div className="field">
                  <label>Ціна *</label>
                  <input
                    className="input"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label>Тривалість (хв) *</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn" disabled={saving}>
                  {saving ? '…' : 'Зберегти'}
                </button>
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={resetForm}
                >
                  Очистити
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
