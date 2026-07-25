import React, { useState, useEffect } from 'react';
import DesktopCertifications from './desktop/DesktopCertifications';
import MobileCertifications from './mobile/MobileCertifications';

export default function Certifications(props) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileCertifications {...props} /> : <DesktopCertifications {...props} />;
}
