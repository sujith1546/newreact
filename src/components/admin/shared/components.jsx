import React from 'react';
import { Loader2 } from 'lucide-react';

export function StatCard({ label, value, loading, icon, color = '#007bff' }) {
  return (
    <div className="admin-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="admin-stat-label">{label}</p>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`ti ${icon}`} style={{ fontSize: 16, color }} />
        </div>
      </div>
      <p className="admin-stat-value" style={{ color }}>
        {loading ? <Loader2 className="spin" size={20} color={color} /> : value}
      </p>
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="admin-empty">
      <i className={`ti ${icon}`} style={{ fontSize: 32, color: 'var(--text-muted)', opacity: 0.5 }} aria-hidden="true" />
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

export function PanelCard({ title, action, headerElement, children }) {
  return (
    <div className="admin-panel-card">
      <div className="admin-panel-header">
        <h3 className="admin-panel-title">{title}</h3>
        <div className="admin-panel-actions">
          {headerElement}
          {action && (
            <button className="admin-action-btn" onClick={action.onClick}>
              <i className={`ti ${action.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
              {action.label}
            </button>
          )}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

// Premium Custom Toggle Switch
export function PremiumToggle({ checked, onChange, label, description, icon: Icon, color = 'var(--primary-blue)' }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px', 
        background: checked ? `color-mix(in srgb, ${color} 8%, transparent)` : 'var(--bg-secondary)', 
        borderRadius: 16, border: '1px solid',
        borderColor: checked ? `color-mix(in srgb, ${color} 30%, transparent)` : 'var(--border-color)',
        cursor: 'pointer', transition: 'all 0.2s ease',
        boxShadow: checked ? `0 4px 20px color-mix(in srgb, ${color} 5%, transparent)` : 'none'
      }}
    >
      {Icon && (
        <div style={{ 
          width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: checked ? color : 'var(--bg-primary)',
          color: checked ? '#fff' : 'var(--text-muted)',
          boxShadow: checked ? `0 4px 12px color-mix(in srgb, ${color} 40%, transparent)` : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Icon size={20} strokeWidth={checked ? 2.5 : 2} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
        {description && <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{description}</span>}
      </div>
      <div style={{ 
        width: 44, height: 24, borderRadius: 12, background: checked ? color : 'var(--border-color)',
        position: 'relative', transition: 'background 0.3s ease', flexShrink: 0
      }}>
        <div 
          style={{
            width: 20, height: 20, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2, left: checked ? 22 : 2,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
}

// Premium Input Field
export function PremiumInput({ label, icon: Icon, type = "text", value, onChange, onBlur, placeholder, multiline = false }) {
  const [focused, React_useState] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4 }}>{label}</label>
      <div style={{ 
        display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 12, 
        padding: multiline ? '12px 16px' : '0 16px', minHeight: 48,
        background: 'var(--bg-secondary)', borderRadius: 12,
        border: '1px solid', borderColor: focused ? 'var(--primary-blue)' : 'var(--border-color)',
        boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--primary-blue) 15%, transparent)' : 'none',
        transition: 'all 0.2s ease'
      }}>
        {Icon && <Icon size={18} style={{ color: focused ? 'var(--primary-blue)' : 'var(--text-muted)', marginTop: multiline ? 2 : 0, transition: 'color 0.2s ease' }} />}
        {multiline ? (
          <textarea 
            value={value} onChange={onChange} placeholder={placeholder}
            onFocus={() => React_useState(true)} 
            onBlur={(e) => { React_useState(false); if (onBlur) onBlur(e); }}
            style={{ 
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', 
              fontSize: 15, outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'inherit'
            }}
          />
        ) : (
          <input 
            type={type} value={value} onChange={onChange} placeholder={placeholder}
            onFocus={() => React_useState(true)} 
            onBlur={(e) => { React_useState(false); if (onBlur) onBlur(e); }}
            style={{ 
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', 
              fontSize: 15, outline: 'none', width: '100%'
            }}
          />
        )}
      </div>
    </div>
  );
}
