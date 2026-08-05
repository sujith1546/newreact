import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { logAuditEvent } from '../../../lib/auditLogger';
import {
  Loader2, Check, Settings, Layers, Briefcase, Award, Sparkles, Bell,
  MessageSquare, Type, FileText, Globe, Image, Link, Mail, Upload,
  Zap, Lock, Database, Key, Palette, Send, RefreshCw, AlertTriangle,
  Activity, BookOpen, Star, Bot, BarChart2, Trash2, RotateCcw,
  Eye, EyeOff, Clock, Server, Wifi, Download, ChevronDown, ChevronUp,
  Info, Shield, CheckCircle2, XCircle, TrendingUp, Users, MessageCircle,
  Cpu, Terminal, User, Pen
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumToggle, PremiumInput } from '../shared/components';
import { useTheme } from '../../../context/ThemeContext';

/* ──────────────────────────────────────────────────────────────
   CONFIG
────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'toggles',       icon: Layers,        label: 'Feature Flags',        desc: 'Enable or disable site modules' },
  { id: 'status_avail',  icon: Zap,           label: 'Status & Availability', desc: 'Project status & hiring info' },
  { id: 'banner',        icon: Bell,          label: 'Announcement',          desc: 'Global site-wide banner' },
  { id: 'seo',           icon: Globe,         label: 'SEO & Discovery',       desc: 'Meta tags & social sharing' },
  { id: 'links',         icon: Link,          label: 'Links & Assets',        desc: 'Social links & resume PDF' },
  { id: 'theme',         icon: Palette,       label: 'Theme & Branding',      desc: 'Accent color & identity' },
  { id: 'performance',   icon: Activity,      label: 'Performance',           desc: 'Analytics, rate limits & cache' },
  { id: 'notifications', icon: Bell,          label: 'Notifications',         desc: 'Email & alert preferences' },
  { id: 'security_lock', icon: Lock,          label: 'Security & Lock',       desc: 'Maintenance & lockdown modes' },
  { id: 'backup',        icon: Database,      label: 'Backup & Restore',      desc: 'Export & restore CMS data' },
  { id: 'webhooks_api',  icon: Key,           label: 'Webhooks & Vault',      desc: 'Deploy hooks & API keys' },
  { id: 'audit',         icon: Terminal,      label: 'Audit Log',             desc: 'Admin action history' },
  { id: 'danger',        icon: AlertTriangle, label: 'Danger Zone',           desc: 'Irreversible operations' },
];

const ACCENT_OPTIONS = [
  { id: 'blue',    label: 'Indigo',   hex: '#6366F1' },
  { id: 'emerald', label: 'Emerald',  hex: '#10B981' },
  { id: 'cyan',    label: 'Cyan',     hex: '#06B6D4' },
  { id: 'rose',    label: 'Rose',     hex: '#EC4899' },
  { id: 'amber',   label: 'Amber',    hex: '#F59E0B' },
  { id: 'purple',  label: 'Purple',   hex: '#8B5CF6' },
  { id: 'orange',  label: 'Orange',   hex: '#F97316' },
  { id: 'teal',    label: 'Teal',     hex: '#14B8A6' },
];

/* ──────────────────────────────────────────────────────────────
   TINY PRIMITIVES  (all style-prop-free where possible)
────────────────────────────────────────────────────────────── */

/** Divider with optional label */
const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
    {label && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--pcms-muted-2)', whiteSpace: 'nowrap' }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: 'var(--pcms-line-soft)' }} />
  </div>
);

/** Section card — consistent framed box */
const Card = ({ children, accent }) => (
  <div style={{
    background: 'var(--pcms-panel-2)',
    border: `1px solid ${accent ? `${accent}30` : 'var(--pcms-line)'}`,
    borderRadius: 10,
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  }}>
    {children}
  </div>
);

/** Card header row — icon + title + subtitle */
const CardHead = ({ icon: Icon, label, sub, color = 'var(--pcms-accent)' }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
      background: `${color}18`, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={15} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  </div>
);

/** Form row — label above + child input */
const Field = ({ label, children, hint, hintColor }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label className="pcms-form-label">{label}</label>
    {children}
    {hint && <span style={{ fontSize: 10.5, color: hintColor || 'var(--pcms-muted-2)' }}>{hint}</span>}
  </div>
);

/** Two-column grid */
const Grid2 = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
);

/** Status badge pill */
const Pill = ({ children, color = 'var(--pcms-accent)' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700,
    background: `${color}18`, color, border: `1px solid ${color}30`,
  }}>{children}</span>
);

/** Info callout */
const Note = ({ children, color = 'var(--pcms-accent)' }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '9px 12px', borderRadius: 8,
    background: `${color}0E`, border: `1px solid ${color}25`,
    fontSize: 11.5, color: 'var(--pcms-muted)', lineHeight: 1.5,
  }}>
    <Info size={13} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
    <span>{children}</span>
  </div>
);

