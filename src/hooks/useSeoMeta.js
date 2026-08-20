import { useEffect } from 'react';
import useRealtimeData from './useRealtimeData';

/**
 * useSeoMeta
 * Dynamically updates document.title and OpenGraph / Twitter / SEO meta tags
 * in real-time based on site_settings from Supabase.
 */
export function useSeoMeta() {
  const { data: settings } = useRealtimeData('site_settings', {
    single: true,
    filter: { column: 'id', value: 1 },
  });

  useEffect(() => {
    if (typeof document === 'undefined' || !settings) return;

    const title = settings.seo_title || settings.site_title || 'Sujith Thota | Portfolio';
    const description = settings.seo_description || settings.site_description || 'Data Science Specialist & Full-Stack Developer';
    const keywords = settings.seo_keywords || 'Sujith Thota, Full-Stack Developer, Data Scientist, React, Python, Machine Learning, Portfolio';
    const ogImage = settings.seo_og_image || settings.og_image_url || 'https://sujiththota.dev/og-preview.png';
    const twitterHandle = settings.seo_twitter_handle || '@sujith_thota';
    const canonicalUrl = settings.seo_canonical || (typeof window !== 'undefined' ? window.location.origin : 'https://sujiththota.dev');
    const authorName = settings.owner_name || 'Sujith Thota';

    // 1. Update Title
    if (title && document.title !== title) {
      document.title = title;
    }

    // Helper to set or create meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set link tag (e.g. canonical)
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Standard SEO Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'author', authorName);

    // 3. OpenGraph / Facebook / LinkedIn
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'Sujith Thota Portfolio');

    // 4. Twitter / X Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:creator', twitterHandle);

    // 5. Canonical Link
    setLinkTag('canonical', canonicalUrl);

  }, [settings]);

  return settings;
}

export default useSeoMeta;
