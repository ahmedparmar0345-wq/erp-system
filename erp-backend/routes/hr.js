import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
router.use(auth);

// ==================== EMPLOYEE DOCUMENTS - CONFIGURE MULTER ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/employee-documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'emp-' + req.params.employeeId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, DOCX are allowed.'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ==================== EMPLOYEE MANAGEMENT ====================

router.get('/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE company_id = $1 ORDER BY created_at DESC', [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/employees/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation } = req.body;

    const codeResult = await pool.query("SELECT 'EMP-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(employee_code FROM '-([0-9]+)$') AS INTEGER)), 0) + 1, 4, '0') as employee_code FROM employees");
    const employee_code = codeResult.rows[0].employee_code;

    const result = await pool.query(
      `INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 'active', $24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
      [req.user.company_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status } = req.body;
    const result = await pool.query(
      `UPDATE employees SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), email = COALESCE($3, email), phone = COALESCE($4, phone), date_of_birth = COALESCE($5, date_of_birth), gender = COALESCE($6, gender), address = COALESCE($7, address), city = COALESCE($8, city), state = COALESCE($9, state), postal_code = COALESCE($10, postal_code), country = COALESCE($11, country), department = COALESCE($12, department), position = COALESCE($13, position), hire_date = COALESCE($14, hire_date), employment_type = COALESCE($15, employment_type), salary = COALESCE($16, salary), bank_name = COALESCE($17, bank_name), bank_account_no = COALESCE($18, bank_account_no), emergency_contact_name = COALESCE($19, emergency_contact_name), emergency_contact_phone = COALESCE($20, emergency_contact_phone), emergency_contact_relation = COALESCE($21, emergency_contact_relation), status = COALESCE($22, status), updated_at = CURRENT_TIMESTAMP WHERE id = $23 AND company_id = $24 RETURNING *`,
      [first_name, last_name, email, phone, date_of_birth, gender, address, city, state, postal_code, country, department, position, hire_date, employment_type, salary, bank_name, bank_account_no, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, status, req.params.id, req.user.company_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    const result = await pool.query('UPDATE employees SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND company_id = $3 RETURNING id', ['terminated', req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee terminated successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== EMPLOYEE DOCUMENTS ====================

router.get('/employees/:employeeId/documents', async (req, res) => {
  try {
    const result = await pool.query(`SELECT ed.*, u.name as uploaded_by_name FROM employee_documents ed LEFT JOIN users u ON ed.uploaded_by = u.id WHERE ed.company_id = $1 AND ed.employee_id = $2 ORDER BY ed.uploaded_at DESC`, [req.user.company_id, req.params.employeeId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employee documents:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/employees/:employeeId/documents/upload', upload.single('document'), async (req, res) => {
  try {
    const { document_type } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!document_type) return res.status(400).json({ error: 'Document type is required' });
    const result = await pool.query(`INSERT INTO employee_documents (company_id, employee_id, document_type, document_name, file_path, file_size, file_type, uploaded_by, uploaded_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`, [req.user.company_id, req.params.employeeId, document_type, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/employees/:employeeId/documents/:documentId', async (req, res) => {
  try {
    const docResult = await pool.query(`SELECT file_path FROM employee_documents WHERE id = $1 AND employee_id = $2 AND company_id = $3`, [req.params.documentId, req.params.employeeId, req.user.company_id]);
    if (docResult.rows.length > 0 && docResult.rows[0].file_path && fs.existsSync(docResult.rows[0].file_path)) fs.unlinkSync(docResult.rows[0].file_path);
    const result = await pool.query(`DELETE FROM employee_documents WHERE id = $1 AND employee_id = $2 AND company_id = $3 RETURNING id`, [req.params.documentId, req.params.employeeId, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/employees/:employeeId/documents/:documentId/download', async (req, res) => {
  try {
    const result = await pool.query(`SELECT file_path, document_name FROM employee_documents WHERE id = $1 AND employee_id = $2 AND company_id = $3`, [req.params.documentId, req.params.employeeId, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.download(result.rows[0].file_path, result.rows[0].document_name);
  } catch (err) {
    console.error('Error downloading document:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== LEAVE BALANCES ====================

router.get('/leave-balances', async (req, res) => {
  try {
    const { employee_id, year } = req.query;
    const currentYear = year || new Date().getFullYear();
    let query = `SELECT lb.*, lt.name as leave_type_name, lt.code, lt.is_paid, e.first_name, e.last_name, e.employee_code FROM leave_balances lb JOIN leave_types lt ON lb.leave_type_id = lt.id JOIN employees e ON lb.employee_id = e.id WHERE lb.company_id = $1 AND lb.year = $2`;
    const params = [req.user.company_id, currentYear];
    if (employee_id) { query += ` AND lb.employee_id = $3`; params.push(employee_id); }
    query += ` ORDER BY e.first_name, lt.name`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leave balances:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== ATTENDANCE ====================

router.get('/attendance', async (req, res) => {
  try {
    const { date, employee_id } = req.query;
    let query = 'SELECT * FROM attendance WHERE company_id = $1';
    const params = [req.user.company_id];
    if (date) { query += ` AND date = $2`; params.push(date); }
    if (employee_id) { query += ` AND employee_id = $${params.length + 1}`; params.push(employee_id); }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance/check-in', async (req, res) => {
  try {
    const { employee_id, date, check_in } = req.body;
    const result = await pool.query(`INSERT INTO attendance (company_id, employee_id, date, check_in, status, created_at) VALUES ($1, $2, $3, $4, 'present', CURRENT_TIMESTAMP) ON CONFLICT (employee_id, date) DO UPDATE SET check_in = EXCLUDED.check_in, updated_at = CURRENT_TIMESTAMP RETURNING *`, [req.user.company_id, employee_id, date, check_in]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error checking in:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance/check-out', async (req, res) => {
  try {
    const { employee_id, date, check_out } = req.body;
    const result = await pool.query(`UPDATE attendance SET check_out = $1, updated_at = CURRENT_TIMESTAMP WHERE company_id = $2 AND employee_id = $3 AND date = $4 RETURNING *`, [check_out, req.user.company_id, employee_id, date]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Attendance record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error checking out:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== LEAVE TYPES ====================

router.get('/leave-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_types WHERE company_id = $1 AND is_active = true ORDER BY name', [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leave types:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== LEAVE REQUESTS ====================

router.get('/leave-requests', async (req, res) => {
  try {
    const result = await pool.query(`SELECT lr.*, lt.name as leave_type_name, e.first_name, e.last_name, e.employee_code FROM leave_requests lr JOIN leave_types lt ON lr.leave_type_id = lt.id JOIN employees e ON lr.employee_id = e.id WHERE lr.company_id = $1 ORDER BY lr.created_at DESC`, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/leave-requests', async (req, res) => {
  try {
    const { employee_id, leave_type_id, start_date, end_date, total_days, reason } = req.body;
    const result = await pool.query(`INSERT INTO leave_requests (company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, CURRENT_TIMESTAMP) RETURNING *`, [req.user.company_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating leave request:', err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/leave-requests/:id/approve', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const leaveRequest = await client.query(`SELECT lr.*, lt.id as leave_type_id FROM leave_requests lr JOIN leave_types lt ON lr.leave_type_id = lt.id WHERE lr.id = $1 AND lr.company_id = $2 AND lr.status = 'pending'`, [req.params.id, req.user.company_id]);
    if (leaveRequest.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Leave request not found or already processed' }); }
    const request = leaveRequest.rows[0];
    const currentYear = new Date().getFullYear();
    const balanceResult = await client.query(`SELECT id, remaining_days FROM leave_balances WHERE company_id = $1 AND employee_id = $2 AND leave_type_id = $3 AND year = $4`, [req.user.company_id, request.employee_id, request.leave_type_id, currentYear]);
    if (balanceResult.rows.length > 0) {
      if (balanceResult.rows[0].remaining_days < request.total_days) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Insufficient leave balance. Available: ${balanceResult.rows[0].remaining_days} days` }); }
      const newRemaining = balanceResult.rows[0].remaining_days - request.total_days;
      await client.query(`UPDATE leave_balances SET remaining_days = $1, used_days = total_days - remaining_days, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [newRemaining, balanceResult.rows[0].id]);
    }
    const result = await client.query(`UPDATE leave_requests SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND company_id = $3 RETURNING *`, [req.user.id, req.params.id, req.user.company_id]);
    await client.query('COMMIT');
    res.json({ ...result.rows[0], message: 'Leave approved. Balance updated.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error approving leave request:', err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.patch('/leave-requests/:id/reject', async (req, res) => {
  try {
    const result = await pool.query(`UPDATE leave_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND company_id = $2 AND status = 'pending' RETURNING *`, [req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Leave request not found or already processed' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error rejecting leave request:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== ATTENDANCE REPORTS ====================

function getWeekdaysCount(year, month) {
  const date = new Date(year, month - 1, 1);
  let weekdays = 0;
  while (date.getMonth() === month - 1) {
    if (date.getDay() !== 0 && date.getDay() !== 6) weekdays++;
    date.setDate(date.getDate() + 1);
  }
  return weekdays;
}

function countWeekends(year, month) {
  const date = new Date(year, month - 1, 1);
  let weekends = 0;
  while (date.getMonth() === month - 1) {
    if (date.getDay() === 0 || date.getDay() === 6) weekends++;
    date.setDate(date.getDate() + 1);
  }
  return weekends;
}

router.get('/attendance/report/monthly', async (req, res) => {
  try {
    const { year, month, employee_id } = req.query;
    const selectedYear = year || new Date().getFullYear();
    const selectedMonth = month || new Date().getMonth() + 1;
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

    let query = `SELECT e.id as employee_id, e.employee_code, e.first_name, e.last_name, e.department, COUNT(a.id) as total_days_present, COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days, COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days, COUNT(CASE WHEN a.status = 'half_day' THEN 1 END) as half_days, COUNT(CASE WHEN a.status = 'holiday' THEN 1 END) as holidays, COALESCE(SUM(a.overtime_hours), 0) as total_overtime FROM employees e LEFT JOIN attendance a ON e.id = a.employee_id AND a.date BETWEEN $1 AND $2 WHERE e.company_id = $3 AND e.status = 'active'`;
    const params = [startDate, endDate, req.user.company_id];
    if (employee_id) { query += ` AND e.id = $4`; params.push(employee_id); }
    query += ` GROUP BY e.id, e.employee_code, e.first_name, e.last_name, e.department ORDER BY e.department, e.first_name`;

    const result = await pool.query(query, params);
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const weekdays = getWeekdaysCount(selectedYear, selectedMonth);

    res.json({ year: selectedYear, month: selectedMonth, month_name: new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' }), total_working_days: weekdays, days_in_month: daysInMonth, employees: result.rows, summary: { total_employees: result.rows.length, total_present_days: result.rows.reduce((sum, emp) => sum + (parseInt(emp.total_days_present) || 0), 0), total_absent_days: result.rows.reduce((sum, emp) => sum + (parseInt(emp.absent_days) || 0), 0), total_late_days: result.rows.reduce((sum, emp) => sum + (parseInt(emp.late_days) || 0), 0) } });
  } catch (err) {
    console.error('Error generating monthly attendance report:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/attendance/report/employee/:employeeId', async (req, res) => {
  try {
    const { year, month } = req.query;
    const selectedYear = year || new Date().getFullYear();
    const selectedMonth = month || new Date().getMonth() + 1;
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

    const employeeResult = await pool.query(`SELECT id, employee_code, first_name, last_name, department, position FROM employees WHERE id = $1 AND company_id = $2`, [req.params.employeeId, req.user.company_id]);
    if (employeeResult.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });

    const attendanceResult = await pool.query(`SELECT date, check_in, check_out, status, overtime_hours, notes FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date`, [req.params.employeeId, startDate, endDate]);

    const attendanceMap = {};
    attendanceResult.rows.forEach(record => { attendanceMap[record.date] = record; });

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyReport = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendance = attendanceMap[dateStr];
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      dailyReport.push({ date: dateStr, day: day, day_of_week: dayOfWeek, is_weekend: isWeekend, status: attendance?.status || (isWeekend ? 'weekend' : 'absent'), check_in: attendance?.check_in ? attendance.check_in.slice(0, 5) : null, check_out: attendance?.check_out ? attendance.check_out.slice(0, 5) : null, overtime: attendance?.overtime_hours || 0, notes: attendance?.notes || null });
    }

    const present = attendanceResult.rows.filter(a => a.status === 'present').length;
    const absent = attendanceResult.rows.filter(a => a.status === 'absent').length;
    const late = attendanceResult.rows.filter(a => a.status === 'late').length;
    const halfDay = attendanceResult.rows.filter(a => a.status === 'half_day').length;
    const totalOvertime = attendanceResult.rows.reduce((sum, a) => sum + (parseFloat(a.overtime_hours) || 0), 0);

    res.json({ employee: employeeResult.rows[0], year: selectedYear, month: selectedMonth, month_name: new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' }), days_in_month: daysInMonth, statistics: { present_days: present, absent_days: absent, late_days: late, half_days: halfDay, attendance_percentage: ((present / (daysInMonth - countWeekends(selectedYear, selectedMonth))) * 100).toFixed(1), total_overtime_hours: totalOvertime }, daily_report: dailyReport });
  } catch (err) {
    console.error('Error generating employee attendance report:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== PAYROLL MANAGEMENT ====================

function getWorkingDaysCount(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    if (current.getDay() !== 0 && current.getDay() !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

router.get('/payroll/periods', async (req, res) => {
  try {
    const result = await pool.query(`SELECT pp.*, u.name as processed_by_name, u2.name as approved_by_name FROM payroll_periods pp LEFT JOIN users u ON pp.processed_by = u.id LEFT JOIN users u2 ON pp.approved_by = u2.id WHERE pp.company_id = $1 ORDER BY pp.start_date DESC`, [req.user.company_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching payroll periods:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/payroll/periods', async (req, res) => {
  try {
    const { period_name, start_date, end_date, notes } = req.body;
    const result = await pool.query(`INSERT INTO payroll_periods (company_id, period_name, start_date, end_date, status, notes, created_at) VALUES ($1, $2, $3, $4, 'draft', $5, CURRENT_TIMESTAMP) RETURNING *`, [req.user.company_id, period_name, start_date, end_date, notes]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating payroll period:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/payroll/employee-salary/:employeeId', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM employee_salaries WHERE company_id = $1 AND employee_id = $2 AND (effective_to IS NULL OR effective_to >= CURRENT_DATE) ORDER BY effective_from DESC LIMIT 1`, [req.user.company_id, req.params.employeeId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching employee salary:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/payroll/employee-salary', async (req, res) => {
  const client = await pool.connect();
  try {
    const { employee_id, basic_salary, house_rent_allowance, conveyance_allowance, medical_allowance, other_allowances, provident_fund, professional_tax, income_tax, loan_deduction, other_deductions, effective_from } = req.body;
    await client.query('BEGIN');
    const total_earnings = (basic_salary || 0) + (house_rent_allowance || 0) + (conveyance_allowance || 0) + (medical_allowance || 0) + (other_allowances || 0);
    const total_deductions = (provident_fund || 0) + (professional_tax || 0) + (income_tax || 0) + (loan_deduction || 0) + (other_deductions || 0);
    const net_salary = total_earnings - total_deductions;
    await client.query(`UPDATE employee_salaries SET effective_to = $1::DATE - INTERVAL '1 day' WHERE employee_id = $2 AND effective_to IS NULL`, [effective_from, employee_id]);
    const result = await client.query(`INSERT INTO employee_salaries (company_id, employee_id, basic_salary, house_rent_allowance, conveyance_allowance, medical_allowance, other_allowances, total_earnings, provident_fund, professional_tax, income_tax, loan_deduction, other_deductions, total_deductions, net_salary, effective_from, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`, [req.user.company_id, employee_id, basic_salary, house_rent_allowance, conveyance_allowance, medical_allowance, other_allowances, total_earnings, provident_fund, professional_tax, income_tax, loan_deduction, other_deductions, total_deductions, net_salary, effective_from]);
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving employee salary:', err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.post('/payroll/process', async (req, res) => {
  const client = await pool.connect();
  try {
    const { period_id } = req.body;
    await client.query('BEGIN');
    const period = await client.query(`SELECT * FROM payroll_periods WHERE id = $1 AND company_id = $2`, [period_id, req.user.company_id]);
    if (period.rows.length === 0) return res.status(404).json({ error: 'Payroll period not found' });
    const employees = await client.query(`SELECT e.id, e.first_name, e.last_name, e.employee_code, es.* FROM employees e JOIN employee_salaries es ON e.id = es.employee_id WHERE e.company_id = $1 AND e.status = 'active' AND es.effective_from <= $2 AND (es.effective_to IS NULL OR es.effective_to >= $2)`, [req.user.company_id, period.rows[0].start_date]);
    for (const emp of employees.rows) {
      const attendanceResult = await client.query(`SELECT COUNT(*) as present_days FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3 AND status = 'present'`, [emp.id, period.rows[0].start_date, period.rows[0].end_date]);
      const workingDays = getWorkingDaysCount(period.rows[0].start_date, period.rows[0].end_date);
      const presentDays = parseInt(attendanceResult.rows[0].present_days);
      const dailyRate = emp.net_salary / workingDays;
      const proratedNetSalary = dailyRate * presentDays;
      await client.query(`INSERT INTO payroll_transactions (company_id, payroll_period_id, employee_id, basic_salary, house_rent_allowance, conveyance_allowance, medical_allowance, other_allowances, total_earnings, provident_fund, professional_tax, income_tax, loan_deduction, other_deductions, total_deductions, net_salary, attendance_days, paid_days, leave_days, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'pending', CURRENT_TIMESTAMP)`, [req.user.company_id, period_id, emp.id, emp.basic_salary, emp.house_rent_allowance, emp.conveyance_allowance, emp.medical_allowance, emp.other_allowances, emp.total_earnings, emp.provident_fund, emp.professional_tax, emp.income_tax, emp.loan_deduction, emp.other_deductions, emp.total_deductions, proratedNetSalary, workingDays, presentDays, workingDays - presentDays]);
    }
    await client.query(`UPDATE payroll_periods SET status = 'processed', processed_by = $1, processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [req.user.id, period_id]);
    await client.query('COMMIT');
    res.json({ message: 'Payroll processed successfully', employee_count: employees.rows.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing payroll:', err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.get('/payroll/transactions', async (req, res) => {
  try {
    const { period_id, employee_id } = req.query;
    let query = `SELECT pt.*, e.first_name, e.last_name, e.employee_code, e.department FROM payroll_transactions pt JOIN employees e ON pt.employee_id = e.id WHERE pt.company_id = $1`;
    const params = [req.user.company_id];
    if (period_id) { query += ` AND pt.payroll_period_id = $2`; params.push(period_id); }
    if (employee_id) { query += ` AND pt.employee_id = $3`; params.push(employee_id); }
    query += ` ORDER BY e.department, e.first_name`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching payroll transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/payroll/transactions/:id/status', async (req, res) => {
  try {
    const { status, payment_date, payment_method, transaction_id } = req.body;
    const result = await pool.query(`UPDATE payroll_transactions SET status = $1, payment_date = $2, payment_method = $3, transaction_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND company_id = $6 RETURNING *`, [status, payment_date, payment_method, transaction_id, req.params.id, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/payroll/payslip/:transactionId', async (req, res) => {
  try {
    const result = await pool.query(`SELECT pt.*, e.first_name, e.last_name, e.employee_code, e.department, e.position, e.bank_name, e.bank_account_no, pp.period_name, pp.start_date, pp.end_date FROM payroll_transactions pt JOIN employees e ON pt.employee_id = e.id JOIN payroll_periods pp ON pt.payroll_period_id = pp.id WHERE pt.id = $1 AND pt.company_id = $2`, [req.params.transactionId, req.user.company_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payslip not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching payslip:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;