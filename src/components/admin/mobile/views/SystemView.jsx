import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, Globe, CheckCircle2 } from 'lucide-react';
import SettingsPanel from '../../panels/SettingsPanel';

export default function SystemView() {
  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* View Content */}
      <div className="admin-subtab-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 14px 110px' }}>
        
        {/* System Status Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: '14px 16px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                System Architecture & Health
              </span>
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#10b981',
              background: 'rgba(16,185,129,0.15)',
              padding: '2px 8px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              HEALTHY
            </span>
          </div>

          {/* Status Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line-soft)', fontSize: 11, fontWeight: 600, color: 'var(--pcms-text)' }}>
              <Database size={12} color="#3b82f6" />
              <span>Supabase DB</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line-soft)', fontSize: 11, fontWeight: 600, color: 'var(--pcms-text)' }}>
              <Globe size={12} color="#10b981" />
              <span>Production Live</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line-soft)', fontSize: 11, fontWeight: 600, color: 'var(--pcms-text)' }}>
              <CheckCircle2 size={12} color="#8b5cf6" />
              <span>Auth Active</span>
            </div>
          </div>
        </motion.div>

        <SettingsPanel />
      </div>
    </div>
  );
}
