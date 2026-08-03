import { supabase } from './supabaseClient';

/**
 * Quietly record page views for portfolio analytics
 * @param {string} pagePath - Current route path (e.g. '/projects', '/about')
 */
export async function trackPageView(pagePath) {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const referrer = document.referrer || 'Direct';
    const userAgent = navigator.userAgent || 'Unknown';
    
    await supabase.from('portfolio_analytics').insert([{
      page_path: pagePath,
      referrer: referrer.substring(0, 500),
      user_agent: userAgent.substring(0, 500),
      country_code: 'US',
      created_at: new Date().toISOString()
    }]).catch(() => {});
  } catch (e) {
    // Silent catch for smooth UX
  }
}

/**
 * Record key recruiter engagement events
 * @param {string} eventType - 'resume_download', 'contact_click', 'project_demo', 'bot_chat'
 * @param {string} eventDetail - Description e.g. 'Downloaded PDF Resume'
 */
export async function trackRecruiterEvent(eventType, eventDetail = '') {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    await supabase.from('recruiter_events').insert([{
      event_type: eventType,
      event_detail: eventDetail,
      created_at: new Date().toISOString()
    }]).catch(() => {});
  } catch (e) {
    // Silent catch for smooth UX
  }
}
