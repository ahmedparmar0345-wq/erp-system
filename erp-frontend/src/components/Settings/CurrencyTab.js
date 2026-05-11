import React, { useState, useEffect } from 'react';
import { getSettings, updateSetting } from '../../services/settings';

const CurrencyTab = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    currency_symbol: '$',
    currency_code: 'USD',
    currency_position: 'before',
    decimal_places: '2',
    thousand_separator: ','
  });

  useEffect(() => {
    getSettings('currency')
      .then(res => {
        const vals = {};
        Object.entries(res.data.currency || {}).forEach(([key, value]) => {
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
      alert('Currency settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const formatPreview = (amount) => {
    const symbol = formData.currency_symbol || '$';
    const sep = formData.thousand_separator || ',';
    const dec = parseInt(formData.decimal_places || '2', 10);
    const pos = formData.currency_position;

    let [intPart, decPart] = amount.toFixed(dec).split('.');
    const regex = /(\d+)(\d{3})/;
    while (regex.test(intPart)) {
      intPart = intPart.replace(regex, '$1' + sep + '$2');
    }

    const formattedDec = decPart ? `.${decPart}` : '';
    const formattedNum = `${intPart}${formattedDec}`;

    return pos === 'before' ? `${symbol}${formattedNum}` : `${formattedNum}${symbol}`;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading settings...</div>;

  return (
    <div>
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Currency Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Currency Symbol</label>
            <input type="text" name="currency_symbol" value={formData.currency_symbol} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Currency Code</label>
            <input type="text" name="currency_code" value={formData.currency_code} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Symbol Position</label>
            <select name="currency_position" value={formData.currency_position} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <option value="before">Before Amount</option>
              <option value="after">After Amount</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Decimal Places</label>
            <input type="number" name="decimal_places" value={formData.decimal_places} onChange={handleChange} min="0" max="5" style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Thousand Separator</label>
            <select name="thousand_separator" value={formData.thousand_separator} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <option value=",">Comma (,)</option>
              <option value=".">Dot (.)</option>
              <option value=" ">Space</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: '#f0fdf4', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#065f46' }}>Live Preview</h4>
        <p style={{ fontSize: '28px', margin: '8px 0', color: '#111827', fontWeight: '700' }}>
          {formatPreview(12345.6789)}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '12px 28px', background: saving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default CurrencyTab;
