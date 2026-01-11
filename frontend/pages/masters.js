import { useEffect, useMemo, useState } from 'react';
import { MastersApi, ServicesApi, createMasterFromAdmin } from '../lib/api';
import { hasRole, useAuth } from '../components/AuthContext';

export default function Masters() {
  const { user } = useAuth();
  const isAdmin = hasRole(user, 'admin');

  const [masters, setMasters] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
  });

  const [selectedServices, setSelectedServices] = useState([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [m, s] = await Promise.all([
        MastersApi.list(),
        ServicesApi.list(),
      ]);
      setMasters(m || []);
      setServices(s || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setEditingId(null);
    setSelectedServices([]);
    setForm({ name: '', email: '', password: '', bio: '' });
  }

  function startEdit(m) {
    setEditingId(m.id);
    setSelectedServices([]);
    setForm({
      name: m.name || '',
      email: m.email || '',
      password: '',
      bio: m.bio || '',
    });
  }

  async function remove(id) {
    if (!isAdmin) return;
    if (!confirm('Деактивувати майстра?')) return;

    try {
      await MastersApi.remove(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!isAdmin) return;

    if (selectedServices.length === 0) {
      setError('Потрібно вибрати хоча б одну послугу');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await MastersApi.update(editingId, { bio: form.bio, is_active: true });
        await MastersApi.updateServices(editingId, selectedServices);
      } else {
        await createMasterFromAdmin({
          name: form.name,
          email: form.email,
          password: form.password,
          bio: form.bio,
          service_ids: selectedServices,
        });
      }

      reset();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const servicesByCategory = useMemo(() => {
    const map = {};
    for (const s of services) {
      const cat = s.category || 'Інше';
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    }
    return map;
  }, [services]);

const mastersByCategory = useMemo(() => {
  const map = {};

  for (const m of masters) {
    const servicesByCat = {};

    for (const s of m.services || []) {
      const cat = s.category || 'Інше';
      if (!servicesByCat[cat]) servicesByCat[cat] = [];
      servicesByCat[cat].push(s);
    }

    for (const [cat, services] of Object.entries(servicesByCat)) {
      if (!map[cat]) map[cat] = [];

      const exists = map[cat].some(x => x.id === m.id);
      if (!exists) {
        map[cat].push({
          ...m,
          services,
        });
      }
    }
  }

  return map;
}, [masters]);


  return (
    <div className="container">
      <h1 className="h1">Майстри</h1>
      <p className="muted">Список майстрів що працюють.</p>

      {error && (
        <div className="alert alertError" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className={`grid ${isAdmin ? 'grid2' : 'gridHalf'}`}>
        {}
        <div className="card">
          <h2 className="h2">Список</h2>

          {loading ? (
            <div className="muted">Завантаження...</div>
          ) : (
            Object.entries(mastersByCategory).map(([category, list]) => (
              <div key={category} style={{ marginBottom: 24 }}>
                <div className="badge" style={{ marginBottom: 8 }}>
                  {category}
                </div>

                <table className="table">
                  <thead>
                    <tr>
                      <th>Майстер</th>
                      <th>Bio</th>
                      <th>Послуги</th>
                      {isAdmin && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(m => (
                      <tr key={m.id}>
                        <td>
                          <div>{m.name}</div>
                          {isAdmin && m.email && (
                            <div className="muted" style={{ fontSize: 12 }}>
                              {m.email}
                            </div>
                          )}
                        </td>

                        <td className="muted">{m.bio || '-'}</td>

                        <td>
                          <div className="row">
                            {(m.services || []).map(s => (
                              <span key={s.id} className="badge">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </td>

                        {isAdmin && (
                          <td>
                            <div className="row">
                              <button
                                className="btnSecondary"
                                onClick={() => startEdit(m)}
                              >
                                Ред.
                              </button>
                              <button
                                className="btnDanger"
                                onClick={() => remove(m.id)}
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

        {}
        {isAdmin && (
          <div className="card">
            <h2 className="h2">
              {editingId ? 'Редагувати майстра' : 'Додати майстра'}
            </h2>

            <form onSubmit={submit}>
              {!editingId && (
                <>
                  <div className="field">
                    <label>Імʼя *</label>
                    <input
                      className="input"
                      value={form.name}
                      onChange={e =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Email *</label>
                    <input
                      className="input"
                      type="email"
                      value={form.email}
                      onChange={e =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Пароль *</label>
                    <input
                      className="input"
                      type="password"
                      value={form.password}
                      onChange={e =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}

              <div className="field">
                <label>Bio</label>
                <textarea
                  className="input"
                  rows={4}
                  value={form.bio}
                  onChange={e =>
                    setForm({ ...form, bio: e.target.value })
                  }
                />
              </div>

              <h3 className="h2" style={{ marginTop: 16 }}>
                Послуги майстра *
              </h3>

              {Object.entries(servicesByCategory).map(([cat, list]) => (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div className="badge" style={{ marginBottom: 6 }}>
                    {cat}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {list.map(s => {
                      const checked = selectedServices.includes(s.id);
                      return (
                        <label key={s.id} style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedServices(prev => [...prev, s.id]);
                              } else {
                                setSelectedServices(prev =>
                                  prev.filter(id => id !== s.id)
                                );
                              }
                            }}
                          />
                          <span>
                            {s.name}
                            <span className="muted">
                              {' '}• {s.duration_minutes} хв • {s.price}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="row" style={{ marginTop: 16 }}>
                <button
                  className="btn"
                  disabled={saving || selectedServices.length === 0}
                >
                  {saving ? '...' : 'Зберегти'}
                </button>
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={reset}
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
