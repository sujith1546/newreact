import React from 'react';

export default function CharacterCounter({ currentLength = 0, maxLength = 500 }) {
  const percentage = (currentLength / maxLength) * 100;
  const isWarning = percentage >= 90 && percentage < 100;
  const isError = currentLength >= maxLength;

  const color = isError 
    ? '#ef4444' 
    : isWarning 
      ? '#f59e0b' 
      : 'var(--text-muted)';

  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: isWarning || isError ? 700 : 500,
        color,
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'color 0.15s ease',
        userSelect: 'none'
      }}
      aria-label={`${currentLength} of ${maxLength} characters used`}
    >
      {currentLength}/{maxLength}
    </span>
  );
}
