import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';

const BarcodeGenerator = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [labelSize, setLabelSize] = useState('2x1');
  const [showQR, setShowQR] = useState(false);
  const printRef = useRef();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/barcode/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(filtered.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  const generateBarcode = (el, code) => {
    if (el && code) {
      try {
        JsBarcode(el, code, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 5
        });
      } catch (e) { /* ignore invalid barcode */ }
    }
  };

  const generateQRData = (product) => {
    return JSON.stringify({ id: product.id, sku: product.sku, name: product.name, price: product.unit_price });
  };

  const handlePrint = () => {
    const toPrint = products.filter(p => selected.includes(p.id));
    if (toPrint.length === 0) { alert('Select at least one product'); return; }

    const printWindow = window.open('', '_blank');
    const cols = labelSize === '2x1' ? 2 : labelSize === '3x1' ? 3 : 1;

    let html = `<!DOCTYPE html><html><head><title>Print Barcodes</title>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.12.3/dist/JsBarcode.all.min.js"><\/script>
      <style>
        @page { margin: 10mm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        .label-grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 8px; }
        .label { text-align: center; padding: 8px; border: 1px dashed #ccc; page-break-inside: avoid; }
        .label .product-name { font-size: 11px; font-weight: bold; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .label .price { font-size: 10px; color: #666; margin-top: 2px; }
        .label svg.barcode { max-width: 100%; height: auto; }
        @media print {
          .label { border: none; }
        }
      </style></head><body>
      <div class="label-grid">`;

    toPrint.forEach(p => {
      const code = p.barcode || p.sku;
      html += `<div class="label">
        <div class="product-name">${p.name}</div>
        <svg class="barcode" id="b-${p.id}"></svg>
        <div class="price">$${parseFloat(p.unit_price || 0).toFixed(2)}</div>
      </div>`;
    });

    html += `</div>
      <script>
        window.onload = function() {
          const toPrint = ${JSON.stringify(toPrint)};
          toPrint.forEach(p => {
            const el = document.getElementById('b-' + p.id);
            if (el) {
              try {
                JsBarcode(el, p.barcode || p.sku, { format: 'CODE128', width: 2, height: 50, displayValue: true, fontSize: 14, margin: 5 });
              } catch(e) {}
            }
          });
          setTimeout(function() { window.print(); }, 500);
        };
      <\/script>
    </body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const formatCurrency = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`;
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'400px' }}>
      <div style={{ fontSize:'14px', color:'#666' }}>Loading products...</div>
    </div>;
  }

  return (
    <div style={{ maxWidth:'1400px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:'700', marginBottom:'4px' }}>Barcode & QR Generator</h1>
          <p style={{ fontSize:'14px', color:'#666', margin:0 }}>Generate and print barcode labels for products</p>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <select value={labelSize} onChange={e => setLabelSize(e.target.value)}
            style={{ padding:'8px 16px', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', background:'white' }}>
            <option value="1x1">1 per row</option>
            <option value="2x1">2 per row</option>
            <option value="3x1">3 per row</option>
          </select>
          <label style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', cursor:'pointer' }}>
            <input type="checkbox" checked={showQR} onChange={e => setShowQR(e.target.checked)} />
            Show QR
          </label>
          <button onClick={handlePrint} disabled={selected.length === 0}
            style={{ padding:'10px 20px', background: selected.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'white', border:'none', borderRadius:'10px', cursor: selected.length === 0 ? 'not-allowed' : 'pointer', fontSize:'14px', fontWeight:'500', boxShadow: selected.length === 0 ? 'none' : '0 2px 4px rgba(99,102,241,0.3)' }}>
            🖨️ Print Labels ({selected.length})
          </button>
        </div>
      </div>

      <div style={{ marginBottom:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'8px 16px', maxWidth:'400px' }}>
          <span style={{ fontSize:'16px', marginRight:'8px', color:'#9ca3af' }}>🔍</span>
          <input type="text" placeholder="Search by name, SKU, or barcode..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex:1, border:'none', outline:'none', fontSize:'14px', background:'transparent' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🏷️</div>
          <div style={{ fontSize:'18px', fontWeight:'500', marginBottom:'8px' }}>No products found</div>
          <div style={{ fontSize:'14px', color:'#666' }}>Add products first, then generate barcodes.</div>
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden' }}>
          <table className="table-modern" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                <th style={{ padding:'12px', textAlign:'center', width:'40px' }}>
                  <input type="checkbox" checked={selectAll && selected.length === filtered.length} onChange={toggleSelectAll} />
                </th>
                <th style={{ padding:'12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Product</th>
                <th style={{ padding:'12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>SKU</th>
                <th style={{ padding:'12px', textAlign:'left', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Barcode</th>
                <th style={{ padding:'12px', textAlign:'right', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Price</th>
                <th style={{ padding:'12px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280' }}>Preview</th>
                {showQR && <th style={{ padding:'12px', textAlign:'center', fontSize:'12px', fontWeight:'600', color:'#6b7280', width:'80px' }}>QR</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom:'1px solid #f3f4f6', background: selected.includes(p.id) ? '#f0f0ff' : 'white' }}>
                  <td style={{ padding:'12px', textAlign:'center' }}>
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td style={{ padding:'12px', fontWeight:'500' }}>{p.name}</td>
                  <td style={{ padding:'12px', color:'#6b7280', fontSize:'13px' }}>{p.sku}</td>
                  <td style={{ padding:'12px', color:'#6b7280', fontSize:'13px' }}>{p.barcode || p.sku}</td>
                  <td style={{ padding:'12px', textAlign:'right', fontWeight:'600' }}>{formatCurrency(p.unit_price)}</td>
                  <td style={{ padding:'12px', textAlign:'center' }}>
                    <svg ref={el => generateBarcode(el, p.barcode || p.sku)} style={{ maxWidth:'150px', height:'30px' }}></svg>
                  </td>
                  {showQR && <td style={{ padding:'12px', textAlign:'center' }}>
                    <QRCodeSVG value={generateQRData(p)} size={40} />
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BarcodeGenerator;
