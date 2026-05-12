import api from './api';

export const getStockLedger = async (params = {}) => {
  return api.get('/reports/stock-ledger', { params, timeout: 30000 });
};

export const getStockValue = async () => {
  return api.get('/reports/stock-value');
};

export const getLowStock = async () => {
  return api.get('/reports/low-stock');
};

export const getStockMovement = async (params = {}) => {
  return api.get('/reports/stock-movement', { params });
};
