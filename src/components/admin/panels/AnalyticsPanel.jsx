import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Globe, Sparkles } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';
import GlobeLocator from '../../widgets/GlobeLocator';

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState([]);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('overview');
  const [visitorMarkers, setVisitorMarkers] = useState([]);

  useEffect(() => {
    fetchData();

    // Setup Supabase Realtime presence for Visitor Globe
    const existingChannel = supabase.getChannels().find(c => c.topic === 'realtime:visitor_presence' || c.topic === 'visitor_presence');
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase.channel('visitor_presence');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const markers = [];
        for (const id in state) {
          state[id].forEach((presence) => {
            if (presence.lat && presence.lng) {
              markers.push({ location: [presence.lat, presence.lng], size: 0.1 });
            }
          });
        }
        setVisitorMarkers(markers);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [anaRes, evRes] = await Promise.all([
      supabase.from('portfolio_analytics').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('recruiter_events').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (!anaRes.error && anaRes.data) setAnalytics(anaRes.data);
    if (!evRes.error  && evRes.data)  setEvents(evRes.data);
    setLoading(false);
  };

  /* ── derived metrics ── */
  const pageCounts = analytics.reduce((acc, r) => {
    acc[r.page_path] = (acc[r.page_path] || 0) + 1;
    return acc;
  }, {});
  const sortedPages = Object.entries(pageCounts).sort((a,b) => b[1]-a[1]);
  const maxCount    = sortedPages[0]?.[1] || 1;

  // daily visits last 7 days
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
  const dayCounts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    const ds = d.toDateString();
    return analytics.filter(r => new Date(r.created_at).toDateString() === ds).length;
  });
  const maxDay = Math.max(...dayCounts, 1);

  if (loading) return (
    <PanelCard title="Analytics Hub">
      <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div>
    </PanelCard>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 3D Real-time Visitor Globe Widget with automatic WebGL teardown on unmount */}
      <div style={{ padding: '20px', background: 'var(--card-bg, var(--bg-secondary))', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: 0 }}>
            <Globe size={18} color="var(--primary-blue)" />
            Live Visitor Map
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', margin: 0 }}>
            Real-time 3D visualization of active visitors browsing your portfolio across the globe.
            Active users: <span style={{ color: '#10b981', fontWeight: 600 }}>{visitorMarkers.length}</span>
          </p>
        </div>
        <div style={{ width: '140px', height: '140px', flexShrink: 0 }}>
          <VisitorGlobe markers={visitorMarkers} />
        </div>
      </div>

      <PanelCard
        title="Analytics Hub"
        action={{ label: 'Refresh', icon: 'ti-refresh', onClick: fetchData }}
        headerElement={
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-primary)', borderRadius: 8, padding: 3, border: '1px solid var(--border-color)' }}>
            {['overview','pages','events'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--app-font)',
                background: tab === t ? 'var(--primary-blue)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-muted)',
              }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        }
      >
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
            {[{ label: 'Total Views', value: analytics.length, color: '#007bff' },
              { label: 'Recruiter Events', value: events.length, color: '#28a745' },
              { label: 'Unique Pages', value: sortedPages.length, color: '#6366f1' },
              { label: 'Downloads/Clicks', value: events.filter(e => e.event_type?.includes('DOWNLOAD') || e.event_type?.includes('CLICK')).length, color: '#ff9800' },
            ].map(k => (
              <div key={k.label} style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-color)`, borderTop: `3px solid ${k.color}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>{k.label}</p>
                <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: k.color, letterSpacing: -1 }}>{k.value}</p>
              </div>
            ))}
          </div>

          {tab === 'overview' && (
            <>
              {/* 7-day bar chart */}
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Daily Visitors — Last 7 Days</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                  {dayLabels.map((day, i) => (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--primary-blue)', fontWeight: 700 }}>{dayCounts[i] || ''}</span>
                      <div style={{
                        width: '100%', background: `var(--primary-blue)`,
                        height: `${Math.round((dayCounts[i]/maxDay)*80)+4}px`,
                        borderRadius: '4px 4px 0 0', opacity: dayCounts[i] === 0 ? 0.15 : 0.85,
                        transition: 'height 0.6s ease',
                      }} />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity Feed</p>
                {analytics.slice(0,8).map((r,i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#007bff18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="ti ti-eye" style={{ fontSize: 14, color: '#007bff' }} />
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

          {tab === 'pages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Top Visited Pages</p>
              {sortedPages.length === 0 && <div className="admin-empty" style={{ padding: '30px 0' }}><p>No data yet.</p></div>}
              {sortedPages.map(([path, count]) => (
                <div key={path}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{path}</span>
                    <span style={{ fontWeight: 700, color: '#007bff' }}>{count} visit{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((count/maxCount)*100)}%`, height: '100%', background: '#007bff', borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Recruiter Event Feed</p>
              {events.length === 0 && <div className="admin-empty" style={{ padding: '30px 0' }}><p>No recruiter events logged yet.</p></div>}
              {events.map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#28a74518', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={15} color="#28a745" />
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
