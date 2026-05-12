import api from './api';

export const getBOMs = async () => {
  return api.get('/production/boms');
};

export const getBOM = async (id) => {
  return api.get(`/production/boms/${id}`);
};

export const createBOM = async (data) => {
  return api.post('/production/boms', data);
};

export const updateBOM = async (id, data) => {
  return api.put(`/production/boms/${id}`, data);
};

export const deleteBOM = async (id) => {
  return api.delete(`/production/boms/${id}`);
};

export const getWorkOrders = async () => {
  return api.get('/production/work-orders');
};

export const getWorkOrder = async (id) => {
  return api.get(`/production/work-orders/${id}`);
};

export const createWorkOrder = async (data) => {
  return api.post('/production/work-orders', data);
};

export const startWorkOrder = async (id) => {
  return api.patch(`/production/work-orders/${id}/start`);
};

export const produceWorkOrder = async (id, data) => {
  return api.post(`/production/work-orders/${id}/produce`, data);
};

export const completeWorkOrder = async (id) => {
  return api.patch(`/production/work-orders/${id}/complete`);
};

export const cancelWorkOrder = async (id) => {
  return api.patch(`/production/work-orders/${id}/cancel`);
};

export const getMaterialRequirements = async (bomId, quantity) => {
  return api.get(`/production/requirements/${bomId}?quantity=${quantity}`);
};

export const getAvailableStock = async (bomId) => {
  return api.get(`/production/available-stock/${bomId}`);
};

export const calculateProductionCost = async (workOrderId) => {
  return api.post(`/production/calculate-cost/${workOrderId}`);
};
