import { useEffect, useMemo, useState } from 'react';
import RequireAuth from '../components/RequireAuth';
import { AppointmentsApi, MastersApi, ServicesApi } from '../lib/api';

function BookInner() {
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [masterId, setMasterId] = useState('');
  const [category, setCategory] = useState('');
  const [startAt, setStartAt] = useState('');
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, m] = await Promise.all([
        ServicesApi.list(),
        MastersApi.list()
      ]);
      setServices(s || []);
      setMasters(m || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setServiceId('');
    setMasterId('');
  }, [category]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(services.map(s => s.category).filter(Boolean))
    );
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!category) return [];
    return services.filter(s => s.category === category);
  }, [services, category]);

  const filteredMasters = useMemo(() => {
    if (!serviceId) return [];
    return masters.filter(m =>
      Array.isArray(m.services) &&
      m.services.some(s =>
        String(s.service_id ?? s.id) === String(serviceId)
      )
    );
  }, [masters, serviceId]);

async function submit(e) {
  e.preventDefault();
  setError(null);
  setOk(null);

  try {
    if (!startAt) throw new Error('Оберіть дату і час');

    const localDate = new Date(startAt);

    if (Number.isNaN(localDate.getTime())) {
      throw new Error('Некоректна дата/час');
    }

    const payload = {
      master_id: masterId,
      service_id: serviceId,
      start_at: localDate.toISOString(),
    };

    await AppointmentsApi.create(payload);
    setOk('Запис створено');
  } catch (e) {
    setError(e.message);
  }
}


  return (
    <div className="container">
      <h1 className="h1">Записатися</h1>
      <p className="muted">
        Вибери послугу, майстра та час. Backend перевірить доступність і конфлікти.
      </p>

      {loading ? (
        <div className="card">Завантаження...</div>
      ) : (
        <div className="grid gridHalf">
          <div className="card">
            <h2 className="h2">Форма запису</h2>

            <form onSubmit={submit}>
              <div className="field">
                <label>Категорія</label>
                <select
                  className="input"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Оберіть категорію</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Послуга</label>
                <select
                  className="input"
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  disabled={!category}
                >
                  <option value="">Оберіть послугу</option>
                  {filteredServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} • {s.price} • {s.duration_minutes} хв
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Майстер</label>
                <select
                  className="input"
                  value={masterId}
                  onChange={e => setMasterId(e.target.value)}
                  disabled={!serviceId}
                >
                  <option value="">Оберіть майстра</option>
                  {filteredMasters.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Дата і час</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={startAt}
                  onChange={e => setStartAt(e.target.value)}
                />
                <div className="muted" style={{ fontSize: 12 }}>
                  Мінімум 30 хвилин наперед і не в минуле
                </div>
              </div>

              {error && <div className="alert alertError">{error}</div>}
              {ok && <div className="alert alertOk">{ok}</div>}

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn">Створити запис</button>
                <a className="btnSecondary" href="/profile">Мої записи</a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Book() {
  return (
    <RequireAuth roles={['user']}>
      <BookInner />
    </RequireAuth>
  );
}
