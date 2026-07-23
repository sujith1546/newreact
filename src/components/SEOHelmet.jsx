import React from 'react';
import { Helmet } from 'react-helmet-async';
import useRealtimeData from '../hooks/useRealtimeData';

export default function SEOHelmet() {
  const { data: dbSettings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  
  if (!dbSettings) return null;

  return (
    <Helmet>
      {dbSettings.seo_title && <title>{dbSettings.seo_title}</title>}
      {dbSettings.seo_description && <meta name="description" content={dbSettings.seo_description} />}
      
      {/* OpenGraph / Social Meta Tags */}
      {dbSettings.seo_title && <meta property="og:title" content={dbSettings.seo_title} />}
      {dbSettings.seo_description && <meta property="og:description" content={dbSettings.seo_description} />}
      {dbSettings.seo_og_image && <meta property="og:image" content={dbSettings.seo_og_image} />}
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      {dbSettings.seo_title && <meta name="twitter:title" content={dbSettings.seo_title} />}
      {dbSettings.seo_description && <meta name="twitter:description" content={dbSettings.seo_description} />}
      {dbSettings.seo_og_image && <meta name="twitter:image" content={dbSettings.seo_og_image} />}
    </Helmet>
  );
}
