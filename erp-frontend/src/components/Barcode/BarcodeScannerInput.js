import React, { useState, useRef, useEffect } from 'react';

const BarcodeScannerInput = ({ onScan, placeholder = 'Scan barcode...', autoFocus = false }) => {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const bufferRef = useRef('');
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const code = bufferRef.current.trim();
      if (code) {
        onScan(code);
        bufferRef.current = '';
        setValue('');
      }
      e.preventDefault();
      return;
    }

    if (e.key.length === 1) {
      bufferRef.current += e.key;
      setIsListening(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (bufferRef.current.length > 2) {
          onScan(bufferRef.current.trim());
        }
        bufferRef.current = '';
        setIsListening(false);
      }, 100);
      e.preventDefault();
    }

    if (e.key === 'Escape') {
      bufferRef.current = '';
      setValue('');
      setIsListening(false);
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onScan(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', gap:'8px', alignItems:'center' }}>
      <div style={{
        flex:1, display:'flex', alignItems:'center', gap:'8px',
        background:'white', border:`2px solid ${isListening ? '#10b981' : '#e5e7eb'}`,
        borderRadius:'12px', padding:'8px 16px',
        transition:'border-color 0.2s'
      }}>
        <span style={{ fontSize:'16px' }}>{isListening ? '📡' : '📷'}</span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            flex:1, border:'none', outline:'none', fontSize:'14px',
            background:'transparent', fontFamily: "'Courier New', monospace"
          }}
        />
        {isListening && <span style={{ fontSize:'11px', color:'#10b981', fontWeight:'500' }}>SCANNING</span>}
      </div>
      <button type="submit"
        style={{
          padding:'10px 16px', background:'#6366f1', color:'white',
          border:'none', borderRadius:'10px', cursor:'pointer',
          fontSize:'13px', fontWeight:'500', whiteSpace:'nowrap'
        }}>
        Search
      </button>
    </form>
  );
};

export default BarcodeScannerInput;
