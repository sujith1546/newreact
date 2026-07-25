import React, { useState, useEffect } from 'react';
import DesktopAbout from './desktop/DesktopAbout';
import MobileAbout from './mobile/MobileAbout';

export default function About(props) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileAbout {...props} /> : <DesktopAbout {...props} />;
}
