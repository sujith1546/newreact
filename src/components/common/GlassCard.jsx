import React from 'react';

export default function GlassCard({ children, className = '', style = {}, onClick, hoverable = true, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${hoverable ? 'hoverable' : ''} ${className}`}
      style={{
        background: 'var(--bg-secondary, rgba(255, 255, 255, 0.05))',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(var(--glass-blur, 12px))',
        WebkitBackdropFilter: 'blur(var(--glass-blur, 12px))',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: 'var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.08))',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
