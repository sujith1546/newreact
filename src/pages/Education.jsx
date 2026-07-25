import React, { useState, useEffect } from 'react';
import DesktopEducation from './desktop/DesktopEducation';
import MobileEducationView from '../components/mobile/views/MobileEducationView';

export default function Education(props) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileEducationView {...props} /> : <DesktopEducation {...props} />;
}
