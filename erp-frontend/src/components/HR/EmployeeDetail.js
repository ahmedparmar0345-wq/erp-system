import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import EmployeeDocuments from './EmployeeDocuments';
import api from '../../services/api';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchEmployee();
    fetchDocuments();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/hr/employees/${id}`);
      setEmployee(res.data);
    } catch (err) {
      console.error('Error fetching employee:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/hr/employees/${id}/documents`);
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return `$${parseFloat(value).toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return { bg: '#d1fae5', color: '#065f46', icon: '✅', label: 'Active' };
    if (status === 'on_leave') return { bg: '#fef3c7', color: '#92400e', icon: '🏖️', label: 'On Leave' };
    return { bg: '#fee2e2', color: '#991b1b', icon: '❌', label: 'Terminated' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>👥</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading employee details...</div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Employee not found</div>
        <button onClick={() => navigate('/hr/employees')} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Back to Employees</button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(employee.status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .ed-header { flex-direction: column; align-items: stretch !important; text-align: center; }
          .ed-header-left { flex-direction: column; align-items: center !important; text-align: center; }
          .ed-header-actions { justify-content: center; }
          .ed-hero { padding: 24px 20px !important; }
          .ed-hero-name { font-size: 24px !important; }
          .ed-hero-inner { flex-direction: column; align-items: center !important; text-align: center; }
          .ed-tabs { flex-wrap: wrap; }
          .ed-tabs button { flex: 1; min-width: 100px; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <div className="ed-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="ed-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/hr')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, whiteSpace: 'nowrap' }}>← Dashboard</button>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Employee Details</h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>View complete employee information</p>
          </div>
        </div>
        <div className="ed-header-actions" style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate(`/hr/employees/${id}/edit`)} style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>✏️ Edit</button>
        </div>
      </div>

      {/* Header Card */}
      <div className="ed-hero" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '24px', padding: '32px', marginBottom: '24px', color: 'white' }}>
        <div className="ed-hero-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>{employee.employee_code}</div>
            <div className="ed-hero-name" style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', wordBreak: 'break-word' }}>{employee.first_name} {employee.last_name}</div>
            <div style={{ fontSize: '16px', opacity: 0.9, marginTop: '4px' }}>{employee.position || 'Position not set'}</div>
          </div>
          <div>
            <span style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', background: statusBadge.bg, color: statusBadge.color, display: 'inline-block' }}>
              {statusBadge.icon} {statusBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="ed-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'info' ? '2px solid #6366f1' : 'none',
            color: activeTab === 'info' ? '#6366f1' : '#6b7280',
            cursor: 'pointer',
            fontWeight: activeTab === 'info' ? '600' : '400',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          📋 Information
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'documents' ? '2px solid #6366f1' : 'none',
            color: activeTab === 'documents' ? '#6366f1' : '#6b7280',
            cursor: 'pointer',
            fontWeight: activeTab === 'documents' ? '600' : '400',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          📄 Documents ({documents.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Personal Info */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>👤</span> Personal Information</h2>
            <div><div style={{ fontSize: '12px', color: '#6b7280' }}>Full Name</div><div style={{ fontWeight: '500' }}>{employee.first_name} {employee.last_name}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Email</div><div>{employee.email || '-'}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Phone</div><div>{employee.phone || '-'}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Date of Birth</div><div>{formatDate(employee.date_of_birth)}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Gender</div><div>{employee.gender || '-'}</div></div>
          </div>

          {/* Address */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📍</span> Address</h2>
            <div>{employee.address || 'No address provided'}</div>
            <div style={{ marginTop: '8px' }}>{employee.city && `${employee.city}, `}{employee.state && `${employee.state} `}{employee.postal_code}</div>
            <div>{employee.country}</div>
          </div>

          {/* Employment Details */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>💼</span> Employment Details</h2>
            <div><div style={{ fontSize: '12px', color: '#6b7280' }}>Department</div><div>{employee.department || '-'}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Position</div><div>{employee.position || '-'}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Hire Date</div><div>{formatDate(employee.hire_date)}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Employment Type</div><div>{employee.employment_type || '-'}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Salary</div><div>{formatCurrency(employee.salary)}</div></div>
          </div>

          {/* Banking */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🏦</span> Banking Information</h2>
            <div><div style={{ fontSize: '12px', color: '#6b7280' }}>Bank Name</div><div>{employee.bank_name || '-'}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Account Number</div><div>{employee.bank_account_no || '-'}</div></div>
          </div>

          {/* Emergency Contact */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🚨</span> Emergency Contact</h2>
            <div><div style={{ fontSize: '12px', color: '#6b7280' }}>Name</div><div>{employee.emergency_contact_name || '-'}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Phone</div><div>{employee.emergency_contact_phone || '-'}</div></div>
            <div style={{ marginTop: '12px' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>Relationship</div><div>{employee.emergency_contact_relation || '-'}</div></div>
          </div>
        </div>
      ) : (
        <EmployeeDocuments employeeId={employee.id} employeeName={`${employee.first_name} ${employee.last_name}`} />
      )}
    </motion.div>
  );
};

export default EmployeeDetail;