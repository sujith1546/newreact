import React from 'react';

export default function SectionHeader({ badge, title, subtitle, align = 'center', className = '', style = {} }) {
  const isLeft = align === 'left';
  return (
    <div
      className={`section-header ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isLeft ? 'flex-start' : 'center',
        textAlign: isLeft ? 'left' : 'center',
        marginBottom: '40px',
        ...style,
      }}
    >
      {badge && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '99px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            background: 'color-mix(in srgb, var(--primary-blue, #3b82f6) 12%, transparent)',
            color: 'var(--primary-blue, #3b82f6)',
            border: '1px solid color-mix(in srgb, var(--primary-blue, #3b82f6) 25%, transparent)',
            marginBottom: '12px',
          }}
        >
          {badge}
        </span>
      )}
      <h2
        style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: 800,
          letterSpacing: '-0.8px',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            margin: '10px 0 0',
            fontSize: '15px',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
