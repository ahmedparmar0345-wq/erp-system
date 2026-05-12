import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const EmployeeDocuments = ({ employeeId, employeeName }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [error, setError] = useState('');

    const documentTypes = [
        { value: 'contract', label: '📄 Employment Contract', color: '#6366f1' },
        { value: 'id_card', label: '🪪 ID Card / Passport', color: '#10b981' },
        { value: 'degree', label: '🎓 Degree / Certificate', color: '#f59e0b' },
        { value: 'resume', label: '📝 Resume / CV', color: '#ef4444' },
        { value: 'certification', label: '🏅 Professional Certification', color: '#8b5cf6' },
        { value: 'training', label: '📚 Training Certificate', color: '#06b6d4' },
        { value: 'medical', label: '🏥 Medical Report', color: '#ec4899' },
        { value: 'other', label: '📎 Other Document', color: '#6b7280' }
    ];

    useEffect(() => {
        fetchDocuments();
    }, [employeeId]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/hr/employees/${employeeId}/documents`);
            setDocuments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }
        if (!documentType) {
            setError('Please select document type');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('document_type', documentType);

        try {
            await api.post(`/hr/employees/${employeeId}/documents/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Document uploaded successfully!');
            setShowUploadModal(false);
            setSelectedFile(null);
            setDocumentType('');
            fetchDocuments();
        } catch (err) {
            console.error('Error uploading:', err);
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId, docName) => {
        if (window.confirm(`Delete "${docName}"? This action cannot be undone.`)) {
            try {
                await api.delete(`/hr/employees/${employeeId}/documents/${docId}`);
                alert('Document deleted successfully');
                fetchDocuments();
            } catch (err) {
                console.error('Error deleting:', err);
                alert('Failed to delete document');
            }
        }
    };

    const handleDownload = async (docId, docName) => {
        try {
            const token = localStorage.getItem('token');
            window.open(`/api/hr/employees/${employeeId}/documents/${docId}/download?token=${token}`, '_blank');
        } catch (err) {
            console.error('Error downloading:', err);
            alert('Failed to download document');
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getDocumentTypeLabel = (type) => {
        const found = documentTypes.find(dt => dt.value === type);
        return found ? found.label : type;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Loading documents...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Documents Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Employee Documents</h3>
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>Manage contracts, certificates, and other documents</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <span>📤</span> Upload Document
                </button>
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    background: '#f9fafb',
                    borderRadius: '16px',
                    border: '1px dashed #e5e7eb'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>No documents uploaded yet</div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Click "Upload Document" to add files</div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '16px'
                }}>
                    {documents.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '16px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                transition: 'all 0.2s'
                            }}
                            whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: '#e0e7ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px'
                                        }}>
                                            📄
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{doc.document_name}</div>
                                            <div style={{ fontSize: '11px', color: '#6366f1' }}>
                                                {getDocumentTypeLabel(doc.document_type)}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                                        <div>📅 Uploaded: {formatDate(doc.uploaded_at)}</div>
                                        <div>📦 Size: {formatFileSize(doc.file_size)}</div>
                                        <div>👤 By: {doc.uploaded_by_name || 'System'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleDownload(doc.id, doc.document_name)}
                                        style={{
                                            padding: '6px',
                                            background: '#f3f4f6',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                        title="Download"
                                    >
                                        📥
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id, doc.document_name)}
                                        style={{
                                            padding: '6px',
                                            background: '#fee2e2',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '28px',
                                width: '500px',
                                maxWidth: '90%'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Upload Document</h2>
                                <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                            </div>

                            <form onSubmit={handleFileUpload}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Document Type *</label>
                                    <select
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="">Select Document Type</option>
                                        {documentTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Select File *</label>
                                    <div style={{
                                        border: '2px dashed #e5e7eb',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: selectedFile ? '#f0fdf4' : '#f9fafb'
                                    }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const file = e.dataTransfer.files[0];
                                            if (file) setSelectedFile(file);
                                        }}
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        <input
                                            id="fileInput"
                                            type="file"
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                            style={{ display: 'none' }}
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        />
                                        {selectedFile ? (
                                            <div>
                                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                                                <div style={{ fontWeight: '500' }}>{selectedFile.name}</div>
                                                <div style={{ fontSize: '11px', color: '#666' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                                                <div style={{ fontWeight: '500' }}>Click or drag file to upload</div>
                                                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>PDF, JPEG, PNG, DOC (Max 5MB)</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {error && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                    <button type="button" onClick={() => setShowUploadModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" disabled={uploading} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>{uploading ? 'Uploading...' : 'Upload Document'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeDocuments;