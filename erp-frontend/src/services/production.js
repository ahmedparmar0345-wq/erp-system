import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getBOMs = async () => {
  return axios.get(`${API_URL}/production/boms`, getAuthHeaders());
};

export const getBOM = async (id) => {
  return axios.get(`${API_URL}/production/boms/${id}`, getAuthHeaders());
};

export const createBOM = async (data) => {
  return axios.post(`${API_URL}/production/boms`, data, getAuthHeaders());
};

export const updateBOM = async (id, data) => {
  return axios.put(`${API_URL}/production/boms/${id}`, data, getAuthHeaders());
};

export const deleteBOM = async (id) => {
  return axios.delete(`${API_URL}/production/boms/${id}`, getAuthHeaders());
};

export const getWorkOrders = async () => {
  return axios.get(`${API_URL}/production/work-orders`, getAuthHeaders());
};

export const getWorkOrder = async (id) => {
  return axios.get(`${API_URL}/production/work-orders/${id}`, getAuthHeaders());
};

export const createWorkOrder = async (data) => {
  return axios.post(`${API_URL}/production/work-orders`, data, getAuthHeaders());
};

export const startWorkOrder = async (id) => {
  return axios.patch(`${API_URL}/production/work-orders/${id}/start`, {}, getAuthHeaders());
};

export const produceWorkOrder = async (id, data) => {
  return axios.post(`${API_URL}/production/work-orders/${id}/produce`, data, getAuthHeaders());
};

export const completeWorkOrder = async (id) => {
  return axios.patch(`${API_URL}/production/work-orders/${id}/complete`, {}, getAuthHeaders());
};

export const cancelWorkOrder = async (id) => {
  return axios.patch(`${API_URL}/production/work-orders/${id}/cancel`, {}, getAuthHeaders());
};

export const getMaterialRequirements = async (bomId, quantity) => {
  return axios.get(`${API_URL}/production/requirements/${bomId}?quantity=${quantity}`, getAuthHeaders());
};

export const getAvailableStock = async (bomId) => {
  return axios.get(`${API_URL}/production/available-stock/${bomId}`, getAuthHeaders());
};

export const calculateProductionCost = async (workOrderId) => {
  return axios.post(`${API_URL}/production/calculate-cost/${workOrderId}`, {}, getAuthHeaders());
};
