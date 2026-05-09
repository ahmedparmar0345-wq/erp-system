import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBOM, createBOM, updateBOM } from '../../services/production';
import { useNavigate, useParams } from 'react-router-dom';

const BOMForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [version, setVersion] = useState('1.0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ raw_material_id: '', quantity: 1, unit_cost: 0, wastage_percent: 0 }]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    fetchProducts();
    if (isEdit) {
      loadBOM();
    }
  }, [id]);

  useEffect(() => {
    const cost = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.raw_material_id);
      return sum + (parseFloat(item.quantity) * parseFloat(product?.cost_price || item.unit_cost || 0));
    }, 0);
    setTotalCost(cost);
  }, [items, products]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBOM = async () => {
    try {
      const res = await getBOM(id);
      const bom = res.data;
      setName(bom.name || '');
      setProductId(bom.product_id || '');
      setVersion(bom.version || '1.0');
      setNotes(bom.notes || '');
      if (bom.items && bom.items.length > 0) {
        setItems(bom.items.map(item => ({
          raw_material_id: item.raw_material_id,
          quantity: parseFloat(item.quantity),
          unit_cost: parseFloat(item.unit_cost || 0),
          wastage_percent: parseFloat(item.wastage_percent || 0)
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = () => {
    setItems([...items, { raw_material_id: '', quantity: 1, unit_cost: 0, wastage_percent: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'raw_material_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_cost = parseFloat(product.cost_price || 0);
      }
    }
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !productId || items.some(i => !i.raw_material_id || i.quantity <= 0)) {
      alert('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const data = { name, product_id: productId, version, notes, items };
      if (isEdit) {
        await updateBOM(id, data);
      } else {
        await createBOM(data);
      }
      navigate('/production/boms');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save BOM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/production/boms')} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>← Back to BOMs</button>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{isEdit ? 'Edit BOM' : 'Create BOM'}</h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>{isEdit ? 'Update the bill of materials' : 'Define a new bill of materials'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>BOM Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Finished Good Product *</label>
              <select value={productId} onChange={e => setProductId(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <option value="">Select Product</option>
                {products.filter(p => !p.is_raw_material).map(p => (
                  <option key={p.id} value={p.id}>{p.product_name || p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Version</label>
              <input type="text" value={version} onChange={e => setVersion(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Raw Materials</h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px,2fr) minmax(70px,1fr) minmax(80px,1fr) minmax(80px,1fr) minmax(70px,1fr) 40px', gap: '8px', marginBottom: '8px', padding: '0 4px', minWidth: '500px' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>Material</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>Qty</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>Unit Cost</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>Wastage %</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'right' }}>Row Cost</span>
            </div>
            {items.map((item, index) => {
              const product = products.find(p => p.id === item.raw_material_id);
              const rowCost = parseFloat(item.quantity) * parseFloat(product?.cost_price || item.unit_cost || 0);
              return (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px,2fr) minmax(70px,1fr) minmax(80px,1fr) minmax(80px,1fr) minmax(70px,1fr) 40px', gap: '8px', marginBottom: '8px', alignItems: 'center', minWidth: '500px' }}>
                  <select value={item.raw_material_id} onChange={e => updateItem(index, 'raw_material_id', e.target.value)} required style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }}>
                    <option value="">Select Material</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.product_name || p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <input type="number" step="0.01" min="0.01" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value))} required style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }} />
                  <input type="number" step="0.01" value={item.unit_cost} onChange={e => updateItem(index, 'unit_cost', parseFloat(e.target.value))} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }} />
                  <input type="number" step="0.01" min="0" value={item.wastage_percent} onChange={e => updateItem(index, 'wastage_percent', parseFloat(e.target.value))} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }} />
                  <span style={{ textAlign: 'right', fontSize: '13px', padding: '8px' }}>${rowCost.toFixed(2)}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} style={{ padding: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" onClick={addItem} style={{ marginTop: '12px', padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>+ Add Material</button>
          <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
            <strong style={{ color: '#065f46' }}>Estimated Cost per Unit: ${totalCost.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }}></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => navigate('/production/boms')} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : isEdit ? 'Update BOM' : 'Create BOM'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default BOMForm;
