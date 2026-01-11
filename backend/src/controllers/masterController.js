import * as repo from '../repositories/masterRepository.js';
import { pool } from '../utils/db.js';
import bcrypt from 'bcrypt';

export const getAll = async (req, res) => {
  const masters = await repo.getAll();
  res.json(masters);
};

export const create = async (req, res) => {
  const { user_id, bio } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const user = await repo.getUserById(user_id, client);
    if (!user) {
      throw new Error('User not found');
    }

    const masterRoleId = await repo.getRoleIdByName('master', client);
    if (!masterRoleId) {
      throw new Error('Role "master" not found');
    }

    await repo.updateUserRole(user_id, masterRoleId, client);

    const master = await repo.createMasterProfile(
      user_id,
      bio ?? '',
      client
    );

    await client.query('COMMIT');
    res.status(201).json(master);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: e.message });
  } finally {
    client.release();
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { bio, is_active } = req.body;

  const master = await repo.update(id, {
    bio,
    is_active
  });

  if (!master) {
    return res.status(404).json({ message: 'Master not found' });
  }

  res.json(master);
};

export const remove = async (req, res) => {
  const success = await repo.remove(req.params.id);

  if (!success) {
    return res.status(404).json({ message: 'Master not found' });
  }

  res.json({ success: true });
};

export const restore = async (req, res) => {
  const success = await repo.restore(req.params.id);

  if (!success) {
    return res.status(404).json({ message: 'Master not found' });
  }

  res.json({ success: true });
};

export const getAllAdmin = async (req, res) => {
  const masters = await repo.getAllForAdmin();
  res.json(masters);
};

export const updateServices = async (req, res) => {
  const { id } = req.params;
  const { service_ids } = req.body;

  if (!Array.isArray(service_ids)) {
    return res.status(400).json({ message: 'service_ids must be an array' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await repo.clearMasterServices(id, client);

    for (const serviceId of service_ids) {
      await repo.addServiceToMaster(id, serviceId, client);
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: e.message });
  } finally {
    client.release();
  }
};

export const createFromAdmin = async (req, res) => {
  const { name, email, password, bio, service_ids = [] } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const exists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (exists.rows.length) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userRoleId = await repo.getRoleIdByName('user', client);

    const userRes = await client.query(
      `
      INSERT INTO users (name, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [name, email, passwordHash, userRoleId]
    );

    const userId = userRes.rows[0].id;

    const masterRoleId = await repo.getRoleIdByName('master', client);

    await client.query(
      'UPDATE users SET role_id = $1 WHERE id = $2',
      [masterRoleId, userId]
    );

    const masterRes = await client.query(
      `
      INSERT INTO masters (user_id, bio)
      VALUES ($1, $2)
      RETURNING id
      `,
      [userId, bio || null]
    );

    const masterId = masterRes.rows[0].id;

    for (const serviceId of service_ids) {
      await repo.addServiceToMaster(masterId, serviceId, client);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      user_id: userId,
      master_id: masterId
    });

  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: e.message });
  } finally {
    client.release();
  }
};
