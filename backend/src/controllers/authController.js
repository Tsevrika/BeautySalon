import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../utils/db.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const result = await pool.query(
      'SELECT u.id, u.name, u.email, u.password_hash, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const roleRes = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      ['user']
    );

    const roleId = roleRes.rows[0].id;

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email`,
      [name, email, passwordHash, roleId]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
