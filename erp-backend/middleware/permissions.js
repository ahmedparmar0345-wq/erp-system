// middleware/permissions.js
import pool from '../db.js';

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Super Admin check
      if (req.user.role === 'Super Admin') {
        return next();
      }

      // Get user's role permissions
      const result = await pool.query(
        `SELECT r.permissions 
                 FROM users u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE u.id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const permissions = result.rows[0].permissions;

      // Check if user has the required permission
      if (permissions.includes('*') || permissions.includes(permission)) {
        return next();
      }

      res.status(403).json({ error: 'Insufficient permissions' });
    } catch (err) {
      console.error('Permission error:', err);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const auditLog = (action, entityType, entityId) => {
  return async (req, res, next) => {
    const oldValues = req.body.old_values || null;
    const newValues = req.body.new_values || null;

    try {
      await pool.query(
        `INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
        [
          req.user.company_id,
          req.user.id,
          action,
          entityType,
          entityId,
          oldValues ? JSON.stringify(oldValues) : null,
          newValues ? JSON.stringify(newValues) : null,
          req.ip,
          req.headers['user-agent']
        ]
      );
    } catch (err) {
      console.error('Audit log error:', err);
    }
    next();
  };
};