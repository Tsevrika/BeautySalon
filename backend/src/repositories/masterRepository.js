import { pool } from '../utils/db.js';

export const getRoleIdByName = async (name, client = pool) => {
  const { rows } = await client.query(
    'SELECT id FROM roles WHERE name = $1',
    [name]
  );
  return rows[0]?.id;
};

export const getUserById = async (userId, client = pool) => {
  const { rows } = await client.query(
    'SELECT id, role_id FROM users WHERE id = $1',
    [userId]
  );
  return rows[0];
};

export const updateUserRole = async (userId, roleId, client) => {
  await client.query(
    'UPDATE users SET role_id = $1 WHERE id = $2',
    [roleId, userId]
  );
};

export const createMasterProfile = async (userId, bio, client) => {
  const { rows } = await client.query(
    `
    INSERT INTO masters (user_id, bio, is_active)
    VALUES ($1, $2, true)
    RETURNING *
    `,
    [userId, bio]
  );
  return rows[0];
};

export const getAll = async () => {
  const { rows } = await pool.query(`
    SELECT
      m.id,
      u.name,
      m.bio,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'category', s.category
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS services
    FROM masters m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN master_services ms ON ms.master_id = m.id
    LEFT JOIN services s ON s.id = ms.service_id
    WHERE m.is_active = true
    GROUP BY m.id, u.name, m.bio
    ORDER BY u.name;

  `);

  return rows;
};

export const create = async ({ user_id, bio, is_active }) => {
  const { rows } = await pool.query(
    `
    INSERT INTO masters (user_id, bio, is_active)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [user_id, bio, is_active]
  );

  return rows[0];
};

export const update = async (id, { bio, is_active }) => {
  const { rows } = await pool.query(
    `
    UPDATE masters
    SET bio = $1,
        is_active = $2
    WHERE id = $3
    RETURNING *
    `,
    [bio, is_active, id]
  );

  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query(
    `
    UPDATE masters
    SET is_active = false
    WHERE id = $1
    `,
    [id]
  );

  return rowCount > 0;
};

export const restore = async (id) => {
  const { rowCount } = await pool.query(
    `
    UPDATE masters
    SET is_active = true
    WHERE id = $1
    `,
    [id]
  );

  return rowCount > 0;
};

export const clearMasterServices = async (masterId, client) => {
  await client.query(
    'DELETE FROM master_services WHERE master_id = $1',
    [masterId]
  );
};

export const addServiceToMaster = async (masterId, serviceId, client) => {
  await client.query(
    `
    INSERT INTO master_services (master_id, service_id)
    VALUES ($1, $2)
    `,
    [masterId, serviceId]
  );
};
