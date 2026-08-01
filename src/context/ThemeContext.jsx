import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

export const PRESETS = {
  'Presentation mode': { theme: 'light', fontFamily: 'modern', uiAudio: false, accentColor: 'blue' },
  'Night browsing':    { theme: 'dark',  fontFamily: 'modern', uiAudio: true,  accentColor: 'purple' },
  'Retro Terminal':    { theme: 'dark',  fontFamily: 'developer', uiAudio: true,  accentColor: 'emerald' }
};

const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key, val) => {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => safeStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(() => safeStorage.getItem('accentColor') || 'blue');
  const [fontFamily, setFontFamily] = useState(() => safeStorage.getItem('fontFamily') || 'modern');
  const [layoutDensity, setLayoutDensity] = useState(() => safeStorage.getItem('layoutDensity') || 'comfortable');
  const [uiAudio, setUiAudio] = useState(() => safeStorage.getItem('uiAudio') !== 'false');
  const [glassIntensity, setGlassIntensity] = useState(() => safeStorage.getItem('glassIntensity') || 'medium');
  const [reduceMotion, setReduceMotion] = useState(() => safeStorage.getItem('reduceMotion') === 'true');
  const [highContrast, setHighContrast] = useState(() => safeStorage.getItem('highContrast') === 'true');
  const [aiVoice, setAiVoice] = useState(() => safeStorage.getItem('aiVoice') !== 'false');
  const [aiAutoNav, setAiAutoNav] = useState(() => safeStorage.getItem('aiAutoNav') !== 'false');
  const [aiResponseStyle, setAiResponseStyle] = useState(() => safeStorage.getItem('aiResponseStyle') || 'balanced');
  const [aiShowThoughts, setAiShowThoughts] = useState(() => safeStorage.getItem('aiShowThoughts') !== 'false');
  
  // Advanced AI Features
  const [aiContextRange, setAiContextRange] = useState(() => safeStorage.getItem('aiContextRange') || 'global');
  const [aiReasoningDepth, setAiReasoningDepth] = useState(() => safeStorage.getItem('aiReasoningDepth') || 'lightning');
  const [aiPersona, setAiPersona] = useState(() => safeStorage.getItem('aiPersona') || 'professional');
  const [aiTerminalMode, setAiTerminalMode] = useState(() => safeStorage.getItem('aiTerminalMode') === 'true');

  // Advanced Accessibility
  const [keyboardHud, setKeyboardHud] = useState(() => safeStorage.getItem('keyboardHud') === 'true');
  
  // Tier 1 & 3 Advanced settings
  const [notifyOnContact, setNotifyOnContact] = useState(
    () => {
      try {
        const val = safeStorage.getItem('notifyOnContact');
        return val ? JSON.parse(val) : true;
      } catch (e) {
        return true;
      }
    }
  );
  const [photoAccent, setPhotoAccent] = useState(
    () => safeStorage.getItem('photoAccent') || null
  );
  const [activePreset, setActivePreset] = useState(
    () => safeStorage.getItem('activePreset') || null
  );
  const [devMode, setDevMode] = useState(
    () => safeStorage.getItem('devMode') === 'true'
  );
  const [showStateInspector, setShowStateInspector] = useState(false);
  const [flags, setFlags] = useState(() => {
    try {
      const raw = safeStorage.getItem('devFlags');
      return raw ? JSON.parse(raw) : {
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
    safeStorage.setItem('theme', theme);
    safeStorage.setItem('accentColor', accentColor);
    safeStorage.setItem('fontFamily', fontFamily);
    safeStorage.setItem('layoutDensity', layoutDensity);
    safeStorage.setItem('uiAudio', uiAudio);
    safeStorage.setItem('glassIntensity', glassIntensity);
    safeStorage.setItem('reduceMotion', String(reduceMotion));
    safeStorage.setItem('highContrast', String(highContrast));
    safeStorage.setItem('aiVoice', String(aiVoice));
    safeStorage.setItem('aiAutoNav', String(aiAutoNav));
    safeStorage.setItem('aiResponseStyle', aiResponseStyle);
    safeStorage.setItem('aiShowThoughts', String(aiShowThoughts));
    safeStorage.setItem('aiContextRange', aiContextRange);
    safeStorage.setItem('aiReasoningDepth', aiReasoningDepth);
    safeStorage.setItem('aiPersona', aiPersona);
    safeStorage.setItem('aiTerminalMode', String(aiTerminalMode));
    safeStorage.setItem('keyboardHud', String(keyboardHud));
    safeStorage.setItem('notifyOnContact', JSON.stringify(notifyOnContact));
    if (photoAccent) safeStorage.setItem('photoAccent', photoAccent);
    safeStorage.setItem('activePreset', activePreset || '');
    safeStorage.setItem('devMode', String(devMode));
    safeStorage.setItem('devFlags', JSON.stringify(flags));
  }, [theme, accentColor, fontFamily, layoutDensity, uiAudio, glassIntensity, reduceMotion, highContrast, aiVoice, aiAutoNav, aiResponseStyle, aiShowThoughts, aiContextRange, aiReasoningDepth, aiPersona, aiTerminalMode, keyboardHud, notifyOnContact, photoAccent, activePreset, devMode, flags]);

  const toggleTheme = (e) => {
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    // Determine coordinate of toggle animation (locked to Dynamic Island on desktop)
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    const isDesktop = window.innerWidth >= 768;

    if (isDesktop) {
      const dynamicIsland = document.getElementById('dynamic-island-container');
      if (dynamicIsland) {
        const rect = dynamicIsland.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else {
        x = window.innerWidth / 2;
        y = 28;
      }
    } else if (e && typeof e.clientX === 'number' && (e.clientX !== 0 || e.clientY !== 0)) {
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

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
      document.documentElement.setAttribute('data-theme', nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
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
