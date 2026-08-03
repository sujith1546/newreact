import React from 'react';
import { motion } from 'framer-motion';

const INQUIRY_TYPES = [
  { id: 'job', label: 'Job opportunity', icon: '💼' },
  { id: 'collaboration', label: 'Collaboration', icon: '🤝' },
  { id: 'hello', label: 'Just saying hi', icon: '👋' }
];

export default function InquiryTypeSelector({ selectedType = 'job', onSelect }) {
  return (
    <div 
      className="inquiry-type-selector" 
      role="radiogroup" 
      aria-label="Inquiry Type"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}
    >
      {INQUIRY_TYPES.map((type) => {
        const isSelected = selectedType === type.id;
        return (
          <button
            key={type.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(type.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 11px',
              borderRadius: '999px',
              fontSize: '11.5px',
              fontWeight: isSelected ? 700 : 500,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.18s ease',
              border: isSelected 
                ? '1px solid var(--primary-blue)' 
                : '1px solid var(--border-color)',
              backgroundColor: isSelected 
                ? 'color-mix(in srgb, var(--primary-blue) 12%, var(--bg-secondary))' 
                : 'var(--bg-secondary)',
              color: isSelected 
                ? 'var(--primary-blue)' 
                : 'var(--text-secondary)',
              boxShadow: isSelected 
                ? '0 2px 8px color-mix(in srgb, var(--primary-blue) 25%, transparent)' 
                : 'none'
            }}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        );
      })}
    </div>
  );
}
