import React, { useState, useEffect } from 'react';
import DesktopContact from './desktop/DesktopContact';
import MobileContact from './mobile/MobileContact';

export default function Contact(props) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileContact {...props} /> : <DesktopContact {...props} />;
}
