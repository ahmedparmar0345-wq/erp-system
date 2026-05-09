import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AttendanceTracker = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [employeesRes, attendanceRes] = await Promise.all([
        fetch('http://localhost:3000/api/hr/employees', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`http://localhost:3000/api/hr/attendance?date=${selectedDate}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const employeesData = await employeesRes.json();
      const attendanceData = await attendanceRes.json();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (employeeId) => {
    const token = localStorage.getItem('token');
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    try {
      const response = await fetch('http://localhost:3000/api/hr/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ employee_id: employeeId, date: selectedDate, check_in: time })
      });
      if (response.ok) {
        alert('Check-in recorded successfully!');
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to check in: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to check in');
    }
  };

  const handleCheckOut = async (employeeId) => {
    const token = localStorage.getItem('token');
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    try {
      const response = await fetch('http://localhost:3000/api/hr/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ employee_id: employeeId, date: selectedDate, check_out: time })
      });
      if (response.ok) {
        alert('Check-out recorded successfully!');
        fetchData();
      } else {
        const error = await response.json();
        alert('Failed to check out: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to check out');
    }
  };

  const getAttendanceStatus = (employeeId) => {
    const record = attendance.find(a => a.employee_id === employeeId);
    if (record) {
      return { status: 'present', check_in: record.check_in, check_out: record.check_out };
    }
    return { status: 'absent', check_in: null, check_out: null };
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '40px', marginBottom: '16px' }}
          >
            📊
          </motion.div>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading attendance...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}
    >
      <style>{`
        @media (max-width: 768px) {
          .att-header { flex-direction: column; align-items: stretch !important; }
          .att-header h1 { text-align: center; }
          .att-date-bar { flex-direction: column; align-items: stretch !important; text-align: center; }
          .att-date-bar input { width: 100%; }
          .att-legend { flex-direction: column; align-items: center; gap: 8px !important; }
        }
      `}</style>

      <div className="att-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/hr')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, whiteSpace: 'nowrap' }}>← Dashboard</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Attendance Tracker
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Record and manage employee daily attendance</p>
        </div>
      </div>

      <div className="att-date-bar" style={{
        background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <span style={{ fontWeight: '500' }}>Selected Date:</span>
          <span style={{ marginLeft: '8px', color: '#6366f1', fontWeight: '600' }}>
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none', cursor: 'pointer' }} />
      </div>

      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Employee</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Department</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Check In</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Check Out</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const attStatus = getAttendanceStatus(emp.id);
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td data-label="Employee" style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600' }}>{emp.first_name} {emp.last_name}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>{emp.employee_code}</div>
                    </td>
                    <td data-label="Department" style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', background: '#f3f4f6', color: '#374151' }}>
                        {emp.department || 'Unassigned'}
                      </span>
                    </td>
                    <td data-label="Status" style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: attStatus.status === 'present' ? '#d1fae5' : '#fee2e2', color: attStatus.status === 'present' ? '#065f46' : '#991b1b' }}>
                        {attStatus.status === 'present' ? '✅ Present' : '❌ Absent'}
                      </span>
                    </td>
                    <td data-label="Check In" style={{ padding: '16px', textAlign: 'center', fontWeight: '500' }}>
                      {attStatus.check_in ? formatTime(attStatus.check_in) : '-'}
                    </td>
                    <td data-label="Check Out" style={{ padding: '16px', textAlign: 'center', fontWeight: '500' }}>
                      {attStatus.check_out ? formatTime(attStatus.check_out) : '-'}
                    </td>
                    <td data-label="Actions" style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {!attStatus.check_in && (
                          <button onClick={() => handleCheckIn(emp.id)} style={{ padding: '6px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '11px', cursor: 'pointer' }}>
                            Check In
                          </button>
                        )}
                        {attStatus.check_in && !attStatus.check_out && (
                          <button onClick={() => handleCheckOut(emp.id)} style={{ padding: '6px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '11px', cursor: 'pointer' }}>
                            Check Out
                          </button>
                        )}
                        {attStatus.check_in && attStatus.check_out && (
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="att-legend" style={{ marginTop: '20px', padding: '12px 20px', background: '#f9fafb', borderRadius: '12px', display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '11px', color: '#6b7280', flexWrap: 'wrap' }}>
        <span>✅ Present</span>
        <span>❌ Absent</span>
        <span>🟢 Check In - Start of work day</span>
        <span>🟡 Check Out - End of work day</span>
      </div>
    </motion.div>
  );
};

export default AttendanceTracker;
