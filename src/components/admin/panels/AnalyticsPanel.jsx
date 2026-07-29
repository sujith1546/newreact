import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, TrendingUp, Sparkles } from 'lucide-react';
import { PanelCard } from '../shared/components';

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState([]);
  const [events, setEvents]       = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [anaRes, evRes, sessRes] = await Promise.all([
      supabase.from('portfolio_analytics').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('recruiter_events').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('visitor_sessions').select('*').order('created_at', { ascending: false }).limit(300),
    ]);
    if (!anaRes.error && anaRes.data) setAnalytics(anaRes.data);
    if (!evRes.error  && evRes.data)  setEvents(evRes.data);
    if (!sessRes.error && sessRes.data) setSessions(sessRes.data);
    setLoading(false);
  };

  /* ── Derived metrics ── */
  const pageCounts = analytics.reduce((acc, r) => {
    acc[r.page_path] = (acc[r.page_path] || 0) + 1;
    return acc;
  }, {});
  const sortedPages = Object.entries(pageCounts).sort((a,b) => b[1]-a[1]);
  const maxCount    = sortedPages[0]?.[1] || 1;

  // 14-day daily trend aggregation
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13-i));
    return d;
  });

  const trendData = days14.map((d) => {
    const ds = d.toDateString();
    const count = analytics.filter(r => new Date(r.created_at).toDateString() === ds).length;
    return { day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count };
  });
  const maxTrend = Math.max(...trendData.map(t => t.count), 1);

  // Referrer Breakdown
  const referrerCounts = (sessions.length > 0 ? sessions : analytics).reduce((acc, r) => {
    const b = r.referrer_bucket || (r.referrer?.includes('linkedin') ? 'linkedin' : r.referrer?.includes('github') ? 'github' : 'direct');
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <PanelCard title="Analytics Hub">
      <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div>
    </PanelCard>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PanelCard
        title="Analytics &amp; Visitor Intelligence"
        action={{ label: 'Refresh', icon: 'ti-refresh', onClick: fetchData }}
        headerElement={
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-primary)', borderRadius: 8, padding: 3, border: '1px solid var(--border-color)' }}>
            {['overview','referrers','pages','events'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--app-font)',
                background: tab === t ? 'var(--primary-blue)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        }
      >
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
            {[
              { label: 'Total Page Views', value: analytics.length, color: '#3b82f6' },
              { label: 'Recruiter Events', value: events.length, color: '#10b981' },
              { label: 'Unique Sessions', value: sessions.length || sortedPages.length, color: '#8b5cf6' },
              { label: 'Interactive Clicks', value: events.filter(e => e.event_type?.includes('DOWNLOAD') || e.event_type?.includes('CLICK')).length, color: '#f59e0b' },
            ].map(k => (
              <div key={k.label} style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-color)`, borderTop: `3px solid ${k.color}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>{k.label}</p>
                <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: k.color, letterSpacing: -1 }}>{k.value}</p>
              </div>
            ))}
          </div>

          {tab === 'overview' && (
            <>
              {/* 14-Day Historical Trend Bar Chart */}
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={15} color="var(--primary-blue)" />
                    14-Day Traffic Trend
                  </p>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Anonymized daily volume</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
                  {trendData.map((td) => (
                    <div key={td.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--primary-blue)', fontWeight: 700 }}>{td.count || ''}</span>
                      <div style={{
                        width: '100%', background: 'linear-gradient(to top, var(--primary-blue), #6366f1)',
                        height: `${Math.round((td.count/maxTrend)*85)+4}px`,
                        borderRadius: '4px 4px 0 0', opacity: td.count === 0 ? 0.18 : 0.9,
                        transition: 'height 0.5s ease',
                      }} />
                      <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 600 }}>{td.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div>
                <p style={{ margin: '0 0 12px', fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Visitor Activity Feed</p>
                {analytics.slice(0, 8).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--primary-blue) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="ti ti-eye" style={{ fontSize: 14, color: 'var(--primary-blue)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.page_path || '/'}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{r.referrer || 'Direct'} · {r.device_type || 'Desktop'}</p>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
                {analytics.length === 0 && <div className="admin-empty" style={{ padding: '30px 0' }}><p>No page views recorded yet.</p></div>}
              </div>
            </>
          )}

          {tab === 'referrers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>Referrer Traffic Breakdown</p>
              {Object.entries(referrerCounts).map(([source, count]) => {
                const total = analytics.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={source} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{source}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{count} visits ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary-blue)', borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'pages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>Top Visited Pages</p>
              {sortedPages.map(([path, count]) => (
                <div key={path}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12.5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{path}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{count} visit{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((count/maxCount)*100)}%`, height: '100%', background: 'var(--primary-blue)', borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>Recruiter Event Feed</p>
              {events.map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={15} color="#10b981" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.event_type}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{ev.event_detail || '—'}</p>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(ev.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </PanelCard>
    </div>
  );
}
