import api from './api';

// Sessions
export const openSession = (data) => api.post('/pos/session/open', data).then(res => res.data);
export const closeSession = (data) => api.patch('/pos/session/close', data).then(res => res.data);
export const getCurrentSession = () => api.get('/pos/session/current').then(res => {
    console.log('getCurrentSession raw response:', res);
    return res.data;
});
export const getSessions = () => api.get('/pos/sessions').then(res => res.data);

// Cart
export const getCart = () => api.get('/pos/cart').then(res => res.data);
export const addToCart = (data) => api.post('/pos/cart', data).then(res => res.data);
export const updateCartItem = (id, data) => api.put(`/pos/cart/${id}`, data).then(res => res.data);
export const removeFromCart = (id) => api.delete(`/pos/cart/${id}`).then(res => res.data);
export const clearCart = () => api.delete('/pos/cart/clear').then(res => res.data);

// Transactions
export const completeSale = (data) => api.post('/pos/complete-sale', data).then(res => res.data);
export const getReceipt = (orderId) => api.get(`/pos/receipt/${orderId}`).then(res => res.data);

// POS Utilities
export const searchProducts = (q) => api.get('/pos/search/product', { params: { q } }).then(res => res.data);
export const getTodayStats = () => api.get('/pos/today-stats').then(res => res.data);
export const getTopProducts = () => api.get('/pos/top-products').then(res => res.data);
export const getBarcode = (productId) => api.get(`/pos/barcode/${productId}`).then(res => res.data);