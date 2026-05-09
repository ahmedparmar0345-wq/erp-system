import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GeneralTab from './GeneralTab';
import CurrencyTab from './CurrencyTab';
import AppearanceTab from './AppearanceTab';
import RoleManagement from './RoleManagement';
import UserManagement from './UserManagement';
import EmailTemplates from './EmailTemplates';
import AuditLogs from './AuditLogs';
import SystemTab from './SystemTab';

const tabs = [
  { id: 'general', label: 'General Settings', icon: '⚙️' },
  { id: 'currency', label: 'Currency Settings', icon: '💰' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'roles', label: 'Role Management', icon: '🔐' },
  { id: 'users', label: 'User Management', icon: '👥' },
  { id: 'emails', label: 'Email Templates', icon: '📧' },
  { id: 'audit', label: 'Audit Logs', icon: '📋' },
  { id: 'system', label: 'System', icon: '🖥️' }
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Manage system configuration and preferences</p>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '6px', marginBottom: '24px', border: '1px solid #e5e7eb', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px', border: 'none', borderRadius: '14px', cursor: 'pointer',
              fontSize: '13px', fontWeight: activeTab === tab.id ? '600' : '400',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = '#f3f4f6'; }}
            onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'currency' && <CurrencyTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'roles' && <RoleManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'emails' && <EmailTemplates />}
        {activeTab === 'audit' && <AuditLogs />}
        {activeTab === 'system' && <SystemTab />}
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
