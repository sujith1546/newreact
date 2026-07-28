import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <style>{`
        .theme-toggle-pill {
          position: relative;
          width: 62px;
          height: 32px;
          border-radius: 999px;
          background: rgba(243, 244, 246, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px;
          cursor: pointer;
          z-index: 2000;
          transition: all 0.3s ease;
          user-select: none;
        }

        [data-theme="dark"] .theme-toggle-pill {
          background: rgba(30, 30, 30, 0.65);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
        }

        .theme-toggle-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        [data-theme="dark"] .theme-toggle-pill:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
        }

        .theme-toggle-track-icon {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          color: #9ca3af;
          transition: opacity 0.3s ease;
        }

        .theme-toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease;
        }

        [data-theme="dark"] .theme-toggle-knob {
          transform: translateX(30px);
          background: #262626;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <div 
        className="theme-toggle-pill" 
        onClick={toggleTheme} 
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle dark mode"
        id="darkModeToggle"
      >
        {/* Track icons (subtle visual cues on left & right) */}
        <div className="theme-toggle-track-icon" style={{ opacity: isDark ? 0.35 : 0 }}>
          <Sun size={12} strokeWidth={2.2} />
        </div>
        <div className="theme-toggle-track-icon" style={{ opacity: isDark ? 0 : 0.35 }}>
          <Moon size={12} strokeWidth={2.2} />
        </div>

        {/* Sliding Knob containing active icon with scale/rotate transition */}
        <div className="theme-toggle-knob">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.4, rotate: 90, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}
              >
                <Moon size={13} strokeWidth={2.5} fill="#eab308" fillOpacity={0.25} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ scale: 0.4, rotate: 90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.4, rotate: -90, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}
              >
                <Sun size={13} strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
