import pool from '../db.js';

export const validatePosSession = async (req, res, next) => {
  try {
    // Check for open session for this user or generally for the company
    const result = await pool.query(
      'SELECT id FROM pos_sessions WHERE company_id = $1 AND status = $2 ORDER BY opening_time DESC LIMIT 1',
      [req.user.company_id, 'open']
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'No active POS session. Please open a session first.' });
    }

    req.posSession = result.rows[0];
    next();
  } catch (err) {
    res.status(500).json({ error: 'Session validation failed' });
  }
};
