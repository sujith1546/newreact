import React, { useState } from 'react';
import { Plus, X, FileText, Mail } from 'lucide-react';

const FAB_STYLES = `
.fab-container {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 12px;
  z-index: 100;
}
.fab-main {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-blue);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  outline: none;
}
.fab-main.open {
  transform: rotate(45deg);
  background: var(--text-primary);
}
.fab-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(20px) scale(0.8);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fab-actions.show {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}
.fab-action {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}
.fab-action:hover {
  transform: scale(1.1);
}
`;

export default function FAB({ onNavClick, triggerResume }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);

  return (
    <div className="fab-container">
      <style>{FAB_STYLES}</style>
      <button className={`fab-main ${open ? 'open' : ''}`} onClick={toggle} aria-label="Quick actions">
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>

      <div className={`fab-actions ${open ? 'show' : ''}`}>
        <button className="fab-action" onClick={triggerResume} aria-label="Resume">
          <FileText size={20} />
        </button>
        <button className="fab-action" onClick={() => onNavClick?.('contact')} aria-label="Contact">
          <Mail size={20} />
        </button>
      </div>
    </div>
  );
}
