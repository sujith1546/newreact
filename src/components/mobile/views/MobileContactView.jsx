import React from 'react';
import ContactForm from '../../portfolio/contact/ContactForm';

export default function MobileContactView() {
  return (
    <div className="mobile-contact-view" style={{ width: '100%' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
          Get In Touch
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
          Send a direct message or connect via email & socials
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
