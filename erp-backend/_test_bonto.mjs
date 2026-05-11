// Test if bonto backend has the route fix
const res = await fetch('https://erp-backend.bonto.run/api/settings/roles');
const text = await res.text();
console.log('Status:', res.status);
console.log('Body:', text.substring(0, 200));
