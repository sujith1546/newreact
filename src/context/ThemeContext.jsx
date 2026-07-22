import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const PRESETS = {
  'Presentation mode': { theme: 'light', fontFamily: 'modern', uiAudio: false, accentColor: 'blue' },
  'Night browsing':    { theme: 'dark',  fontFamily: 'modern', uiAudio: true,  accentColor: 'purple' },
  'Retro Terminal':    { theme: 'dark',  fontFamily: 'developer', uiAudio: true,  accentColor: 'emerald' }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'blue');
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('fontFamily') || 'modern');
  const [layoutDensity, setLayoutDensity] = useState(localStorage.getItem('layoutDensity') || 'comfortable');
  const [uiAudio, setUiAudio] = useState(localStorage.getItem('uiAudio') !== 'false');
  const [glassIntensity, setGlassIntensity] = useState(localStorage.getItem('glassIntensity') || 'medium');
  const [reduceMotion, setReduceMotion] = useState(localStorage.getItem('reduceMotion') === 'true');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('highContrast') === 'true');
  const [aiVoice, setAiVoice] = useState(localStorage.getItem('aiVoice') !== 'false');
  const [aiAutoNav, setAiAutoNav] = useState(localStorage.getItem('aiAutoNav') !== 'false');
  const [aiResponseStyle, setAiResponseStyle] = useState(localStorage.getItem('aiResponseStyle') || 'balanced');
  const [aiShowThoughts, setAiShowThoughts] = useState(localStorage.getItem('aiShowThoughts') !== 'false');
  
  // Advanced AI Features
  const [aiContextRange, setAiContextRange] = useState(localStorage.getItem('aiContextRange') || 'global');
  const [aiReasoningDepth, setAiReasoningDepth] = useState(localStorage.getItem('aiReasoningDepth') || 'lightning');
  const [aiPersona, setAiPersona] = useState(localStorage.getItem('aiPersona') || 'professional');
  const [aiTerminalMode, setAiTerminalMode] = useState(localStorage.getItem('aiTerminalMode') === 'true');

  // Advanced Accessibility
  const [keyboardHud, setKeyboardHud] = useState(localStorage.getItem('keyboardHud') === 'true');
  
  // Tier 1 & 3 Advanced settings
  const [notifyOnContact, setNotifyOnContact] = useState(
    () => JSON.parse(localStorage.getItem('notifyOnContact') ?? 'true')
  );
  const [photoAccent, setPhotoAccent] = useState(
    () => localStorage.getItem('photoAccent') || null
  );
  const [activePreset, setActivePreset] = useState(
    () => localStorage.getItem('activePreset') || null
  );
  const [devMode, setDevMode] = useState(
    () => localStorage.getItem('devMode') === 'true'
  );
  const [showStateInspector, setShowStateInspector] = useState(false);
  const [flags, setFlags] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('devFlags')) || {
        showFPSCounter: false,
        verboseConsoleLogs: false,
        experimentalChatbotUI: false,
      };
    } catch {
      return {
        showFPSCounter: false,
        verboseConsoleLogs: false,
        experimentalChatbotUI: false,
      };
    }
  });

  // Accent Colors dictionary
  const colors = {
    blue:    '#3b82f6',
    purple:  '#8b5cf6',
    emerald: '#10b981',
    rose:    '#f43f5e',
    amber:   '#f59e0b',
    cyan:    '#06b6d4',
  };

  // Fonts dictionary
  const fonts = {
    modern: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    developer: "'Fira Code', 'SFMono-Regular', Consolas, monospace",
    classic: "'Playfair Display', 'Merriweather', Georgia, serif"
  };

  // Sound Engine
  const playSound = () => {
    if (!uiAudio) return;
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD//wIA");
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch(e) {}
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Check if the current accentColor is in the default dict or is a dynamic photo color
    const hexColor = colors[accentColor] || accentColor;
    root.style.setProperty('--primary-blue', hexColor);
    root.style.setProperty('--app-font', fonts[fontFamily]);
    
    // Apply CSS variables for glass intensity and contrast
    const blurMap = { light: '4px', medium: '12px', heavy: '24px' };
    root.style.setProperty('--glass-blur', blurMap[glassIntensity] || '12px');
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Apply CSS variables for layout density
    root.setAttribute('data-density', layoutDensity);
    
    // Apply accessibility flags
    if (keyboardHud) root.setAttribute('data-hud', 'true');
    else root.removeAttribute('data-hud');
    
    root.style.setProperty('--app-font', fonts[fontFamily]);
    
    // Save preferences
    localStorage.setItem('theme', theme);
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('layoutDensity', layoutDensity);
    localStorage.setItem('uiAudio', uiAudio);
    localStorage.setItem('glassIntensity', glassIntensity);
    localStorage.setItem('reduceMotion', String(reduceMotion));
    localStorage.setItem('highContrast', String(highContrast));
    localStorage.setItem('aiVoice', String(aiVoice));
    localStorage.setItem('aiAutoNav', String(aiAutoNav));
    localStorage.setItem('aiResponseStyle', aiResponseStyle);
    localStorage.setItem('aiShowThoughts', String(aiShowThoughts));
    localStorage.setItem('aiContextRange', aiContextRange);
    localStorage.setItem('aiReasoningDepth', aiReasoningDepth);
    localStorage.setItem('aiPersona', aiPersona);
    localStorage.setItem('aiTerminalMode', String(aiTerminalMode));
    localStorage.setItem('keyboardHud', String(keyboardHud));
    localStorage.setItem('notifyOnContact', JSON.stringify(notifyOnContact));
    if (photoAccent) localStorage.setItem('photoAccent', photoAccent);
    localStorage.setItem('activePreset', activePreset || '');
    localStorage.setItem('devMode', String(devMode));
    localStorage.setItem('devFlags', JSON.stringify(flags));
  }, [theme, accentColor, fontFamily, layoutDensity, uiAudio, glassIntensity, reduceMotion, highContrast, aiVoice, aiAutoNav, aiResponseStyle, aiShowThoughts, aiContextRange, aiReasoningDepth, aiPersona, aiTerminalMode, keyboardHud, notifyOnContact, photoAccent, activePreset, devMode, flags]);

  const toggleTheme = (e) => {
    const isDark = theme === 'dark';
    
    if (!document.startViewTransition) {
      setTheme(t => t === 'dark' ? 'light' : 'dark');
      return;
    }

    // Determine coordinate of toggle click
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    if (e && typeof e.clientX === 'number') {
      x = e.clientX;
      y = e.clientY;
    } else {
      const btn = document.getElementById('darkModeToggle') || document.querySelector('.theme-toggle-pill');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(isDark ? 'light' : 'dark');
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      
      document.documentElement.animate(
        {
          clipPath: isDark 
            ? [`circle(${endRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`]
            : [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: isDark 
            ? '::view-transition-old(root)' 
            : '::view-transition-new(root)'
        }
      );
    });
  };

  // Serialization helpers
  const getAllPrefs = () => ({
    theme,
    accentColor,
    fontFamily,
    uiAudio,
    pageTransition,
    notifyOnContact,
    photoAccent,
    devMode,
    flags
  });

  const applyAllPrefs = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if ('theme' in obj) setTheme(obj.theme);
    if ('accentColor' in obj) setAccentColor(obj.accentColor);
    if ('fontFamily' in obj) setFontFamily(obj.fontFamily);
    if ('layoutDensity' in obj) setLayoutDensity(obj.layoutDensity);
    if ('uiAudio' in obj) setUiAudio(obj.uiAudio);
    if ('keyboardHud' in obj) setKeyboardHud(obj.keyboardHud);
    if ('notifyOnContact' in obj) setNotifyOnContact(obj.notifyOnContact);
    if ('photoAccent' in obj) setPhotoAccent(obj.photoAccent);
    if ('devMode' in obj) setDevMode(obj.devMode);
    if ('flags' in obj) setFlags(obj.flags);
  };

  const applyPreset = (name) => {
    const preset = PRESETS[name];
    if (!preset) return;
    setTheme(preset.theme);
    setFontFamily(preset.fontFamily);
    setUiAudio(preset.uiAudio);
    setAccentColor(preset.accentColor);
    setActivePreset(name);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, toggleTheme, 
      accentColor, setAccentColor,
      fontFamily, setFontFamily,
      layoutDensity, setLayoutDensity,
      uiAudio, setUiAudio,
      glassIntensity, setGlassIntensity,
      reduceMotion, setReduceMotion,
      highContrast, setHighContrast,
      aiVoice, setAiVoice,
      aiAutoNav, setAiAutoNav,
      aiResponseStyle, setAiResponseStyle,
      aiShowThoughts, setAiShowThoughts,
      aiContextRange, setAiContextRange,
      aiReasoningDepth, setAiReasoningDepth,
      aiPersona, setAiPersona,
      aiTerminalMode, setAiTerminalMode,
      keyboardHud, setKeyboardHud,
      playSound,
      notifyOnContact, setNotifyOnContact,
      photoAccent, setPhotoAccent,
      activePreset, setActivePreset,
      devMode, setDevMode,
      showStateInspector, setShowStateInspector,
      flags, setFlags,
      getAllPrefs, applyAllPrefs,
      applyPreset
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
