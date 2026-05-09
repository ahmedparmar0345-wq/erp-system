import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaveTypes, createLeaveRequest, getEmployees } from '../../services/hr';

const LeaveRequestForm = () => {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [totalDays, setTotalDays] = useState(0);

  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    Promise.all([getLeaveTypes(), getEmployees({ status: 'active' })])
      .then(([ltRes, empRes]) => {
        setLeaveTypes(ltRes.data);
        setEmployees(empRes.data);
      })
      .catch(err => console.error('Failed to load data', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate < startDate) return 0;
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    setTotalDays(calculateDays(formData.start_date, formData.end_date));
  }, [formData.start_date, formData.end_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employee_id || !formData.leave_type_id) {
      setError('Please select employee and leave type');
      return;
    }

    if (totalDays <= 0) {
      setError('End date must be after start date');
      return;
    }

    setSubmitting(true);

    try {
      await createLeaveRequest({
        employee_id: parseInt(formData.employee_id),
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason
      });
      alert('Leave request submitted successfully');
      navigate('/hr/leaves');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>Request Leave</h1>
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Employee *</label>
              <select name="employee_id" value={formData.employee_id} onChange={handleChange} required>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_code} - {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Leave Type *</label>
              <select name="leave_type_id" value={formData.leave_type_id} onChange={handleChange} required>
                <option value="">Select Leave Type</option>
                {leaveTypes.filter(lt => lt.is_active).map(lt => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.code}) - {lt.default_days} days
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
            </div>
          </div>

          {totalDays > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#e7f3ff', borderRadius: '4px' }}>
              <p><strong>Total Days:</strong> {totalDays}</p>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              placeholder="Enter reason for leave..."
            />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/hr/leaves')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm;