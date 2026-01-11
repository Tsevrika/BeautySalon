import { pool } from '../utils/db.js';

export const createService = async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;

    if (!name || !price || !duration || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO services (name, description, price, duration_minutes, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, price, duration, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getServices = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM services WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, category } = req.body;

    const result = await pool.query(
      `UPDATE services
       SET name = $1,
           description = $2,
           price = $3,
           duration_minutes = $4,
           category = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, price, duration, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
