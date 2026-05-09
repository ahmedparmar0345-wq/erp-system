import jwt from 'jsonwebtoken';
import pool from '../db.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: Use decoded.id (not decoded.userId)
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token structure.' });
    }

    const result = await pool.query(
      'SELECT id, company_id, email, name, role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export default auth;