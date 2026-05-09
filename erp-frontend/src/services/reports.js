import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getStockLedger = async (params = {}) => {
  return axios.get(`${API_URL}/reports/stock-ledger`, { ...getAuthHeaders(), params, timeout: 30000 });
};

export const getStockValue = async () => {
  return axios.get(`${API_URL}/reports/stock-value`, getAuthHeaders());
};

export const getLowStock = async () => {
  return axios.get(`${API_URL}/reports/low-stock`, getAuthHeaders());
};

export const getStockMovement = async (params = {}) => {
  return axios.get(`${API_URL}/reports/stock-movement`, { ...getAuthHeaders(), params });
};
