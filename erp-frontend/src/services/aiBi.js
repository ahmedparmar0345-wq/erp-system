import api from './api';

export const getAIBIDashboard = () => api.get('/ai-bi/dashboard').then(res => res.data);
export const getSalesForecast = (months = 12, forecast = 3) => api.get(`/ai-bi/sales-forecast?months=${months}&forecast=${forecast}`).then(res => res.data);
export const getProductInsights = () => api.get('/ai-bi/product-insights').then(res => res.data);
export const getCustomerInsights = () => api.get('/ai-bi/customer-insights').then(res => res.data);
export const getAnomalies = () => api.get('/ai-bi/anomalies').then(res => res.data);
export const getSeasonality = () => api.get('/ai-bi/seasonality').then(res => res.data);
