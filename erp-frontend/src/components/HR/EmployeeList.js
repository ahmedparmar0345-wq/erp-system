import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/employees');
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      'Sales': { bg: '#dbeafe', color: '#1e40af' },
      'Marketing': { bg: '#fef3c7', color: '#92400e' },
      'Engineering': { bg: '#d1fae5', color: '#065f46' },
      'HR': { bg: '#fce7f3', color: '#9d174d' },
      'Finance': { bg: '#e0e7ff', color: '#3730a3' },
      'Operations': { bg: '#fed7aa', color: '#9a3412' }
    };
    return colors[dept] || { bg: '#f3f4f6', color: '#374151' };
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return { bg: '#d1fae5', color: '#065f46', icon: '✅', label: 'Active' };
    } else if (status === 'on_leave') {
      return { bg: '#fef3c7', color: '#92400e', icon: '🏖️', label: 'On Leave' };
    } else {
      return { bg: '#fee2e2', color: '#991b1b', icon: '❌', label: 'Terminated' };
    }
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '40px', marginBottom: '16px' }}
          >
            👥
          </motion.div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}
    >
      <style>{`
        @media (max-width: 768px) {
          .emp-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .emp-filter-bar { flex-direction: column; align-items: stretch !important; }
          .emp-filter-bar > div { min-width: unset !important; }
          .emp-filter-bar select { width: 100%; }
          .emp-filter-bar button { width: 100%; justify-content: center; }
          .emp-card-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/hr')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, whiteSpace: 'nowrap' }}>← Dashboard</button>
        <div style={{ flex: 1, minWidth: 200 }}>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Employee Directory
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}
          >
            Manage your workforce, track attendance, and handle leave requests
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="emp-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div style={{ background: 'white', borderRadius: '20px', padding: '16px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: '12px', color: '#6b7280' }}>Total Employees</div><div style={{ fontSize: '28px', fontWeight: '700' }}>{employees.length}</div></div>
          <div style={{ width: '48px', height: '48px', background: '#e0e7ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👥</div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '16px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: '12px', color: '#6b7280' }}>Active</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{employees.filter(e => e.status === 'active').length}</div></div>
          <div style={{ width: '48px', height: '48px', background: '#d1fae5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>✅</div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '16px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: '12px', color: '#6b7280' }}>On Leave</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{employees.filter(e => e.status === 'on_leave').length}</div></div>
          <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏖️</div>
        </div>
        <div style={{ background: 'white', borderRadius: '20px', padding: '16px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: '12px', color: '#6b7280' }}>Departments</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>{departments.length}</div></div>
          <div style={{ width: '48px', height: '48px', background: '#f3e8ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏢</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="emp-filter-bar"
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '16px 20px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', borderRadius: '12px', padding: '8px 16px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '16px', color: '#9ca3af' }}>🔍</span>
          <input type="text" placeholder="Search by name, email, or employee code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px' }} />
        </div>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', background: '#f9fafb', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Departments</option>
          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', background: '#f9fafb', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="terminated">Terminated</option>
        </select>
        <button onClick={() => navigate('/hr/employees/new')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '16px' }}>+</span> Add Employee
        </button>
      </motion.div>

      {filteredEmployees.length === 0 ? (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
          <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No employees found</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Click "Add Employee" to create your first employee record.</div>
        </motion.div>
      ) : (
        <div className="emp-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          <AnimatePresence>
            {filteredEmployees.map((employee, index) => {
              const deptColor = getDepartmentColor(employee.department);
              const statusBadge = getStatusBadge(employee.status);
              return (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}
                >
                  <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>{employee.employee_code}</div>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>{employee.first_name} {employee.last_name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{employee.position || 'Position not set'}</div>
                    </div>
                    <div style={{ background: deptColor.bg, color: deptColor.color, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>{employee.department || 'Unassigned'}</div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '18px' }}>📧</span>
                      <span style={{ fontSize: '13px', color: '#4b5563', wordBreak: 'break-all' }}>{employee.email || 'No email'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '18px' }}>📞</span>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{employee.phone || 'No phone'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '18px' }}>📅</span>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>Hired: {formatDate(employee.hire_date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px' }}>💰</span>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>Salary: ${(employee.salary || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px' }}>{statusBadge.icon}</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: statusBadge.color }}>{statusBadge.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/hr/employees/${employee.id}`)} style={{ padding: '6px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}>View</button>
                      <button onClick={() => navigate(`/hr/employees/${employee.id}/edit`)} style={{ padding: '6px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default EmployeeList;
