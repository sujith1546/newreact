import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'blue');
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('fontFamily') || 'modern');
  const [uiAudio, setUiAudio] = useState(localStorage.getItem('uiAudio') !== 'false');

  // Accent Colors dictionary
  const colors = {
    blue: '#007bff',
    purple: '#8b5cf6',
    emerald: '#10b981',
    rose: '#f43f5e'
  };

  // Fonts dictionary
  const fonts = {
    modern: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    developer: "'Fira Code', 'SFMono-Regular', Consolas, monospace"
  };

  // Sound Engine
  const playSound = () => {
    if (!uiAudio) return;
    try {
      // Tiny base64 "tick" sound
      const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD//wIA");
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch(e) {}
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--primary-blue', colors[accentColor]);
    root.style.setProperty('--app-font', fonts[fontFamily]);
    
    // Save preferences
    localStorage.setItem('theme', theme);
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('uiAudio', uiAudio);
  }, [theme, accentColor, fontFamily, uiAudio]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ 
      theme, toggleTheme, 
      accentColor, setAccentColor,
      fontFamily, setFontFamily,
      uiAudio, setUiAudio,
      playSound
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
