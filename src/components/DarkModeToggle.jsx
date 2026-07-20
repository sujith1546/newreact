import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const sunPath = "M 12 8 C 14.2 8 16 9.8 16 12 C 16 14.2 14.2 16 12 16 C 9.8 16 8 14.2 8 12 C 8 9.8 9.8 8 12 8 Z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41";
const moonPath = "M 12 3 C 16.97 3 21 7.03 21 12 C 21 16.97 16.97 21 12 21 C 14.5 17.5 16 14.5 16 12 C 16 9.5 14.5 6.5 12 3 Z M12 2v0 M12 20v0 M4.93 4.93l0 0 M17.66 17.66l0 0 M2 12h0 M20 12h0 M6.34 17.66l0 0 M19.07 4.93l0 0";

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <>
      <style>{`
        .theme-toggle-pill {
          position: fixed;
          top: 24px;
          right: 32px;
          width: 68px;
          height: 34px;
          border-radius: 17px;
          background: rgba(243, 244, 246, 0.85); /* Slightly off-white to stand out */
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px;
          cursor: pointer;
          z-index: 2000;
          transition: all 0.3s ease;
        }
        [data-theme="dark"] .theme-toggle-pill {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .theme-toggle-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        [data-theme="dark"] .theme-toggle-pill:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .theme-toggle-slider {
          position: absolute;
          width: 28px;
          height: 28px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1;
        }
        [data-theme="dark"] .theme-toggle-slider {
          background: #333333;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .slider-light {
          transform: translateX(0);
        }
        .slider-dark {
          transform: translateX(32px);
        }

        .theme-toggle-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          color: #9ca3af;
          transition: color 0.3s ease;
        }
        
        /* Light mode active icon (Sun) */
        .theme-toggle-pill:not([data-theme="dark"]) .theme-toggle-icon.active {
          color: var(--primary-blue);
        }
        
        /* Dark mode active icon (Moon) */
        [data-theme="dark"] .theme-toggle-pill .theme-toggle-icon.active {
          color: #eab308; /* Yellow 500 */
        }

        @media (max-width: 900px) {
          .theme-toggle-pill { top: 16px; right: 16px; }
        }

        .slider-icon-inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-blue);
          transition: color 0.4s ease;
        }
        [data-theme="dark"] .slider-icon-inner {
          color: #eab308;
        }
      `}</style>
      
      <div 
        className="theme-toggle-pill" 
        onClick={toggleTheme} 
        title="Toggle Theme"
        id="darkModeToggle"
      >
        <div className={`theme-toggle-slider ${theme === 'dark' ? 'slider-dark' : 'slider-light'}`}>
          <div className="slider-icon-inner">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease', transform: theme === 'dark' ? 'rotate(360deg)' : 'rotate(0deg)' }}>
              <motion.path
                initial={{ d: sunPath }}
                animate={{ d: theme === 'dark' ? moonPath : sunPath }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </svg>
          </div>
        </div>
        <div className={`theme-toggle-icon ${theme === 'light' ? 'active' : ''}`}>
          <Sun size={11} strokeWidth={2.5} />
        </div>
        <div className={`theme-toggle-icon ${theme === 'dark' ? 'active' : ''}`}>
          <Moon size={11} strokeWidth={2.5} />
        </div>
      </div>
    </>
  );
}
