import api from './api';

// Settings
export const getSettings = (category = null) => {
  const params = category ? { category } : {};
  return api.get('/settings', { params });
};

export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value });
export const uploadLogo = (fileBase64) => api.post('/settings/upload-logo', { fileBase64 });

// Roles
export const getRoles = () => api.get('/settings/roles');
export const createRole = (data) => api.post('/settings/roles', data);
export const updateRole = (id, data) => api.put(`/settings/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/settings/roles/${id}`);

// Users
export const getUsers = () => api.get('/settings/users');
export const createUser = (data) => api.post('/settings/users', data);
export const updateUser = (id, data) => api.put(`/settings/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/settings/users/${id}`);
export const resetPassword = (id, data) => api.post(`/settings/users/${id}/reset-password`, data);

// Email Templates
export const getEmailTemplates = () => api.get('/settings/email-templates');
export const updateEmailTemplate = (code, data) => api.put(`/settings/email-templates/${code}`, data);
export const testEmail = (code) => api.post(`/settings/email-templates/${code}/test`);

// Audit Logs
export const getAuditLogs = () => api.get('/settings/audit-logs');
export const exportAuditLogs = () => api.get('/settings/audit-logs/export', { responseType: 'blob' });

// System
export const toggleMaintenance = (enabled) => api.post('/settings/maintenance', { enabled });
export const createBackup = () => api.post('/settings/backup');