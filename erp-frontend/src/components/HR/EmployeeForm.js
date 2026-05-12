import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(id ? true : false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    department: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    employment_type: 'Full-time',
    salary: '',
    bank_name: '',
    bank_account_no: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: ''
  });

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/hr/employees/${id}`);
      setFormData(res.data);
    } catch (err) {
      console.error('Error fetching employee:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/hr/employees/${id}`, formData);
        alert('Employee updated successfully!');
      } else {
        await api.post('/hr/employees', formData);
        alert('Employee created successfully!');
      }
      navigate('/hr/employees');
    } catch (err) {
      console.error('Error saving employee:', err);
      alert('Failed to save employee: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (pageLoading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading employee data...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .ef-actions { flex-direction: column; }
          .ef-actions button { width: 100%; text-align: center; justify-content: center; }
        }
      `}</style>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/hr')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, whiteSpace: 'nowrap' }}>← Dashboard</button>
        <div><h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{id ? 'Edit Employee' : 'Add New Employee'}</h1><p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Enter employee personal and employment details</p></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>👤</span> Personal Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>First Name *</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Last Name *</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Date of Birth</label><input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Gender</label><select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }}><option>Male</option><option>Female</option><option>Other</option></select></div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📍</span> Address</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>State</label><input type="text" name="state" value={formData.state} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Postal Code</label><input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Country</label><input type="text" name="country" value={formData.country} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>💼</span> Employment Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Department</label><input type="text" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Position</label><input type="text" name="position" value={formData.position} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Hire Date *</label><input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Employment Type</label><select name="employment_type" value={formData.employment_type} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option></select></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Salary</label><input type="number" name="salary" value={formData.salary} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🏦</span> Banking Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Bank Name</label><input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Account Number</label><input type="text" name="bank_account_no" value={formData.bank_account_no} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🚨</span> Emergency Contact</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Contact Name</label><input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Contact Phone</label><input type="text" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Relationship</label><input type="text" name="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '12px' }} /></div>
          </div>
        </div>

        <div className="ef-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={() => navigate('/hr')} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '500', opacity: loading ? 0.6 : 1 }}>{loading ? 'Saving...' : (id ? 'Update Employee' : 'Create Employee')}</button>
        </div>
      </form>
    </motion.div>
  );
};

export default EmployeeForm;
