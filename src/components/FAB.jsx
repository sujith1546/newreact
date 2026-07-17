import React, { useState } from 'react';
import { Plus, X, FileText, Mail } from 'lucide-react';

export default function FAB({ onNavClick, triggerResume }) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  return (
    <div className="fab-container">
      {/* Main button */}
      <button className={`fab-main ${open ? 'open' : ''}`} onClick={toggle} aria-label="Quick actions">
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>

      {/* Action buttons */}
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
