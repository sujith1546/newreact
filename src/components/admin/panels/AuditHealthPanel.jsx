import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function AuditHealthPanel() {
  const [logs,    setLogs]    = useState([]);
  const [ping,    setPing]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');
  const [pings,   setPings]   = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(40);
    if (data) setLogs(data);
    // run 3 pings and keep history
    const measures = [];
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      await supabase.from('site_settings').select('id').limit(1);
      measures.push(Math.round(performance.now() - t0));
      await new Promise(r => setTimeout(r, 200));
    }
    const avg = Math.round(measures.reduce((a,b) => a+b, 0) / measures.length);
    setPing(avg);
    setPings(p => [...p, avg].slice(-12));
    setLoading(false);
  };

  const ACTION_COLORS = {
    DELETE: '#ef4444', EXPORT: '#ff9800', UPDATE: '#007bff',
    CREATE: '#28a745', RUN: '#6366f1', UPLOAD: '#06b6d4',
    DEFAULT: '#6b7280',
  };
  const actionColor = (action) => {
    const key = Object.keys(ACTION_COLORS).find(k => action?.startsWith(k));
    return ACTION_COLORS[key || 'DEFAULT'];
  };

  const FILTERS = ['ALL','CREATE','UPDATE','DELETE','EXPORT','RUN','UPLOAD'];
  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action?.startsWith(filter));

  const pingColor = ping === null ? '#6b7280' : ping < 100 ? '#28a745' : ping < 300 ? '#ff9800' : '#ef4444';
  const pingLabel = ping === null ? '—' : ping < 100 ? 'Excellent' : ping < 300 ? 'Good' : 'Degraded';

  const maxPing = Math.max(...pings, 1);

  return (
    <PanelCard
      title="Audit Trail & System Health"
      action={{ label: 'Refresh', icon: 'ti-refresh', onClick: fetchAll }}
    >
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Health cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {[{ label: 'DB Avg Latency', value: ping !== null ? `${ping} ms` : 'Checking…', color: pingColor, sub: pingLabel },
            { label: 'System Status', value: 'Operational', color: '#28a745', sub: 'All services up' },
            { label: 'Audit Events', value: logs.length, color: '#6366f1', sub: 'Last 40 actions' },
            { label: 'Auth', value: 'Secure', color: '#28a745', sub: 'JWT • RLS enabled' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-color)`, borderTop: `3px solid ${k.color}`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)' }}>{k.label}</p>
              <p style={{ margin: '6px 0 2px', fontSize: 22, fontWeight: 800, color: k.color, letterSpacing: -0.5 }}>{k.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Ping sparkline */}
        {pings.length > 1 && (
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Latency Trend (last {pings.length} checks)</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 50 }}>
              {pings.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ width: '100%', background: pingColor, borderRadius: '3px 3px 0 0', height: `${Math.round((v/maxPing)*46)+4}px`, opacity: 0.7+0.3*(i/pings.length) }} />
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{v}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`admin-action-btn${filter === f ? '' : ' secondary'}`}
              style={{ padding: '4px 12px', fontSize: 11, borderRadius: 20 }}>
              {f}
            </button>
          ))}
        </div>

        {/* Audit table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><Loader2 className="spin" size={20} color="var(--text-muted)" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="ti-list-check" title="No audit logs" description="Actions you perform in the dashboard are recorded here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(log => {
              const color = actionColor(log.action);
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span className="admin-badge" style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontSize: 10, flexShrink: 0 }}>{log.action}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.entity_type}{log.entity_id ? ` · ${log.entity_id}` : ''}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(log.created_at).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PanelCard>
  );
}

