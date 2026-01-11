const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const t = token ?? getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && data.message) ? data.message : `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const AuthApi = {
  login: (payload) => api('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => api('/auth/register', { method: 'POST', body: payload }),
};

export const ServicesApi = {
  list: () => api('/services'),
  create: (payload) => api('/services', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/services/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/services/${id}`, { method: 'DELETE' }),
};

export const MastersApi = {
  list: () => api('/masters'),
  create: (payload) => api('/masters', { method: 'POST', body: payload }),
  createFull: (payload) =>
  api('/masters/full', { method: 'POST', body: payload }),

  update: (id, payload) => api(`/masters/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`/masters/${id}`, { method: 'DELETE' }),
  restore: (id) => api(`/masters/${id}/restore`, { method: 'PATCH' }),
  updateServices: (id, service_ids) => api(`/masters/${id}/services`, { method: 'PUT', body: { service_ids } }),
};

export const AppointmentsApi = {
  create: (payload) => api('/appointments', { method: 'POST', body: payload }),
  my: () => api('/appointments/my'),
  admin: () => api('/appointments/admin'),
  master: () => api('/appointments/master'),
  cancel: (id) => api(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  done: (id) => api(`/appointments/${id}/done`, { method: 'PATCH' }),
};

export const UsersApi = {
  me: () => api('/users/me'),
};

export async function createMasterFromAdmin(data) {
  return api('/masters/create-from-admin', {
    method: 'POST',
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      bio: data.bio,
      service_ids: data.service_ids || []
    }
  });
}
