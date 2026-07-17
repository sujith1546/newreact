import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

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
      `}</style>
      
      <div 
        className="theme-toggle-pill" 
        onClick={toggleTheme} 
        title="Toggle Theme"
        id="darkModeToggle"
      >
        <div className={`theme-toggle-slider ${theme === 'dark' ? 'slider-dark' : 'slider-light'}`}></div>
        <div className={`theme-toggle-icon ${theme === 'light' ? 'active' : ''}`}>
          <Sun size={15} strokeWidth={2.5} />
        </div>
        <div className={`theme-toggle-icon ${theme === 'dark' ? 'active' : ''}`}>
          <Moon size={15} strokeWidth={2.5} />
        </div>
      </div>
    </>
  );
}