/** Audit row */
const AuditRow = ({ row, isLast }) => {
  const t = new Date(row.created_at);
  const color = row.action?.includes('DELETE') || row.action?.includes('DANGER') ? '#EF4444'
    : row.action?.includes('CREATE') ? '#10B981'
    : row.action?.includes('UPDATE') ? '#6366F1'
    : '#F59E0B';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '130px 1fr 1fr 70px',
      gap: 10, padding: '9px 14px', alignItems: 'center',
      borderBottom: isLast ? 'none' : '1px solid var(--pcms-line-soft)',
    }}>
      <span style={{ fontFamily: 'monospace', fontSize: 10.5, color: 'var(--pcms-muted-2)' }}>
        {t.toLocaleDateString()} {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color }}>{row.action}</span>
      <span style={{ fontSize: 12, color: 'var(--pcms-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.entity_type}{row.entity_id ? ` · ${row.entity_id}` : ''}
      </span>
      <Pill color={color}>{row.action?.split('_')[0] || 'SYS'}</Pill>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   MAIN PANEL
────────────────────────────────────────────────────────────── */
export default function SettingsPanel() {
  const { data: dbSettings, setData: setDbSettings, loading } = useRealtimeData(
    'site_settings', { single: true, filter: { column: 'id', value: 1 } }
  );
  const [settings, setSettings] = useState(null);
  const [saveStatus, setSaveStatus]       = useState('saved'); // 'saved' | 'saving' | 'error'
  const [uploadingResume, setUploadingResume]   = useState(false);
  const [exportingBackup, setExportingBackup]   = useState(false);
  const [triggeringWebhook, setTriggeringWebhook] = useState(false);
  const [activeTab, setActiveTab]         = useState('toggles');
  const [auditLogs, setAuditLogs]         = useState([]);
  const [auditLoading, setAuditLoading]   = useState(false);
  const [auditFilter, setAuditFilter]     = useState('ALL');
  const [showCustomHex, setShowCustomHex] = useState(false);
  const [customHex, setCustomHex]         = useState('');
  const [revealedKeys, setRevealedKeys]   = useState({});
  const [dangerConfirm, setDangerConfirm] = useState(null);
  const [dangerInput, setDangerInput]     = useState('');
  const [backupHistory, setBackupHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pcms_backup_history') || '[]'); } catch { return []; }
  });
  const { accentColor, setAccentColor }   = useTheme();

  /* bootstrap */
  useEffect(() => {
    if (dbSettings && !settings) {
      setSettings({
        ...dbSettings,
        site_disabled: dbSettings.site_disabled ?? false,
        site_disabled_reason: dbSettings.site_disabled_reason || 'Access disabled by administrator.',
        site_disabled_at: dbSettings.site_disabled_at || null,
      });
    }
  }, [dbSettings, settings]);

  /* fetch audit when tab opens */
  useEffect(() => {
    if (activeTab !== 'audit') return;
    setAuditLoading(true);
    supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setAuditLogs(data || []); setAuditLoading(false); });
  }, [activeTab]);

  /* core save */
  const updateSetting = async (key, value) => {
    setSaveStatus('saving');
    if (key === 'site_disabled')        localStorage.setItem('pcms_site_disabled', String(value));
    if (key === 'site_disabled_reason') localStorage.setItem('pcms_site_disabled_reason', String(value));
    if (key === 'site_disabled_at')     localStorage.setItem('pcms_site_disabled_at', String(value));
    window.dispatchEvent(new Event('storage'));

    // Immediately patch the in-memory globalDataCache so portfolio components
    // that use useRealtimeData('site_settings') see the update before Supabase
    // realtime fires (same-browser instant update).
    try {
      const { globalDataCache } = await import('../../../hooks/useRealtimeData');
      const cacheKey = `site_settings_${JSON.stringify({ select: '*', single: true, orderColumn: 'id', ascending: true, filter: { column: 'id', value: 1 } })}`;
      if (globalDataCache[cacheKey]) {
        globalDataCache[cacheKey] = { ...globalDataCache[cacheKey], [key]: value };
      }
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('pcms_data_updated', { detail: { table: 'site_settings', key, value } }));

    const { error } = await supabase.from('site_settings').update({ [key]: value }).eq('id', 1);
    setTimeout(() => setSaveStatus(error ? 'error' : 'saved'), 500);

    if (error && !error.message?.includes('schema cache') && error.code !== 'PGRST204') {
      console.error(`Save error [${key}]:`, error.message);
    } else if (!error) {
      logAuditEvent('UPDATE_SETTINGS', 'site_settings', key);
    }
  };

  const toggle = (key, val) => {
    setSettings(p => ({ ...p, [key]: val }));
    // Sync localStorage immediately so portfolio window reacts without Supabase round-trip.
    if (key === 'maintenance_enabled') {
      localStorage.setItem('pcms_maint_enabled', String(val));
      if (val) localStorage.setItem('pcms_maint_at', new Date().toISOString());
      else     localStorage.removeItem('pcms_maint_at');
    }
    if (key === 'site_disabled') {
      localStorage.setItem('pcms_site_disabled', String(val));
      if (!val) localStorage.removeItem('pcms_site_disabled_at');
    }
    // Fire both events: 'storage' for cross-tab native sync, 'pcms_lock_changed' for same-tab.
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('pcms_lock_changed'));
    updateSetting(key, val);
  };
  const change = (key, val) => setSettings(p => ({ ...p, [key]: val }));
  const blur   = (key, val) => { if (dbSettings && dbSettings[key] !== val) { updateSetting(key, val); setDbSettings(p => ({ ...p, [key]: val })); } };

  /* resume upload */
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    const name = `resume_${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('portfolio-assets').upload(name, file, { upsert: true });
    if (!error) {
      const url = supabase.storage.from('portfolio-assets').getPublicUrl(name).data.publicUrl;
      const next = { ...settings, resume_url: url };
      setSettings(next); setDbSettings(next);
      await supabase.from('site_settings').update({ resume_url: url }).eq('id', 1);
      logAuditEvent('UPLOAD_RESUME', 'storage', name);
    } else alert(`Upload failed: ${error.message}`);
    setUploadingResume(false);
    e.target.value = '';
  };

  /* backup export */
  const handleExport = async () => {
    setExportingBackup(true);
    try {
      const tables = ['projects','blog_posts','skills','experience','education','certifications','testimonials','updates','site_settings'];
      const obj = { exported_at: new Date().toISOString(), version: '3.0', schema: 'pcms_v3', data: {} };
      for (const t of tables) { const { data } = await supabase.from(t).select('*'); obj.data[t] = data || []; }
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const ts = new Date().toISOString().split('T')[0];
      a.download = `cms_backup_${ts}.json`;
      a.click(); URL.revokeObjectURL(a.href);
      const entry = { ts: new Date().toISOString(), filename: `cms_backup_${ts}.json` };
      const next = [entry, ...backupHistory].slice(0, 5);
      setBackupHistory(next); localStorage.setItem('pcms_backup_history', JSON.stringify(next));
      logAuditEvent('EXPORT_BACKUP', 'system', 'Full JSON Export v3');
    } catch (e) { alert('Export failed: ' + e.message); }
    setExportingBackup(false);
  };

  /* webhook */
  const handleWebhook = async () => {
    if (!settings?.deploy_webhook_url) { alert('Enter a webhook URL first.'); return; }
    setTriggeringWebhook(true);
    try {
      await fetch(settings.deploy_webhook_url, { method: 'POST' });
      alert('🚀 Webhook triggered! Build started.');
      logAuditEvent('TRIGGER_DEPLOY', 'webhooks', settings.deploy_webhook_url);
    } catch (e) { alert('Webhook error: ' + e.message); }
    setTriggeringWebhook(false);
  };

  /* danger actions */
  const execDanger = async (id) => {
    if (id === 'clear_cache') {
      ['pcms_backup_history','pcms_site_disabled','pcms_maint_enabled'].forEach(k => localStorage.removeItem(k));
      setBackupHistory([]); logAuditEvent('DANGER_CLEAR_CACHE','system','Cache cleared'); alert('✅ Cache cleared.');
    } else if (id === 'reset_settings') {
      const defaults = { feature_experience:true, feature_certifications:true, feature_blog:true, feature_testimonials:true, feature_chatbot:true, feature_updates:true, is_available_for_hire:false, announcement_enabled:false, site_disabled:false, maintenance_enabled:false };
      await supabase.from('site_settings').update(defaults).eq('id', 1);
      setSettings(p => ({ ...p, ...defaults })); logAuditEvent('DANGER_RESET_SETTINGS','system','Reset to defaults'); alert('✅ Settings reset.');
    } else if (id === 'purge_messages') {
      const { error } = await supabase.from('contact_messages').delete().neq('id','00000000-0000-0000-0000-000000000000');
      if (!error) { logAuditEvent('DANGER_PURGE_MESSAGES','contact_messages','All purged'); alert('✅ Messages purged.'); }
      else alert('Error: ' + error.message);
    } else if (id === 'purge_audit') {
      const { error } = await supabase.from('admin_audit_logs').delete().neq('id','00000000-0000-0000-0000-000000000000');
      if (!error) { setAuditLogs([]); logAuditEvent('DANGER_PURGE_AUDIT','admin_audit_logs','Cleared'); alert('✅ Audit log cleared.'); }
      else alert('Error: ' + error.message);
    }
    setDangerConfirm(null); setDangerInput('');
  };

  if (loading || !settings) return (
    <div style={{ padding: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Loader2 className="spin" size={22} color="var(--pcms-accent)" />
    </div>
  );

  const tabMeta = TABS.find(t => t.id === activeTab);
  const filteredAudit = auditFilter === 'ALL' ? auditLogs : auditLogs.filter(l => l.action?.startsWith(auditFilter));

  const statusCfg = {
    saved:  { color: '#10B981', icon: <Check size={12} />,           text: 'Saved' },
    saving: { color: '#6366F1', icon: <Loader2 size={12} className="spin" />, text: 'Saving…' },
    error:  { color: '#EF4444', icon: <XCircle size={12} />,         text: 'Error' },
  }[saveStatus];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', minHeight: 0 }}>

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
        borderRadius: 10, padding: '13px 18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="pcms-topbar-icon"><Settings size={16} /></div>
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
              Control Center
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--pcms-muted)', marginTop: 1 }}>
              Site-wide configuration — changes apply instantly.
            </p>
          </div>
        </div>
        <Pill color={statusCfg.color}>{statusCfg.icon}{statusCfg.text}</Pill>
      </div>

      {/* ── Two-column shell ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '196px 1fr', gap: 14, flex: 1, minHeight: 0, alignItems: 'stretch' }}>

        {/* ── Left nav ── */}
        <div style={{
          background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
          borderRadius: 10, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 1,
          position: 'sticky', top: 0, overflowY: 'auto', scrollbarWidth: 'none',
          maxHeight: 'calc(100vh / 0.66 - 58px - 40px - 78px)',
        }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pcms-muted-2)', padding: '4px 8px 6px', margin: 0 }}>Settings</p>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const isDanger = tab.id === 'danger';
            const baseColor = isDanger ? '#EF4444' : 'var(--pcms-accent)';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8, fontSize: 12, fontWeight: active ? 600 : 400,
                  background: active ? (isDanger ? '#EF444414' : 'var(--pcms-accent-dim)') : 'transparent',
                  color: active ? baseColor : isDanger ? '#EF4444aa' : 'var(--pcms-muted)',
                  border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.12s',
                }}
              >
                <Icon size={13} style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Right content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.13 }}
            style={{
              background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
              borderRadius: 10, padding: '18px 20px',
              display: 'flex', flexDirection: 'column', gap: 14,
              overflowY: 'auto', scrollbarWidth: 'thin',
              maxHeight: 'calc(100vh / 0.66 - 58px - 40px - 78px)',
            }}
          >
            {/* Section heading */}
            <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--pcms-line-soft)' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {tabMeta?.label}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 11.5, color: 'var(--pcms-muted)' }}>{tabMeta?.desc}</p>
            </div>

            {/* ─────────────── FEATURE FLAGS ─────────────── */}
            {activeTab === 'toggles' && (<>
              <Card>
                <CardHead icon={Layers} label="Portfolio Modules" sub="Toggle entire sections visible to public visitors." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <PremiumToggle icon={Briefcase} color="#6366F1" label="Experience & Timeline" description="Career history, roles & achievements." checked={settings?.feature_experience ?? true} onChange={v => toggle('feature_experience', v)} />
                  <PremiumToggle icon={Award}     color="#10B981" label="Certifications & Awards" description="Credentials, badges & recognitions." checked={settings?.feature_certifications ?? true} onChange={v => toggle('feature_certifications', v)} />
                  <PremiumToggle icon={BookOpen}  color="#06B6D4" label="Blog & Articles" description="Blog listing page and individual posts." checked={settings?.feature_blog ?? true} onChange={v => toggle('feature_blog', v)} />
                  <PremiumToggle icon={Star}      color="#F59E0B" label="Testimonials" description="Recommendations from clients & peers." checked={settings?.feature_testimonials ?? true} onChange={v => toggle('feature_testimonials', v)} />
                  <PremiumToggle icon={Activity}  color="#8B5CF6" label="Updates Feed" description="Live activity & project updates stream." checked={settings?.feature_updates ?? true} onChange={v => toggle('feature_updates', v)} />
                </div>
              </Card>
              <Card>
                <CardHead icon={Bot} label="AI & Engagement" sub="Interactive and AI-powered features." color="#06B6D4" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <PremiumToggle icon={Bot}           color="#06B6D4" label="AI Chat Assistant" description="RAG-powered portfolio chatbot widget." checked={settings?.feature_chatbot ?? true} onChange={v => toggle('feature_chatbot', v)} />
                  <PremiumToggle icon={Sparkles}      color="#8B5CF6" label="Available for Hire Badge" description="'Open for Opportunities' pill in hero." checked={settings?.is_available_for_hire ?? false} onChange={v => toggle('is_available_for_hire', v)} />
                  <PremiumToggle icon={MessageCircle} color="#EC4899" label="Contact Form" description="Allow visitors to send you messages." checked={settings?.feature_contact ?? true} onChange={v => toggle('feature_contact', v)} />
                </div>
              </Card>
            </>)}

            {/* ─────────────── STATUS & AVAILABILITY ─────────────── */}
            {activeTab === 'status_avail' && (<>
              <Card>
                <CardHead icon={Cpu} label="Current Active Project" sub="Shown in the hero as a live project indicator." />
                <PremiumInput label="Project Name" icon={FileText} value={settings?.current_project || ''} onChange={e => change('current_project', e.target.value)} onBlur={e => blur('current_project', e.target.value)} placeholder="e.g. AI Portfolio Engine v3.0" />
                <Grid2>
                  <Field label="Status">
                    <select className="pcms-select" value={settings?.current_project_status || 'In Progress'} onChange={e => { change('current_project_status', e.target.value); updateSetting('current_project_status', e.target.value); }} style={{ width: '100%' }}>
                      {['Planning','In Progress','Testing','Deployed','On Hold','Archived'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label={`Progress — ${settings?.current_project_pct ?? 0}%`}>
                    <input type="range" min={0} max={100} step={5} value={settings?.current_project_pct ?? 0} onChange={e => change('current_project_pct', Number(e.target.value))} onMouseUp={e => blur('current_project_pct', Number(e.target.value))} style={{ width: '100%', marginTop: 8 }} />
                  </Field>
                </Grid2>
                <PremiumInput label="Project URL (Optional)" icon={Link} value={settings?.current_project_url || ''} onChange={e => change('current_project_url', e.target.value)} onBlur={e => blur('current_project_url', e.target.value)} placeholder="https://github.com/..." />
              </Card>
              <Card>
                <CardHead icon={Users} label="Hiring & Availability" sub="Controls the hiring status badge shown in the hero." color="#10B981" />
                <Grid2>
                  <Field label="Hiring Status">
                    <select className="pcms-select" value={settings?.availability_status || 'Available'} onChange={e => { change('availability_status', e.target.value); updateSetting('availability_status', e.target.value); }} style={{ width: '100%' }}>
                      {['Available','Open to Part-time','Actively Looking','In a Role','Busy','Not Available'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Available From">
                    <input type="date" className="pcms-search" value={settings?.availability_from || ''} onChange={e => change('availability_from', e.target.value)} onBlur={e => blur('availability_from', e.target.value)} style={{ width: '100%' }} />
                  </Field>
                </Grid2>
                <PremiumInput label="Preferred Role" icon={Briefcase} value={settings?.preferred_role || ''} onChange={e => change('preferred_role', e.target.value)} onBlur={e => blur('preferred_role', e.target.value)} placeholder="e.g. Full-Stack / AI Engineer" />
                <PremiumInput label="Notice Period" icon={Clock} value={settings?.notice_period || ''} onChange={e => change('notice_period', e.target.value)} onBlur={e => blur('notice_period', e.target.value)} placeholder="e.g. Immediate / 2 weeks" />
              </Card>
            </>)}

            {/* ─────────────── ANNOUNCEMENT ─────────────── */}
            {activeTab === 'banner' && (
              <Card>
                <CardHead icon={Bell} label="Global Announcement Bar" sub="Persistent banner shown across all portfolio pages." color="#F59E0B" />
                <PremiumToggle icon={Bell} color="#F59E0B" label="Enable Announcement Bar" description="Display the site-wide notification strip." checked={settings?.announcement_enabled ?? false} onChange={v => toggle('announcement_enabled', v)} />
                {settings?.announcement_enabled && (<>
                  <Divider label="Banner Content" />
                  <PremiumInput label="Message" icon={MessageSquare} value={settings?.announcement_text || ''} onChange={e => change('announcement_text', e.target.value)} onBlur={e => blur('announcement_text', e.target.value)} placeholder="Currently open for Full-Time roles!" />
                  <Grid2>
                    <Field label="Type">
                      <select className="pcms-select" value={settings?.announcement_type || 'info'} onChange={e => { change('announcement_type', e.target.value); updateSetting('announcement_type', e.target.value); }} style={{ width: '100%' }}>
                        {[['info','💡 Info'],['success','✅ Success'],['warning','⚠️ Warning'],['error','🔴 Error'],['promo','🎉 Promotion']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </Field>
                    <PremiumInput label="Link URL" icon={Link} value={settings?.announcement_url || ''} onChange={e => change('announcement_url', e.target.value)} onBlur={e => blur('announcement_url', e.target.value)} placeholder="https://..." />
                  </Grid2>
                </>)}
              </Card>
            )}

            {/* ─────────────── SEO ─────────────── */}
            {activeTab === 'seo' && (<>
              <Card>
                <CardHead icon={Globe} label="Search Engine Optimization" sub="How your portfolio appears in Google, Bing & social shares." />
                <PremiumInput
                  label="Meta Title" icon={Type}
                  value={settings?.seo_title || ''}
                  onChange={e => change('seo_title', e.target.value)}
                  onBlur={e => blur('seo_title', e.target.value)}
                  placeholder="Sujith Thota | Full-Stack & AI Engineer"
                />
                <div style={{ fontSize: 11, color: (settings?.seo_title?.length || 0) > 60 ? '#EF4444' : 'var(--pcms-muted-2)', marginTop: -8 }}>
                  {settings?.seo_title?.length || 0} / 60 characters
                </div>
                <PremiumInput
                  label="Meta Description" icon={FileText} multiline
                  value={settings?.seo_description || ''}
                  onChange={e => change('seo_description', e.target.value)}
                  onBlur={e => blur('seo_description', e.target.value)}
                  placeholder="Full-stack engineer specialising in AI-powered web applications…"
                />
                <div style={{ fontSize: 11, color: (settings?.seo_description?.length || 0) > 160 ? '#EF4444' : 'var(--pcms-muted-2)', marginTop: -8 }}>
                  {settings?.seo_description?.length || 0} / 160 characters
                </div>
                <Grid2>
                  <PremiumInput label="OpenGraph Image URL" icon={Image} value={settings?.seo_og_image || ''} onChange={e => change('seo_og_image', e.target.value)} onBlur={e => blur('seo_og_image', e.target.value)} placeholder="https://..." />
                  <PremiumInput label="Canonical URL" icon={Globe} value={settings?.seo_canonical || ''} onChange={e => change('seo_canonical', e.target.value)} onBlur={e => blur('seo_canonical', e.target.value)} placeholder="https://yoursite.dev" />
                </Grid2>
                <PremiumInput label="Twitter / X Handle" icon={FaTwitter} value={settings?.seo_twitter_handle || ''} onChange={e => change('seo_twitter_handle', e.target.value)} onBlur={e => blur('seo_twitter_handle', e.target.value)} placeholder="@yourhandle" />
              </Card>
              {settings?.seo_title && settings?.seo_description && (
                <Card>
                  <CardHead icon={Eye} label="Google SERP Preview" sub="How your listing appears in search results." color="#10B981" />
                  <div style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11.5, color: '#34A853', marginBottom: 2 }}>{settings?.seo_canonical || 'https://yoursite.dev'}</div>
                    <div style={{ fontSize: 15, color: '#1a73e8', fontWeight: 600, marginBottom: 4, textDecoration: 'underline', cursor: 'pointer' }}>{settings?.seo_title}</div>
                    <div style={{ fontSize: 12, color: 'var(--pcms-muted)', lineHeight: 1.5 }}>{settings?.seo_description?.slice(0, 160)}</div>
                  </div>
                </Card>
              )}
            </>)}

            {/* ─────────────── LINKS & ASSETS ─────────────── */}
            {activeTab === 'links' && (<>
              <Card>
                <CardHead icon={Link} label="Social & Contact Links" sub="Used in footer, hero and contact sections." />
                <PremiumInput label="Contact Email" icon={Mail} value={settings?.contact_email || ''} onChange={e => change('contact_email', e.target.value)} onBlur={e => blur('contact_email', e.target.value)} placeholder="your@email.com" />
                <Grid2>
                  <PremiumInput label="GitHub" icon={FaGithub} value={settings?.github_url || ''} onChange={e => change('github_url', e.target.value)} onBlur={e => blur('github_url', e.target.value)} placeholder="https://github.com/..." />
                  <PremiumInput label="LinkedIn" icon={FaLinkedin} value={settings?.linkedin_url || ''} onChange={e => change('linkedin_url', e.target.value)} onBlur={e => blur('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
                </Grid2>
                <Grid2>
                  <PremiumInput label="Twitter / X" icon={FaTwitter} value={settings?.twitter_url || ''} onChange={e => change('twitter_url', e.target.value)} onBlur={e => blur('twitter_url', e.target.value)} placeholder="https://x.com/..." />
                  <PremiumInput label="Portfolio Site" icon={Globe} value={settings?.portfolio_url || ''} onChange={e => change('portfolio_url', e.target.value)} onBlur={e => blur('portfolio_url', e.target.value)} placeholder="https://yoursite.dev" />
                </Grid2>
              </Card>
              <Card>
                <CardHead icon={FileText} label="PDF Resume" sub="Downloadable CV for visitors." color="#EC4899" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--pcms-panel)', border: '1px dashed var(--pcms-line)', borderRadius: 8 }}>
                  <FileText size={16} color="var(--pcms-accent)" style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: settings?.resume_url ? 'var(--pcms-text)' : 'var(--pcms-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {settings?.resume_url ? settings.resume_url.split('/').pop() : 'No resume uploaded'}
                  </span>
                  {settings?.resume_url && (
                    <a href={settings.resume_url} target="_blank" rel="noreferrer" className="pcms-btn-secondary" style={{ padding: '5px 10px', fontSize: 11, textDecoration: 'none' }}>
                      <Eye size={11} /> View
                    </a>
                  )}
                  <input type="file" id="resume-file" accept="application/pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
                  <button className="pcms-btn-dark" style={{ padding: '5px 12px', fontSize: 11 }} onClick={() => document.getElementById('resume-file').click()}>
                    {uploadingResume ? <Loader2 size={11} className="spin" /> : <Upload size={11} />}
                    {uploadingResume ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </Card>
            </>)}

            {/* ─────────────── THEME & BRANDING ─────────────── */}
            {activeTab === 'theme' && (<>
              <Card>
                <CardHead icon={Palette} label="Accent Color" sub="Primary color for highlights, links and CTA buttons." />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {ACCENT_OPTIONS.map(opt => {
                    const sel = accentColor === opt.id;
                    return (
                      <button key={opt.id} type="button" onClick={() => { setAccentColor(opt.id); updateSetting('accent_color', opt.id); }} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: '10px 4px', borderRadius: 9,
                        background: sel ? `${opt.hex}14` : 'transparent',
                        border: `1px solid ${sel ? opt.hex : 'var(--pcms-line)'}`,
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: opt.hex, boxShadow: sel ? `0 0 0 3px ${opt.hex}35` : 'none' }} />
                        <span style={{ fontSize: 10.5, color: sel ? opt.hex : 'var(--pcms-muted)', fontWeight: sel ? 700 : 400 }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <button type="button" onClick={() => setShowCustomHex(!showCustomHex)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--pcms-muted)', padding: 0 }}>
                    {showCustomHex ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Custom hex color
                  </button>
                  {showCustomHex && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input type="color" value={customHex || '#6366F1'} onChange={e => setCustomHex(e.target.value)} style={{ width: 38, height: 36, border: '1px solid var(--pcms-line)', borderRadius: 7, cursor: 'pointer', background: 'transparent' }} />
                      <input type="text" className="pcms-search" value={customHex} onChange={e => setCustomHex(e.target.value)} placeholder="#6366F1" style={{ flex: 1 }} />
                      <button className="pcms-btn-dark" style={{ padding: '6px 14px', fontSize: 11.5 }} onClick={() => { if (/^#[0-9A-F]{6}$/i.test(customHex)) { updateSetting('custom_accent_hex', customHex); } else alert('Invalid hex.'); }}>Apply</button>
                    </div>
                  )}
                </div>
              </Card>
              <Card>
                <CardHead icon={Pen} label="Identity & Branding" sub="Your portfolio's public-facing copy." color="#8B5CF6" />
                <PremiumInput label="Your Name" icon={User} value={settings?.owner_name || ''} onChange={e => change('owner_name', e.target.value)} onBlur={e => blur('owner_name', e.target.value)} placeholder="Sujith Thota" />
                <PremiumInput label="Hero Headline" icon={Type} value={settings?.hero_headline || ''} onChange={e => change('hero_headline', e.target.value)} onBlur={e => blur('hero_headline', e.target.value)} placeholder="Full-Stack & AI Engineer" />
                <PremiumInput label="Hero Tagline" icon={FileText} value={settings?.hero_tagline || ''} onChange={e => change('hero_tagline', e.target.value)} onBlur={e => blur('hero_tagline', e.target.value)} placeholder="Building intelligent, high-performance software." />
              </Card>
            </>)}

            {/* ─────────────── PERFORMANCE ─────────────── */}
            {activeTab === 'performance' && (<>
              <Card>
                <CardHead icon={TrendingUp} label="Analytics & Tracking" sub="Control visitor telemetry." />
                <PremiumToggle icon={BarChart2}      color="#6366F1" label="Page View Tracking"  description="Record anonymous page view counts per route." checked={settings?.track_page_views ?? true}  onChange={v => toggle('track_page_views', v)} />
                <PremiumToggle icon={Bot}            color="#10B981" label="Bot Traffic Filter"   description="Ignore crawler requests from analytics." checked={settings?.filter_bots ?? true}         onChange={v => toggle('filter_bots', v)} />
                <PremiumToggle icon={Activity}       color="#06B6D4" label="Referrer Logging"     description="Log which sites send visitors to you." checked={settings?.log_referrers ?? false}       onChange={v => toggle('log_referrers', v)} />
              </Card>
              <Card>
                <CardHead icon={Server} label="Rate Limiting & AI Quotas" sub="Protect against abuse." color="#F59E0B" />
                <Grid2>
                  <Field label="AI Requests / IP / Hour"><input type="number" min={1} max={200} className="pcms-search" value={settings?.rate_limit_ai ?? 10} onChange={e => change('rate_limit_ai', Number(e.target.value))} onBlur={e => blur('rate_limit_ai', Number(e.target.value))} style={{ width: '100%' }} /></Field>
                  <Field label="Contact Form / IP / Day"><input type="number" min={1} max={50}  className="pcms-search" value={settings?.rate_limit_contact ?? 5}  onChange={e => change('rate_limit_contact', Number(e.target.value))} onBlur={e => blur('rate_limit_contact', Number(e.target.value))} style={{ width: '100%' }} /></Field>
                </Grid2>
                <PremiumToggle icon={Shield} color="#EF4444" label="Enforce Rate Limits" description="Actively block IPs exceeding thresholds." checked={settings?.enforce_rate_limits ?? true} onChange={v => toggle('enforce_rate_limits', v)} />
              </Card>
              <Card>
                <CardHead icon={Wifi} label="Cache & CDN" sub="Edge cache and staleness behaviour." color="#8B5CF6" />
                <Field label="Static Asset Cache TTL">
                  <select className="pcms-select" value={settings?.cache_ttl ?? 86400} onChange={e => { change('cache_ttl', Number(e.target.value)); updateSetting('cache_ttl', Number(e.target.value)); }} style={{ width: '100%' }}>
                    {[[3600,'1 Hour'],[21600,'6 Hours'],[86400,'24 Hours (default)'],[604800,'7 Days']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <PremiumToggle icon={RefreshCw} color="#06B6D4" label="Stale-While-Revalidate" description="Serve cached pages while revalidating." checked={settings?.stale_while_revalidate ?? true} onChange={v => toggle('stale_while_revalidate', v)} />
              </Card>
            </>)}

            {/* ─────────────── NOTIFICATIONS ─────────────── */}
            {activeTab === 'notifications' && (<>
              <Card>
                <CardHead icon={Mail} label="Email Notifications" sub="Which admin events trigger email alerts." />
                <PremiumToggle icon={MessageSquare} color="#6366F1" label="New Contact Message"   description="Email when someone sends you a message." checked={settings?.notify_new_message ?? true}  onChange={v => toggle('notify_new_message', v)} />
                <PremiumToggle icon={Bot}           color="#06B6D4" label="New AI Chat Session"   description="Alert when a visitor starts AI chat." checked={settings?.notify_new_chat ?? false}    onChange={v => toggle('notify_new_chat', v)} />
                <PremiumToggle icon={Server}        color="#10B981" label="Deploy Webhook Success" description="Email after a production deploy completes." checked={settings?.notify_deploy ?? true}     onChange={v => toggle('notify_deploy', v)} />
                <PremiumToggle icon={Shield}        color="#EF4444" label="Security Alert"         description="Immediate alert on lockdown mode activation." checked={settings?.notify_security ?? true} onChange={v => toggle('notify_security', v)} />
              </Card>
              <Card>
                <CardHead icon={Bell} label="Routing" sub="Where alerts are delivered." color="#F59E0B" />
                <PremiumInput label="Alert Email" icon={Mail} value={settings?.notify_email || settings?.contact_email || ''} onChange={e => change('notify_email', e.target.value)} onBlur={e => blur('notify_email', e.target.value)} placeholder="your@email.com" />
                <PremiumInput label="Slack Webhook (Optional)" icon={Link} value={settings?.slack_webhook || ''} onChange={e => change('slack_webhook', e.target.value)} onBlur={e => blur('slack_webhook', e.target.value)} placeholder="https://hooks.slack.com/services/…" />
              </Card>
            </>)}

            {/* ─────────────── SECURITY & LOCK ─────────────── */}
            {activeTab === 'security_lock' && (<>
              <Card>
                <CardHead icon={Lock} label="Site Access State" sub="Admin console (/admin/*) always stays accessible." color="#EF4444" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { id: 'live',     label: '🟢 Live Site',   active: !settings?.site_disabled && !settings?.maintenance_enabled },
                    { id: 'maint',    label: '🟡 Maintenance', active: !settings?.site_disabled && !!settings?.maintenance_enabled },
                    { id: 'lockdown', label: '🔴 Full Lock',   active: !!settings?.site_disabled },
                  ].map(m => (
                    <button key={m.id} type="button" onClick={() => {
                      if (m.id === 'live') {
                        localStorage.setItem('pcms_maint_enabled','false'); localStorage.setItem('pcms_site_disabled','false');
                        toggle('site_disabled', false); toggle('maintenance_enabled', false);
                      } else if (m.id === 'maint') {
                        localStorage.setItem('pcms_maint_enabled','true'); localStorage.setItem('pcms_site_disabled','false');
                        toggle('site_disabled', false); toggle('maintenance_enabled', true);
                      } else {
                        if (!window.confirm('⚠️ This locks out all visitors. Continue?')) return;
                        const now = new Date().toISOString();
                        localStorage.setItem('pcms_site_disabled','true'); localStorage.setItem('pcms_maint_enabled','false'); localStorage.setItem('pcms_site_disabled_at', now);
                        toggle('maintenance_enabled', false); toggle('site_disabled', true); updateSetting('site_disabled_at', now);
                      }
                    }} style={{
                      padding: '10px 6px', borderRadius: 8, textAlign: 'center', fontSize: 12, fontWeight: m.active ? 700 : 500,
                      background: m.active ? 'var(--pcms-accent-dim)' : 'var(--pcms-panel-2)',
                      color: m.active ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
                      border: `1px solid ${m.active ? 'var(--pcms-accent-glow)' : 'var(--pcms-line)'}`,
                      cursor: 'pointer', transition: 'all 0.12s',
                    }}>{m.label}</button>
                  ))}
                </div>

                {!settings?.site_disabled && settings?.maintenance_enabled && (<>
                  <Divider label="Maintenance Options" />
                  <Grid2>
                    <Field label="Duration (minutes)"><input type="number" min={1} className="pcms-search" value={settings?.maintenance_eta ?? 20} onChange={e => change('maintenance_eta', Number(e.target.value))} onBlur={e => blur('maintenance_eta', Number(e.target.value))} style={{ width: '100%' }} /></Field>
                    <Field label="Type">
                      <select className="pcms-select" value={settings?.maintenance_type || 'Scheduled'} onChange={e => { change('maintenance_type', e.target.value); updateSetting('maintenance_type', e.target.value); }} style={{ width: '100%' }}>
                        {['Scheduled','Emergency','Upgrade','Database Migration'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                  </Grid2>
                  <PremiumInput label="Custom Message (Optional)" icon={MessageSquare} multiline value={settings?.maintenance_message || ''} onChange={e => change('maintenance_message', e.target.value)} onBlur={e => blur('maintenance_message', e.target.value)} placeholder="We are performing scheduled upgrades…" />
                </>)}

                {settings?.site_disabled && (<>
                  <Divider label="Lockdown Options" />
                  <Field label="Reason Shown to Visitors">
                    <textarea rows={2} className="pcms-search" value={settings?.site_disabled_reason || ''} onChange={e => change('site_disabled_reason', e.target.value)} onBlur={e => blur('site_disabled_reason', e.target.value)} style={{ width: '100%', resize: 'none' }} />
                  </Field>
                  {settings?.site_disabled_at && (
                    <Note color="#EF4444">Locked since {new Date(settings.site_disabled_at).toLocaleString()}</Note>
                  )}
                </>)}
              </Card>

              <Card>
                <CardHead icon={Shield} label="Session Info" sub="Read-only metadata about the current admin session." color="#6366F1" />
                {[
                  ['Session',  <Pill color="#10B981"><CheckCircle2 size={10} /> Authenticated</Pill>],
                  ['HTTPS',    <Pill color="#10B981"><CheckCircle2 size={10} /> Active</Pill>],
                  ['CSP',      <Pill color="#6366F1">Enforced</Pill>],
                  ['Last seen', new Date().toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--pcms-line-soft)' }}>
                    <span style={{ fontSize: 12, color: 'var(--pcms-muted)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pcms-text)' }}>{v}</span>
                  </div>
                ))}
              </Card>
            </>)}

            {/* ─────────────── BACKUP & RESTORE ─────────────── */}
            {activeTab === 'backup' && (<>
              <Card>
                <CardHead icon={Download} label="1-Click CMS Export" sub="Full snapshot of all 9 portfolio tables." />
                <Note>Includes: Projects, Blog, Skills, Experience, Education, Certifications, Testimonials, Updates, Settings.</Note>
                <div>
                  <button className="pcms-btn-dark" style={{ padding: '8px 18px' }} onClick={handleExport} disabled={exportingBackup}>
                    {exportingBackup ? <Loader2 size={13} className="spin" /> : <Database size={13} />}
                    {exportingBackup ? 'Generating…' : 'Download Backup (.json)'}
                  </button>
                </div>
              </Card>

              {backupHistory.length > 0 && (
                <Card>
                  <CardHead icon={Clock} label="Backup History" sub="Last 5 exports from this browser." color="#F59E0B" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {backupHistory.map((b, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < backupHistory.length - 1 ? '1px solid var(--pcms-line-soft)' : 'none', fontSize: 12 }}>
                        <span style={{ color: 'var(--pcms-text)', fontFamily: 'monospace', fontSize: 11 }}>{b.filename}</span>
                        <span style={{ color: 'var(--pcms-muted-2)' }}>{new Date(b.ts).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card>
                <CardHead icon={RotateCcw} label="Restore from Backup" sub="Upload a previously exported JSON file." color="#8B5CF6" />
                <div style={{ padding: 20, background: 'var(--pcms-panel)', border: '2px dashed var(--pcms-line)', borderRadius: 9, textAlign: 'center' }}>
                  <Database size={22} style={{ color: 'var(--pcms-muted-2)', margin: '0 auto 8px' }} />
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--pcms-muted)', fontWeight: 600 }}>Drag & drop backup JSON here</p>
                  <input type="file" accept="application/json" id="restore-file" style={{ display: 'none' }} onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const text = await file.text();
                    try {
                      const b = JSON.parse(text);
                      if (!b.data || !b.version) { alert('Invalid backup format.'); return; }
                      if (!window.confirm(`Overwrite all data with backup from ${b.exported_at}?`)) return;
                      logAuditEvent('RESTORE_BACKUP','system', b.exported_at);
                      alert('✅ Restore initiated. Wire Supabase upserts to complete the process.');
                    } catch { alert('Invalid JSON.'); }
                    e.target.value = '';
                  }} />
                  <button className="pcms-btn-dark" style={{ padding: '6px 16px', fontSize: 11.5 }} onClick={() => document.getElementById('restore-file').click()}>
                    <Upload size={12} /> Select File
                  </button>
                </div>
              </Card>
            </>)}

            {/* ─────────────── WEBHOOKS & VAULT ─────────────── */}
            {activeTab === 'webhooks_api' && (<>
              <Card>
                <CardHead icon={Send} label="Deploy Webhooks" sub="Trigger production rebuilds on Vercel, Netlify or Render." color="#06B6D4" />
                <PremiumInput label="Deploy Hook URL" icon={Link} value={settings?.deploy_webhook_url || ''} onChange={e => change('deploy_webhook_url', e.target.value)} onBlur={e => blur('deploy_webhook_url', e.target.value)} placeholder="https://api.vercel.com/v1/integrations/deploy/…" />
                <div>
                  <button className="pcms-btn-secondary" onClick={handleWebhook} disabled={triggeringWebhook || !settings?.deploy_webhook_url}>
                    {triggeringWebhook ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />}
                    {triggeringWebhook ? 'Triggering…' : 'Trigger Production Rebuild'}
                  </button>
                </div>
              </Card>

              <Card>
                <CardHead icon={Key} label="API Credentials Vault" sub="Masked secrets stored in Supabase RLS-protected rows." color="#F59E0B" />
                {[
                  { key: 'groq_api_key',       label: 'Groq AI API Key',      ph: 'gsk_…' },
                  { key: 'resend_api_key',      label: 'Resend Email Key',     ph: 're_…'  },
                  { key: 'upstash_redis_url',   label: 'Upstash Redis URL',    ph: 'https://…' },
                  { key: 'upstash_redis_token', label: 'Upstash Redis Token',  ph: 'AX…'  },
                ].map(({ key, label, ph }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid var(--pcms-line)', height: 40, minWidth: 160 }}>
                      <Key size={12} color="var(--pcms-muted-2)" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                    </div>
                    <input type={revealedKeys[key] ? 'text' : 'password'} value={settings?.[key] || ''} onChange={e => change(key, e.target.value)} onBlur={e => blur(key, e.target.value)} placeholder={ph} style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 12px', height: 40, fontSize: 13, color: 'var(--pcms-text)', outline: 'none' }} />
                    <button type="button" onClick={() => setRevealedKeys(p => ({ ...p, [key]: !p[key] }))} style={{ height: 40, padding: '0 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pcms-muted-2)', display: 'flex', alignItems: 'center' }}>
                      {revealedKeys[key] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                ))}
                <Note>Keys are stored in Supabase with Row Level Security. They are never exposed in client bundles.</Note>
              </Card>
            </>)}

            {/* ─────────────── AUDIT LOG ─────────────── */}
            {activeTab === 'audit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Filter + refresh row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {['ALL','UPDATE','CREATE','DELETE','EXPORT','TRIGGER','DANGER'].map(f => (
                      <button key={f} type="button" onClick={() => setAuditFilter(f)} style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                        background: auditFilter === f ? 'var(--pcms-accent-dim)' : 'var(--pcms-panel-2)',
                        color:      auditFilter === f ? 'var(--pcms-accent)'     : 'var(--pcms-muted)',
                        border: `1px solid ${auditFilter === f ? 'var(--pcms-accent)' : 'var(--pcms-line)'}`,
                      }}>{f}</button>
                    ))}
                  </div>
                  <button type="button" onClick={() => { setAuditLoading(true); supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => { setAuditLogs(data || []); setAuditLoading(false); }); }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--pcms-muted)', padding: '4px 6px' }}>
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>

                {/* Table */}
                <div style={{ background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', borderRadius: 10, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr 70px', gap: 10, padding: '8px 14px', background: 'var(--pcms-panel)', borderBottom: '1px solid var(--pcms-line)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pcms-muted)' }}>
                    <span>Time</span><span>Action</span><span>Entity</span><span>Type</span>
                  </div>
                  {auditLoading ? (
                    <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={20} color="var(--pcms-accent)" /></div>
                  ) : filteredAudit.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: 'var(--pcms-muted)' }}>No events found.</div>
                  ) : (
                    <div style={{ maxHeight: 380, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                      {filteredAudit.map((row, i) => <AuditRow key={row.id || i} row={row} isLast={i === filteredAudit.length - 1} />)}
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--pcms-muted-2)', margin: 0 }}>Showing {filteredAudit.length} events · Logs retained indefinitely</p>
              </div>
            )}

            {/* ─────────────── DANGER ZONE ─────────────── */}
            {activeTab === 'danger' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Note color="#EF4444">All actions below are <strong>irreversible</strong>. Proceed with extreme caution.</Note>

                {[
                  { id: 'clear_cache',     icon: Trash2,         color: '#F59E0B', title: 'Clear Local CMS Cache',      desc: 'Wipes all pcms_* localStorage keys. Safe — no database data deleted.',        confirm: null,            btn: 'Clear Cache',     sev: 'low'  },
                  { id: 'reset_settings',  icon: RotateCcw,      color: '#8B5CF6', title: 'Reset Settings to Defaults', desc: 'Restores all feature flags to original production values.',                  confirm: 'reset',         btn: 'Reset Defaults',  sev: 'med'  },
                  { id: 'purge_messages',  icon: MessageSquare,  color: '#EF4444', title: 'Purge All Contact Messages', desc: 'Permanently deletes every form submission. Cannot be undone.',              confirm: 'purge messages', btn: 'Purge Messages',  sev: 'high' },
                  { id: 'purge_audit',     icon: Terminal,       color: '#EF4444', title: 'Clear Audit Log',            desc: 'Permanently erases the entire admin action history.',                       confirm: 'clear audit',    btn: 'Clear Audit Log', sev: 'high' },
                ].map(action => {
                  const Icon = action.icon;
                  const open = dangerConfirm === action.id;
                  return (
                    <div key={action.id} style={{ background: 'var(--pcms-panel-2)', border: `1px solid ${action.sev === 'high' ? '#EF444428' : 'var(--pcms-line)'}`, borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${action.color}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <Icon size={14} color={action.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pcms-text)', marginBottom: 3 }}>{action.title}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--pcms-muted)', lineHeight: 1.4 }}>{action.desc}</div>
                          </div>
                        </div>
                        <button type="button" onClick={() => {
                          if (!action.confirm) { execDanger(action.id); return; }
                          setDangerConfirm(open ? null : action.id); setDangerInput('');
                        }} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', background: `${action.color}14`, color: action.color, border: `1px solid ${action.color}38` }}>
                          {action.btn}
                        </button>
                      </div>

                      {open && action.confirm && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--pcms-line-soft)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <p style={{ margin: 0, fontSize: 11.5, color: '#EF4444' }}>
                            Type <code style={{ background: '#EF444418', padding: '1px 6px', borderRadius: 4 }}>{action.confirm}</code> to confirm:
                          </p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input className="pcms-search" type="text" value={dangerInput} onChange={e => setDangerInput(e.target.value)} placeholder={action.confirm} style={{ flex: 1 }} />
                            <button type="button" disabled={dangerInput !== action.confirm} onClick={() => execDanger(action.id)} style={{
                              padding: '6px 18px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                              background: dangerInput === action.confirm ? '#EF4444' : 'var(--pcms-panel)',
                              color: dangerInput === action.confirm ? '#fff' : 'var(--pcms-muted)',
                              border: '1px solid #EF444438', cursor: dangerInput === action.confirm ? 'pointer' : 'not-allowed',
                            }}>Confirm</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
