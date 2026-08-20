import React from 'react';
import { Helmet } from 'react-helmet-async';
import useRealtimeData from '../../hooks/useRealtimeData';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://sujith-thota.vercel.app';

const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Sujith Thota",
  "alternateName": "Thota Sujith Reddy",
  "jobTitle": "Full Stack Developer & Data Scientist",
  "description": "B.Tech CSE (Data Science) graduate from VIT University (8.7 CGPA). Passionate about ML, Neural Networks & building seamless web experiences.",
  "url": BASE_URL,
  "image": `${BASE_URL}/profile_photo.png`,
  "email": "sujithreddy1546@gmail.com",
  "sameAs": [
    "https://github.com/sujith1546",
    "https://linkedin.com/in/sujith-thota"
  ],
  "alumniOf": {
    "@type": "CollegeOrUniversity",
    "name": "VIT University",
    "address": { "@type": "PostalAddress", "addressLocality": "Vellore", "addressCountry": "IN" }
  },
  "knowsAbout": ["Machine Learning", "React", "Python", "Data Science", "Full Stack Development", "Neural Networks"],
  "nationality": "Indian"
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Sujith Thota | Portfolio",
  "url": BASE_URL,
  "description": "Professional portfolio of Sujith Thota — Full Stack Developer & Data Scientist",
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": `${BASE_URL}/projects?q={search_term_string}` },
    "query-input": "required name=search_term_string"
  }
};

function getBreadcrumbs(pathname) {
  const clean = pathname.replace(/^\//, '') || 'home';
  const labels = {
    home: 'Home', about: 'About', skills: 'Skills', projects: 'Projects',
    education: 'Education', experience: 'Experience',
    certifications: 'Certifications', contact: 'Contact'
  };
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      ...(clean !== 'home' ? [{ "@type": "ListItem", "position": 2, "name": labels[clean] || clean, "item": `${BASE_URL}/${clean}` }] : [])
    ]
  };
}

export default function SEOHelmet() {
  const { data: dbSettings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const location = useLocation();
  
  const title = dbSettings?.seo_title || 'Sujith Thota | Portfolio';
  const description = dbSettings?.seo_description || PERSON_SCHEMA.description;
  const ogImage = dbSettings?.seo_og_image || `${BASE_URL}/profile_photo.png`;
  const keywords = dbSettings?.seo_keywords || 'Sujith Thota, Full-Stack Developer, Data Scientist, Machine Learning, React, Python, Portfolio';
  const twitterHandle = dbSettings?.seo_twitter_handle || '@sujith_thota';
  const canonicalUrl = dbSettings?.seo_canonical || `${BASE_URL}${location.pathname}`;

  return (
    <Helmet>
      {/* Basic */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={dbSettings?.owner_name || 'Sujith Thota'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Sujith Thota Portfolio" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(PERSON_SCHEMA)}</script>
      <script type="application/ld+json">{JSON.stringify(WEBSITE_SCHEMA)}</script>
      <script type="application/ld+json">{JSON.stringify(getBreadcrumbs(location.pathname))}</script>
    </Helmet>
  );
}
