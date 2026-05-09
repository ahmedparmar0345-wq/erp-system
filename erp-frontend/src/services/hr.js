import api from './api';

// Employees
export const getEmployees = (params = {}) => api.get('/hr/employees', { params });
export const getEmployee = (id) => api.get(`/hr/employees/${id}`);
export const createEmployee = (data) => api.post('/hr/employees', data);
export const updateEmployee = (id, data) => api.put(`/hr/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/hr/employees/${id}`);
export const updateEmployeeStatus = (id, data) => api.patch(`/hr/employees/${id}/status`, data);

// Attendance
export const getAttendance = (params = {}) => api.get('/hr/attendance', { params });
export const checkIn = (data) => api.post('/hr/attendance/check-in', data);
export const checkOut = (data) => api.post('/hr/attendance/check-out', data);
export const getAttendanceReport = (params = {}) => api.get('/hr/attendance/report', { params });

// Leave Types
export const getLeaveTypes = () => api.get('/hr/leave-types');
export const createLeaveType = (data) => api.post('/hr/leave-types', data);
export const updateLeaveType = (id, data) => api.put(`/hr/leave-types/${id}`, data);

// Leave Requests
export const getLeaveRequests = (params = {}) => api.get('/hr/leave-requests', { params });
export const createLeaveRequest = (data) => api.post('/hr/leave-requests', data);
export const approveLeaveRequest = (id, data) => api.patch(`/hr/leave-requests/${id}/approve`, data);
export const rejectLeaveRequest = (id, data) => api.patch(`/hr/leave-requests/${id}/reject`, data);

// Documents
export const uploadDocument = (data) => api.post('/hr/documents/upload', data);
export const getEmployeeDocuments = (employeeId) => api.get(`/hr/documents/${employeeId}`);