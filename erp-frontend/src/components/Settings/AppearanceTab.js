import React, { useState, useEffect } from 'react';
import { getSettings, updateSetting } from '../../services/settings';

const AppearanceTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    theme: 'light',
    primary_color: '#3b82f6',
    sidebar_color: '#1e293b'
  });

  useEffect(() => {
    getSettings('appearance')
      .then(res => {
        const vals = {};
        Object.entries(res.data.appearance || {}).forEach(([key, { value }]) => {
          vals[key] = value;
        });
        setFormData(vals);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(formData).map(([key, value]) => updateSetting(key, value));
      await Promise.all(promises);
      document.body.style.backgroundColor = formData.theme === 'dark' ? '#1a1a1a' : '#ffffff';
      document.documentElement.style.setProperty('--primary', formData.primary_color);
      alert('Appearance settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading settings...</div>;

  return (
    <div>
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Appearance</h3>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Theme Mode</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setFormData(prev => ({ ...prev, theme: 'light' }))}
              style={{
                flex: 1, padding: '12px', border: formData.theme === 'light' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                borderRadius: '12px', cursor: 'pointer', fontSize: '14px',
                background: formData.theme === 'light' ? '#f5f3ff' : 'white',
                color: formData.theme === 'light' ? '#6366f1' : '#6b7280',
                fontWeight: formData.theme === 'light' ? '600' : '400'
              }}
            >☀️ Light Mode</button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, theme: 'dark' }))}
              style={{
                flex: 1, padding: '12px', border: formData.theme === 'dark' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                borderRadius: '12px', cursor: 'pointer', fontSize: '14px',
                background: formData.theme === 'dark' ? '#f5f3ff' : 'white',
                color: formData.theme === 'dark' ? '#6366f1' : '#6b7280',
                fontWeight: formData.theme === 'dark' ? '600' : '400'
              }}
            >🌙 Dark Mode</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Primary Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="color" name="primary_color" value={formData.primary_color} onChange={handleChange} style={{ width: '48px', height: '40px', padding: 0, border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }} />
              <input type="text" value={formData.primary_color} readOnly style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Sidebar Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="color" name="sidebar_color" value={formData.sidebar_color} onChange={handleChange} style={{ width: '48px', height: '40px', padding: 0, border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }} />
              <input type="text" value={formData.sidebar_color} readOnly style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '20px', background: formData.theme === 'dark' ? '#1f2937' : '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: formData.theme === 'dark' ? '#f3f4f6' : '#374151' }}>Preview</h4>
          <p style={{ color: formData.theme === 'dark' ? '#d1d5db' : '#6b7280', marginBottom: '12px' }}>
            This is how your primary color looks: <span style={{ color: formData.primary_color, fontWeight: 'bold' }}>Sample Text</span>
          </p>
          <button style={{ padding: '8px 20px', background: formData.primary_color, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px' }}>Sample Button</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '12px 28px', background: saving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default AppearanceTab;
