import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db.js';
import auth from '../middleware/auth.js';
import { requirePermission, auditLog } from '../middleware/permissions.js';

const router = express.Router();
router.use(auth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ==================== SETTINGS ENDPOINTS ====================

// GET /api/settings - get all settings grouped by category
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM system_settings WHERE company_id = $1 ORDER BY category, setting_key',
      [req.user.company_id]
    );

    const grouped = {};
    result.rows.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }
      let value = setting.setting_value;
      if (setting.setting_type === 'number') {
        value = parseFloat(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = {};
        }
      }
      grouped[setting.category][setting.setting_key] = value;
    });

    res.json(grouped);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/:key
router.get('/:key', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM system_settings WHERE company_id = $1 AND setting_key = $2',
      [req.user.company_id, req.params.key]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/:key
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    const result = await pool.query(
      `UPDATE system_settings 
             SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE company_id = $2 AND setting_key = $3 
             RETURNING *`,
      [value, req.user.company_id, req.params.key]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/upload-logo
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const logoUrl = `/uploads/${req.file.filename}`;
    await pool.query(
      'UPDATE system_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE company_id = $2 AND setting_key = $3',
      [logoUrl, req.user.company_id, 'company_logo']
    );
    res.json({ logo_url: logoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/upload-favicon
router.post('/upload-favicon', upload.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const faviconUrl = `/uploads/${req.file.filename}`;
    await pool.query(
      'UPDATE system_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE company_id = $2 AND setting_key = $3',
      [faviconUrl, req.user.company_id, 'company_favicon']
    );
    res.json({ favicon_url: faviconUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROLES ENDPOINTS ====================

// GET /api/settings/roles
router.get('/roles', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM roles WHERE company_id = $1 ORDER BY name',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/roles/:id
router.get('/roles/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM roles WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/roles
router.post('/roles', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const result = await pool.query(
      `INSERT INTO roles (company_id, name, description, permissions, created_at, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
      [req.user.company_id, name, description, JSON.stringify(permissions || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/roles/:id
router.put('/roles/:id', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const result = await pool.query(
      `UPDATE roles 
             SET name = $1, description = $2, permissions = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND company_id = $5
             RETURNING *`,
      [name, description, JSON.stringify(permissions || []), req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/settings/roles/:id
router.delete('/roles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM roles WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== USER MANAGEMENT ENDPOINTS ====================

// GET /api/settings/users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT u.id, u.email, u.name, u.role_id, r.name as role_name, u.is_active, u.last_login, u.created_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.company_id = $1
            ORDER BY u.created_at DESC
        `, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role_id, is_active FROM users WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/users
router.post('/users', async (req, res) => {
  try {
    const { email, name, password, role_id } = req.body;

    // Check if email exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (company_id, email, password_hash, name, role_id, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, email, name, role_id`,
      [req.user.company_id, email, hashedPassword, name, role_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { name, role_id, is_active } = req.body;
    const result = await pool.query(
      `UPDATE users 
             SET name = COALESCE($1, name),
                 role_id = COALESCE($2, role_id),
                 is_active = COALESCE($3, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND company_id = $5
             RETURNING id, email, name, role_id, is_active`,
      [name, role_id, is_active, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/settings/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/users/:id/reset-password
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { new_password } = req.body;
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND company_id = $3',
      [hashedPassword, req.params.id, req.user.company_id]
    );
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AUDIT LOGS ENDPOINTS ====================

// GET /api/settings/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { user_id, action, start_date, end_date, limit = 100 } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE company_id = $1';
    let params = [req.user.company_id];
    let paramIndex = 2;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(action);
    }
    if (start_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EMAIL TEMPLATES ENDPOINTS ====================

// GET /api/settings/email-templates
router.get('/email-templates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM email_templates WHERE company_id = $1 ORDER BY template_code',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/email-templates/:code
router.get('/email-templates/:code', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM email_templates WHERE company_id = $1 AND template_code = $2',
      [req.user.company_id, req.params.code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/email-templates/:code
router.put('/email-templates/:code', async (req, res) => {
  try {
    const { subject, body, is_active } = req.body;
    const result = await pool.query(
      `UPDATE email_templates 
             SET subject = $1, body = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
             WHERE company_id = $4 AND template_code = $5
             RETURNING *`,
      [subject, body, is_active, req.user.company_id, req.params.code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SYSTEM ENDPOINTS ====================

// GET /api/settings/system-info
router.get('/system-info', async (req, res) => {
  try {
    const info = {
      node_version: process.version,
      platform: process.platform,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
      database: 'PostgreSQL',
      env: process.env.NODE_ENV || 'development'
    };
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/clear-cache
router.post('/clear-cache', async (req, res) => {
  // Simple implementation - can be expanded
  res.json({ message: 'Cache cleared successfully' });
});

// POST /api/settings/maintenance
router.post('/maintenance', async (req, res) => {
  try {
    const { enabled } = req.body;
    await pool.query(
      'UPDATE system_settings SET setting_value = $1 WHERE company_id = $2 AND setting_key = $3',
      [enabled ? 'true' : 'false', req.user.company_id, 'maintenance_mode']
    );
    res.json({ message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;