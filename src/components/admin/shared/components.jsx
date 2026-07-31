import React from 'react';
import { Loader2 } from 'lucide-react';

/* ──────────────────────────────────────────────
   StatCard — premium gradient-border stat card
────────────────────────────────────────────── */
export function StatCard({ label, value, loading, icon, color = '#6366F1' }) {
  return (
    <div
      className="pcms-stat-card"
      style={{ '--card-gradient': `linear-gradient(135deg, ${color} 0%, ${color}99 100%)` }}
    >
      <div className="pcms-stat-top">
        <p className="pcms-stat-label">{label}</p>
        <div className="pcms-stat-icon" style={{ background: `${color}20`, color }}>
          <i className={`ti ${icon}`} style={{ fontSize: 16 }} />
        </div>
      </div>
      <p className="pcms-stat-value" style={{ color }}>
        {loading ? <Loader2 className="spin" size={22} style={{ color }} /> : value}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   EmptyState — illustrated empty state
────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="pcms-empty">
      <div className="pcms-empty-icon">
        <i className={`ti ${icon}`} style={{ fontSize: 24 }} aria-hidden="true" />
      </div>
      <h4 className="pcms-empty-title">{title}</h4>
      <p className="pcms-empty-desc">{description}</p>
      {action && (
        <button className="pcms-btn-dark" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   PanelCard — premium card shell with header
────────────────────────────────────────────── */
export function PanelCard({ title, subtitle, action, headerElement, icon, iconColor = '#6366F1', children }) {
  return (
    <div className="pcms-panel-card">
      <div className="pcms-panel-header">
        <div className="pcms-panel-title-row">
          {icon && (
            <div className="pcms-panel-icon" style={{ background: `${iconColor}18`, color: iconColor }}>
              <i className={`ti ${icon}`} style={{ fontSize: 15 }} />
            </div>
          )}
          <div>
            <h3 className="pcms-panel-title">{title}</h3>
            {subtitle && <div className="pcms-panel-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="pcms-panel-actions">
          {headerElement}
          {action && (
            <button className="pcms-btn-dark" onClick={action.onClick}>
              {action.icon && <i className={`ti ${action.icon}`} style={{ fontSize: 13 }} />}
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

/* ──────────────────────────────────────────────
   PremiumToggle — premium dark-theme toggle row
────────────────────────────────────────────── */
export function PremiumToggle({ checked, onChange, label, description, icon: Icon }) {
  return (
    <div
      className={`pcms-toggle-row${checked ? ' active' : ''}`}
      onClick={() => onChange(!checked)}
    >
      {Icon && (
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: checked ? 'var(--pcms-accent-dim)' : 'var(--pcms-panel)',
          color: checked ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
          flexShrink: 0, transition: 'all 0.15s',
          border: '1px solid var(--pcms-line)',
        }}>
          <Icon size={14} strokeWidth={checked ? 2.2 : 1.8} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--pcms-text)' }}>
          {label}
        </span>
        {description && (
          <span style={{ display: 'block', fontSize: 11, color: 'var(--pcms-muted)', marginTop: 1 }}>
            {description}
          </span>
        )}
      </div>
      <div className={`pcms-toggle-track${checked ? ' on' : ''}`}>
        <div className={`pcms-toggle-thumb${checked ? ' on' : ''}`} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PremiumInput — styled input with floating label
────────────────────────────────────────────── */
export function PremiumInput({ label, icon: Icon, type = 'text', value, onChange, onBlur, placeholder, multiline = false }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label className="pcms-form-label">{label}</label>
      )}
      <div style={{
        display: 'flex',
        alignItems: multiline ? 'flex-start' : 'center',
        gap: 8,
        padding: multiline ? '10px 12px' : '0 12px',
        minHeight: multiline ? undefined : 40,
        background: 'var(--pcms-panel)',
        borderRadius: 8,
        border: `1px solid ${focused ? 'var(--pcms-accent)' : 'var(--pcms-line)'}`,
        boxShadow: focused ? '0 0 0 3px var(--pcms-accent-dim)' : 'none',
        transition: 'all 0.15s ease',
      }}>
        {Icon && (
          <Icon
            size={14}
            style={{
              color: focused ? 'var(--pcms-accent)' : 'var(--pcms-muted-2)',
              marginTop: multiline ? 3 : 0,
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
          />
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--pcms-text)', fontSize: 13, outline: 'none',
              minHeight: 80, resize: 'vertical', fontFamily: 'inherit',
            }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--pcms-text)', fontSize: 13, outline: 'none', width: '100%',
            }}
          />
        )}
      </div>
    </div>
  );
}
