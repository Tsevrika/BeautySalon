import { pool } from '../utils/db.js';

export const APPOINTMENT_STATUS = {
  CREATED: 'created',
  CANCELLED: 'cancelled',
  DONE: 'done'
};

export const getServiceDuration = async (serviceId) => {
  const { rows } = await pool.query(
    'SELECT duration_minutes FROM services WHERE id = $1',
    [serviceId]
  );

  return rows[0] ?? null;
};

export const isServiceProvidedByMaster = async (masterId, serviceId) => {
  const { rows } = await pool.query(
    `
    SELECT 1
    FROM master_services
    WHERE master_id = $1
      AND service_id = $2
    `,
    [masterId, serviceId]
  );

  return rows.length > 0;
};

export const markAsDone = async (id) => {
  const { rowCount, rows } = await pool.query(
    `
    UPDATE appointments
    SET status = 'done'
    WHERE id = $1
      AND status = 'created'
    RETURNING *
    `,
    [id]
  );

  return rowCount > 0 ? rows[0] : null;
};

export const getConflicts = async (masterId, start, end) => {
  const { rows } = await pool.query(
    `
    SELECT id
    FROM appointments
    WHERE master_id = $1
      AND status IN ($2, $3)
      AND start_at < $4
      AND end_at > $5
    `,
    [
      masterId,
      APPOINTMENT_STATUS.CREATED,
      APPOINTMENT_STATUS.DONE,
      end,
      start
    ]
  );

  return rows;
};

export const createAppointment = async (data) => {
  const { rows } = await pool.query(
    `
    INSERT INTO appointments
      (user_id, master_id, service_id, start_at, end_at, status)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      data.user_id,
      data.master_id,
      data.service_id,
      data.start_at,
      data.end_at,
      APPOINTMENT_STATUS.CREATED
    ]
  );

  return rows[0];
};

export const getByUser = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      a.id,
      a.status,

      to_char(
        a.start_at AT TIME ZONE 'Europe/Amsterdam',
        'YYYY-MM-DD'
      ) AS start_date,

      to_char(
        a.start_at AT TIME ZONE 'Europe/Amsterdam',
        'HH24:MI'
      ) AS start_time,

      to_char(
        a.end_at AT TIME ZONE 'Europe/Amsterdam',
        'YYYY-MM-DD'
      ) AS end_date,

      to_char(
        a.end_at AT TIME ZONE 'Europe/Amsterdam',
        'HH24:MI'
      ) AS end_time,

      s.name AS service_name,
      mu.name AS master_name
      
    FROM appointments a
    JOIN services s ON s.id = a.service_id
    JOIN masters m ON m.id = a.master_id
    JOIN users mu  ON mu.id = m.user_id
    WHERE a.user_id = $1
    ORDER BY a.start_at
    `,
    [userId]
  );

  return rows;
};

export const getByMaster = async (masterId) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM appointments
    WHERE master_id = $1
    ORDER BY start_at
    `,
    [masterId]
  );

  return rows;
};

export const getByMasterUser = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      a.*,

      to_char(a.start_at AT TIME ZONE 'Europe/Amsterdam','YYYY-MM-DD') AS date,

      to_char(a.start_at AT TIME ZONE 'Europe/Amsterdam', 'HH24:MI')  AS time,

      u.name AS client_name,
      u.email AS client_email,
      s.name AS service_name

    FROM appointments a
    JOIN masters m ON m.id = a.master_id
    JOIN users u ON u.id = a.user_id
    JOIN services s ON s.id = a.service_id

    WHERE m.user_id = $1
    ORDER BY a.start_at
    `,
    [userId]
  );

  return rows;
};


export const getAll = async () => {
  const { rows } = await pool.query(
    `
    SELECT
      a.id,
      
      to_char(a.start_at AT TIME ZONE 'Europe/Amsterdam','YYYY-MM-DD') AS date,

      to_char(a.start_at AT TIME ZONE 'Europe/Amsterdam', 'HH24:MI')  AS time,

      u.name                          AS client_name,
      u.email                         AS client_email,

      mu.name                         AS master_name,

      s.name                          AS service_name,
      a.status
    FROM appointments a
    JOIN users u   ON u.id = a.user_id
    JOIN masters m ON m.id = a.master_id
    JOIN users mu  ON mu.id = m.user_id
    JOIN services s ON s.id = a.service_id
    ORDER BY a.start_at DESC;
    `
  );

  return rows;
};

export const cancel = async (id) => {
  await pool.query(
    `
    UPDATE appointments
    SET status = $1
    WHERE id = $2
    `,
    [APPOINTMENT_STATUS.CANCELLED, id]
  );
};
