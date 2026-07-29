import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Coarse Country/Region Centroid Mapping (Privacy Preserving)
const COUNTRY_CENTROIDS = {
  IN: { name: 'India', lat: 20.5937, lng: 78.9629, region: 'Asia-South' },
  US: { name: 'United States', lat: 37.0902, lng: -95.7129, region: 'North America' },
  GB: { name: 'United Kingdom', lat: 55.3781, lng: -3.436, region: 'Europe-West' },
  CA: { name: 'Canada', lat: 56.1304, lng: -106.3468, region: 'North America' },
  DE: { name: 'Germany', lat: 51.1657, lng: 10.4515, region: 'Europe-Central' },
  FR: { name: 'France', lat: 46.2276, lng: 2.2137, region: 'Europe-West' },
  AU: { name: 'Australia', lat: -25.2744, lng: 133.7751, region: 'Oceania' },
  JP: { name: 'Japan', lat: 36.2048, lng: 138.2529, region: 'Asia-East' },
  SG: { name: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'Asia-Southeast' },
  BR: { name: 'Brazil', lat: -14.235, lng: -51.9253, region: 'South America' },
  AE: { name: 'UAE', lat: 23.4241, lng: 53.8478, region: 'Middle East' },
  NL: { name: 'Netherlands', lat: 52.1326, lng: 5.2913, region: 'Europe-West' },
  DEFAULT: { name: 'Global', lat: 20.0, lng: 0.0, region: 'Unknown' },
};

function classifyReferrer(refUrl) {
  if (!refUrl || refUrl === '' || refUrl === 'direct') return 'direct';
  const urlLower = refUrl.toLowerCase();
  if (urlLower.includes('linkedin') || urlLower.includes('lnkd.in')) return 'linkedin';
  if (urlLower.includes('github') || urlLower.includes('github.io')) return 'github';
  if (urlLower.includes('google') || urlLower.includes('bing') || urlLower.includes('duckduckgo') || urlLower.includes('yahoo')) return 'organic';
  return 'other';
}

function detectDevice(ua) {
  if (!ua) return 'desktop';
  return /mobile|android|iphone|ipad|tablet/i.test(ua) ? 'mobile' : 'desktop';
}

function isBotUserAgent(ua, secFetchMode) {
  if (!ua) return true;
  const botPattern = /bot|crawler|spider|lighthouse|bytespider|googlebot|bingbot|yandex|duckduckbot|slurp|facebookexternalhit/i;
  if (botPattern.test(ua)) return true;
  if (secFetchMode === 'websocket' || secFetchMode === 'cors' || secFetchMode === 'navigate') return false;
  return false;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    const userAgent = req.headers['user-agent'] || '';
    const secFetchMode = req.headers['sec-fetch-mode'] || '';
    const rawReferrer = req.headers['referer'] || req.headers['referrer'] || req.query?.ref || '';

    // Server-side Bot Check
    const botDetected = isBotUserAgent(userAgent, secFetchMode);
    if (botDetected) {
      return res.status(200).json({ success: true, isBot: true, message: 'Bot traffic filtered' });
    }

    // Extract IP safely from trusted edge headers
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
    const countryCode = (req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || 'IN').toUpperCase();

    // 24h Rotating Hash Salt
    const dateStr = new Date().toISOString().split('T')[0];
    const hashSalt = process.env.SESSION_HASH_SALT || 'portfolio_salt_2026';
    const sessionHash = crypto
      .createHash('sha256')
      .update(`${ip}_${dateStr}_${hashSalt}`)
      .digest('hex')
      .substring(0, 16);

    const geoData = COUNTRY_CENTROIDS[countryCode] || COUNTRY_CENTROIDS.DEFAULT;
    const referrerBucket = classifyReferrer(rawReferrer);
    const deviceType = detectDevice(userAgent);

    // Optional Supabase Insertion
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('visitor_sessions').upsert({
        session_hash: sessionHash,
        country: geoData.name,
        region: geoData.region,
        centroid_lat: geoData.lat,
        centroid_lng: geoData.lng,
        referrer_bucket: referrerBucket,
        device_type: deviceType,
        created_at: new Date().toISOString(),
      }, { onConflict: 'session_hash' }).catch(() => {});
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      sessionHash,
      country: geoData.name,
      region: geoData.region,
      lat: geoData.lat,
      lng: geoData.lng,
      referrerBucket,
      deviceType,
      isBot: false,
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      country: 'India',
      region: 'Asia-South',
      lat: 20.5937,
      lng: 78.9629,
      referrerBucket: 'direct',
      deviceType: 'desktop',
      isBot: false,
    });
  }
}
