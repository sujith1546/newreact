import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'googlemail.com'
];

const TYPO_MAP = {
  'gmial.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cmo': 'gmail.com',
  'gamil.co': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yahoogmail.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlok.co': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.co': 'hotmail.com',
  'icoud.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'protonmial.com': 'protonmail.com',
  'protonmai.com': 'protonmail.com'
};

export default function EmailDomainSuggest({
  value = '',
  onChange,
  onBlur,
  onFocus,
  className = '',
  name = 'email',
  id,
  placeholder = 'you@example.com',
  disabled = false,
  type = 'email',
  ...restProps
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [typoSuggestion, setTypoSuggestion] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  // Parse email value into username and domain prefix
  const hasAtSymbol = typeof value === 'string' && value.includes('@');
  const [username = '', domainPrefix = ''] = hasAtSymbol ? value.split('@') : ['', ''];

  // Detect domain typos on blur or value change
  useEffect(() => {
    if (hasAtSymbol && username.trim().length > 0 && domainPrefix) {
      const lowerDomain = domainPrefix.toLowerCase();
      if (TYPO_MAP[lowerDomain]) {
        const corrected = `${username}@${TYPO_MAP[lowerDomain]}`;
        setTypoSuggestion(corrected);
        return;
      }
    }
    setTypoSuggestion(null);
  }, [value, hasAtSymbol, username, domainPrefix]);

  // Filter domain suggestions live
  const suggestions = (hasAtSymbol && username.trim().length > 0)
    ? COMMON_DOMAINS.filter((d) => 
        d.toLowerCase().startsWith(domainPrefix.toLowerCase()) && 
        d.toLowerCase() !== domainPrefix.toLowerCase()
      )
    : [];

  const shouldShowDropdown = isFocused && isOpen && suggestions.length > 0;

  // Reset selected index when domain prefix changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [domainPrefix]);

  // Open dropdown when @ is typed and there are suggestions
  useEffect(() => {
    if (hasAtSymbol && suggestions.length > 0 && isFocused) {
      setIsOpen(true);
    } else if (!hasAtSymbol || suggestions.length === 0) {
      setIsOpen(false);
    }
  }, [value, hasAtSymbol, isFocused, suggestions.length]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const selectSuggestion = (selectedDomain) => {
    const fullEmail = `${username}@${selectedDomain}`;
    if (onChange) {
      onChange({
        target: {
          name,
          value: fullEmail
        }
      });
    }
    setIsOpen(false);
    setTypoSuggestion(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const applyTypoFix = (correctedEmail) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: correctedEmail
        }
      });
    }
    setTypoSuggestion(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!shouldShowDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (suggestions[selectedIndex]) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleInputFocus = (e) => {
    setIsFocused(true);
    if (hasAtSymbol && suggestions.length > 0) {
      setIsOpen(true);
    }
    if (onFocus) onFocus(e);
  };

  const handleInputBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div 
      ref={containerRef} 
      className="email-domain-suggest-container"
      style={{ position: 'relative', width: '100%' }}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="email"
        aria-autocomplete="list"
        aria-expanded={shouldShowDropdown}
        aria-controls={shouldShowDropdown ? listboxId : undefined}
        role="combobox"
        {...restProps}
      />

      {/* Domain Autocomplete Dropdown */}
      <AnimatePresence>
        {shouldShowDropdown && (
          <motion.ul
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 99,
              margin: 0,
              padding: '6px',
              listStyle: 'none',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              maxHeight: '210px',
              overflowY: 'auto'
            }}
          >
            {suggestions.map((domain, index) => {
              const isSelected = index === selectedIndex;
              const matchLen = domainPrefix.length;
              const typedPart = domain.slice(0, matchLen);
              const restPart = domain.slice(matchLen);

              return (
                <li
                  key={domain}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(domain);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    backgroundColor: isSelected 
                      ? 'color-mix(in srgb, var(--primary-blue) 12%, var(--bg-secondary))' 
                      : 'transparent',
                    color: isSelected ? 'var(--primary-blue)' : 'var(--text-primary)',
                    transition: 'background-color 0.12s ease, color 0.12s ease',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{username}@</span>
                    <strong style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{typedPart}</strong>
                    <span>{restPart}</span>
                  </span>
                  <span 
                    style={{ 
                      fontSize: '10.5px', 
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: 600
                    }}
                  >
                    Suggest
                  </span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Typo Correction Suggestion Badge */}
      {!shouldShowDropdown && typoSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          style={{
            marginTop: '4px',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>Did you mean</span>
          <button
            type="button"
            onClick={() => applyTypoFix(typoSuggestion)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--primary-blue)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          >
            {typoSuggestion}
          </button>
          <span>?</span>
        </motion.div>
      )}
    </div>
  );
}
