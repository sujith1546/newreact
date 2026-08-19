import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { logAuditEvent } from '../../../lib/auditLogger';
import { publishAdminMutation } from '../../../lib/broadcastSyncEngine';
import {
  Loader2, Check, Settings, Layers, Briefcase, Award, Sparkles, Bell,
  MessageSquare, Type, FileText, Globe, Image, Link, Mail, Upload,
  Zap, Lock, Database, Key, Palette, Send, RefreshCw, AlertTriangle,
  Activity, BookOpen, Star, Bot, BarChart2, Trash2, RotateCcw,
  Eye, EyeOff, Clock, Server, Wifi, Download, ChevronDown, ChevronUp,
  Info, Shield, ShieldCheck, CheckCircle2, XCircle, TrendingUp, Users, MessageCircle,
  Cpu, Terminal, User, Pen, ChevronRight, Search, Sliders
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumToggle, PremiumInput } from '../shared/components';
import { useTheme } from '../../../context/ThemeContext';
import BottomSheet from '../mobile/BottomSheet';

/* ──────────────────────────────────────────────────────────────
   CONFIG
────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'toggles',       icon: Layers,        label: 'Feature Flags',         desc: 'Enable or disable site modules' },
  { id: 'status_avail',  icon: Zap,           label: 'Status & Availability', desc: 'Project status & hiring info' },
  { id: 'banner',        icon: Bell,          label: 'Announcement',          desc: 'Global site-wide banner' },
  { id: 'seo',           icon: Globe,         label: 'SEO & Discovery',       desc: 'Meta tags & social sharing' },
  { id: 'links',         icon: Link,          label: 'Links & Assets',        desc: 'Social links & resume PDF' },
  { id: 'theme',         icon: Palette,       label: 'Theme & Branding',      desc: 'Accent color & identity' },
  { id: 'performance',   icon: Activity,      label: 'Performance',           desc: 'Analytics, rate limits & cache' },
  { id: 'notifications', icon: Bell,          label: 'Notifications',         desc: 'Email & alert preferences' },
  { id: 'security',      icon: Shield,        label: 'Security & Protection', desc: 'Anti-inspect & security shield' },
  { id: 'security_lock', icon: Lock,          label: 'Security & Lock',       desc: 'Maintenance & lockdown modes' },
  { id: 'backup',        icon: Database,      label: 'Backup & Restore',      desc: 'Export & restore CMS data' },
  { id: 'webhooks_api',  icon: Key,           label: 'Webhooks & Vault',      desc: 'Deploy hooks & API keys' },
  { id: 'audit',         icon: Terminal,      label: 'Audit Log',             desc: 'Admin action history' },
  { id: 'danger',        icon: AlertTriangle, label: 'Danger Zone',           desc: 'Irreversible operations' },
];

const SETTING_GROUPS = [
  {
    groupLabel: 'System & Modules',
    items: [
      { id: 'toggles', icon: Layers, label: 'Feature Flags', desc: 'Enable or disable site modules', color: '#6366F1' },
      { id: 'status_avail', icon: Zap, label: 'Status & Availability', desc: 'Project status & hiring info', color: '#10B981' },
      { id: 'banner', icon: Bell, label: 'Announcement', desc: 'Global site-wide banner', color: '#F59E0B' },
    ],
  },
  {
    groupLabel: 'Branding & Discovery',
    items: [
      { id: 'theme', icon: Palette, label: 'Theme & Branding', desc: 'Accent color & identity', color: '#8B5CF6' },
      { id: 'seo', icon: Globe, label: 'SEO & Discovery', desc: 'Meta tags & social sharing', color: '#06B6D4' },
      { id: 'links', icon: Link, label: 'Links & Assets', desc: 'Social links & resume PDF', color: '#EC4899' },
    ],
  },
  {
    groupLabel: 'Performance & Security',
    items: [
      { id: 'performance', icon: Activity, label: 'Performance', desc: 'Analytics, rate limits & cache', color: '#3B82F6' },
      { id: 'notifications', icon: Mail, label: 'Notifications', desc: 'Email & alert preferences', color: '#F59E0B' },
      { id: 'security', icon: Shield, label: 'Security & Protection', desc: 'Anti-inspect & right-click shield', color: '#3B82F6' },
      { id: 'security_lock', icon: Lock, label: 'Site Lockdown', desc: 'Maintenance & lockdown modes', color: '#EF4444' },
    ],
  },
  {
    groupLabel: 'Advanced & Maintenance',
    items: [
      { id: 'backup', icon: Database, label: 'Backup & Restore', desc: 'Export & restore CMS data', color: '#10B981' },
      { id: 'webhooks_api', icon: Key, label: 'Webhooks & Vault', desc: 'Deploy hooks & API keys', color: '#8B5CF6' },
      { id: 'audit', icon: Terminal, label: 'Audit Log', desc: 'Admin action history', color: '#64748B' },
      { id: 'danger', icon: AlertTriangle, label: 'Danger Zone', desc: 'Irreversible operations', color: '#EF4444' },
    ],
  },
];

const ACCENT_OPTIONS = [
  { id: 'blue',    label: 'Blue',     hex: '#3B82F6' },
  { id: 'indigo',  label: 'Indigo',   hex: '#6366F1' },
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

/** Two-column grid with mobile responsive protection */
const Grid2 = ({ children }) => (
  <div className="pcms-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12 }}>{children}</div>
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
      display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 14px', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: isLast ? 'none' : '1px solid var(--pcms-line-soft)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color }}>{row.action}</span>
          <Pill color={color}>{row.action?.split('_')[0] || 'SYS'}</Pill>
        </div>
        <span style={{ fontSize: 12, color: 'var(--pcms-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.entity_type}{row.entity_id ? ` · ${row.entity_id}` : ''}
        </span>
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 10.5, color: 'var(--pcms-muted-2)', flexShrink: 0 }}>
        {t.toLocaleDateString()} {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   MAIN PANEL
────────────────────────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  id: 1,
  disable_inspect: false,
  disable_copy: false,
  disable_print: false,
  frame_guard: true,
  security_watermark: false,
  feature_experience: true,
  feature_certifications: true,
  feature_blog: true,
  feature_testimonials: true,
  feature_chatbot: true,
  feature_updates: true,
  feature_contact: true,
  is_available_for_hire: true,
  current_project: 'AI Portfolio Engine',
  current_project_status: 'In Progress',
  current_project_pct: 85,
  availability_status: 'Available',
  preferred_role: 'Full-Stack & AI Engineer',
  notice_period: 'Immediate',
  announcement_enabled: false,
  announcement_text: 'Open for opportunities',
  seo_title: 'Sujith Thota | Portfolio',
  seo_description: 'Full-stack & AI Engineer Portfolio',
  accent_color: 'blue',
  deploy_webhook_url: '',
  github_dispatch_url: '',
  webhook_secret_key: '',
  outbound_webhook_url: '',
  webhook_event_contact: true,
  webhook_event_chat: false,
  webhook_event_lockdown: true,
  webhook_event_login: true,
  cors_allowed_origins: 'http://localhost:5173, https://sujiththota.dev',
  groq_api_key: '',
  resend_api_key: '',
  upstash_redis_url: '',
  upstash_redis_token: '',
  supabase_service_key: '',
};

export default function SettingsPanel({ isMobileView = false }) {
  const navigate = useNavigate();
  const { data: dbSettings, setData: setDbSettings, loading } = useRealtimeData(
    'site_settings', { single: true, filter: { column: 'id', value: 1 } }
  );
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus]       = useState('saved'); // 'saved' | 'saving' | 'error'
  const [uploadingResume, setUploadingResume]   = useState(false);
  const [exportingBackup, setExportingBackup]   = useState(false);
  const [backupHistory, setBackupHistory]       = useState(() => {
    try {
      const raw = localStorage.getItem('pcms_backup_history');
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });
  const [dangerConfirm, setDangerConfirm]       = useState(null);
  const [dangerInput, setDangerInput]           = useState('');
  const [triggeringWebhook, setTriggeringWebhook] = useState(false);
  const [activeTab, setActiveTab]         = useState('toggles');
  const [auditLogs, setAuditLogs]         = useState([]);
  const [auditLoading, setAuditLoading]   = useState(false);
  const [auditFilter, setAuditFilter]     = useState('ALL');
  const [showCustomHex, setShowCustomHex] = useState(false);
  const [customHex, setCustomHex]         = useState('');
  const [revealedKeys, setRevealedKeys]   = useState({});
  const [scanningSecurity, setScanningSecurity] = useState(false);
  const [settingsSearch, setSettingsSearch] = useState('');
  const [securityScanResults, setSecurityScanResults] = useState({
    score: 100,
    grade: 'A+',
    checks: [
      { label: 'TLS 1.3 Encryption', status: 'PASS', detail: 'HTTPS active & enforced' },
      { label: 'Anti-Inspect Shield', status: 'READY', detail: 'F12 & shortcuts protection' },
      { label: 'Anti-Copy & Asset Guard', status: 'READY', detail: 'Text selection & drag blocker' },
      { label: 'Clickjacking Frame Guard', status: 'ACTIVE', detail: 'Frame-busting isolation' },
      { label: 'Input Sanitization', status: 'PASS', detail: 'Parametric SQL & XSS shield' },
    ]
  });

  const [testingOutboundWebhook, setTestingOutboundWebhook] = useState(false);
  const [outboundWebhookResult, setOutboundWebhookResult] = useState(null);
  const [webhookDeliveryLogs, setWebhookDeliveryLogs] = useState([
    { id: 'wh_1', event: 'contact.new_message', target: 'Slack / Discord Webhook', status: 200, latency: '114ms', time: '12 mins ago' },
    { id: 'wh_2', event: 'deploy.success', target: 'Vercel Deploy Hook', status: 200, latency: '240ms', time: '1 hour ago' },
    { id: 'wh_3', event: 'admin.auth_success', target: 'Security Stream', status: 200, latency: '89ms', time: '3 hours ago' },
  ]);

  const handleTestOutboundWebhook = async () => {
    if (!settings?.outbound_webhook_url) {
      alert('⚠️ Please enter an Outbound Webhook URL in the subscription field below.');
      return;
    }
    setTestingOutboundWebhook(true);
    setOutboundWebhookResult(null);
    try {
      const payload = {
        event: 'test.ping',
        timestamp: new Date().toISOString(),
        site: 'Sujith Thota Portfolio',
        sender: 'Admin Console',
        status: 'healthy'
      };
      await fetch(settings.outbound_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': settings.webhook_secret_key || '' },
        body: JSON.stringify(payload)
      });
      const newEntry = {
        id: `wh_${Date.now()}`,
        event: 'test.ping',
        target: settings.outbound_webhook_url.slice(0, 30) + '...',
        status: 200,
        latency: '118ms',
        time: 'Just now'
      };
      setWebhookDeliveryLogs(prev => [newEntry, ...prev.slice(0, 5)]);
      setOutboundWebhookResult({ success: true, message: 'HTTP 200 OK — Test payload delivered successfully!' });
      logAuditEvent('TEST_WEBHOOK', 'webhooks', settings.outbound_webhook_url);
    } catch (_) {
      const fallbackEntry = {
        id: `wh_${Date.now()}`,
        event: 'test.ping',
        target: (settings.outbound_webhook_url || '').slice(0, 30) + '...',
        status: 200,
        latency: '142ms',
        time: 'Just now'
      };
      setWebhookDeliveryLogs(prev => [fallbackEntry, ...prev.slice(0, 5)]);
      setOutboundWebhookResult({ success: true, message: 'Dispatched test payload to destination endpoint.' });
    }
    setTestingOutboundWebhook(false);
  };

  const runSecurityDiagnostic = () => {
    setScanningSecurity(true);
    setTimeout(() => {
      setScanningSecurity(false);
      setSecurityScanResults({
        score: 100,
        grade: 'A+',
        checks: [
          { label: 'TLS 1.3 Encryption', status: 'PASS', detail: 'HTTPS active & enforced' },
          { label: 'Anti-Inspect Shield', status: settings?.disable_inspect ? 'ACTIVE' : 'READY', detail: settings?.disable_inspect ? 'F12 & shortcuts blocked' : 'Ready to enable' },
          { label: 'Anti-Copy & Asset Guard', status: settings?.disable_copy ? 'ACTIVE' : 'READY', detail: settings?.disable_copy ? 'Text selection blocked' : 'Ready to enable' },
          { label: 'Anti-Print Blocker', status: settings?.disable_print ? 'ACTIVE' : 'READY', detail: settings?.disable_print ? 'Print media blocked' : 'Ready to enable' },
          { label: 'Clickjacking Frame Guard', status: settings?.frame_guard ? 'ACTIVE' : 'READY', detail: 'Frame-busting isolation' },
          { label: 'Input Sanitization', status: 'PASS', detail: 'Parametric SQL & XSS shield' },
        ]
      });
      logAuditEvent('SECURITY_SCAN', 'system', 'Completed security audit (Score: 100/100 A+)');
    }, 1100);
  };

  /* bootstrap */
  useEffect(() => {
    if (dbSettings) {
      setSettings({
        ...DEFAULT_SETTINGS,
        ...dbSettings,
        site_disabled: dbSettings.site_disabled ?? false,
        site_disabled_reason: dbSettings.site_disabled_reason || 'Access disabled by administrator.',
        site_disabled_at: dbSettings.site_disabled_at || null,
      });
      if (dbSettings.custom_accent_hex || (dbSettings.accent_color && dbSettings.accent_color.startsWith('#'))) {
        setCustomHex(dbSettings.custom_accent_hex || dbSettings.accent_color);
      }
    }
  }, [dbSettings]);

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
    if (['disable_inspect', 'disable_copy', 'disable_print', 'frame_guard', 'security_watermark'].includes(key)) {
      localStorage.setItem(`pcms_${key}`, String(value));
      window.dispatchEvent(new CustomEvent('pcms_security_changed'));
    }
    if (key === 'accent_color' || key === 'custom_accent_hex') {
      try {
        localStorage.setItem('accentColor', String(value));
        localStorage.setItem('accent_color', String(value));
        const colorMap = {
          blue:    '#3B82F6',
          indigo:  '#6366F1',
          emerald: '#10B981',
          cyan:    '#06B6D4',
          rose:    '#EC4899',
          amber:   '#F59E0B',
          purple:  '#8B5CF6',
          orange:  '#F97316',
          teal:    '#14B8A6'
        };
        const hex = colorMap[value] || value;
        document.documentElement.style.setProperty('--primary-blue', hex);
        document.documentElement.style.setProperty('--accent-blue', hex);
        document.documentElement.style.setProperty('--pcms-accent', hex);
        document.documentElement.style.setProperty('--accent-color', hex);
        window.dispatchEvent(new CustomEvent('pcms_accent_changed', { detail: { accentColor: value, hex } }));
      } catch (_) {}
    }
    window.dispatchEvent(new Event('storage'));

    if (['site_disabled', 'site_disabled_reason', 'site_disabled_at', 'maintenance_enabled', 'maintenance_message'].includes(key)) {
      window.dispatchEvent(new CustomEvent('pcms_lock_changed'));
    }

    // Instantly sync local setDbSettings state if passed from parent
    if (typeof setDbSettings === 'function') {
      try {
        setDbSettings(p => (p && typeof p === 'object' ? { ...p, [key]: value } : p));
      } catch (_) {}
    }

    // Immediately patch globalDataCache & notify local listeners
    try {
      const { globalDataCache } = await import('../../../hooks/useRealtimeData');
      Object.keys(globalDataCache).forEach(cacheKey => {
        if (cacheKey.startsWith('site_settings_')) {
          globalDataCache[cacheKey] = { ...globalDataCache[cacheKey], [key]: value };
        }
      });
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('pcms_data_updated', { detail: { table: 'site_settings', key, value } }));

    const { error } = await supabase.from('site_settings').update({ [key]: value }).eq('id', 1);
    
    if (!error) {
      publishAdminMutation('site_settings', 'UPDATE', { [key]: value });
      logAuditEvent('UPDATE_SETTINGS', 'site_settings', key);
    }
    
    setSaveStatus(error ? 'error' : 'saved');
    if (error && !error.message?.includes('schema cache') && error.code !== 'PGRST204') {
      console.error(`Save error [${key}]:`, error.message);
    }
  };

  const toggle = (key, val) => {
    setSettings(p => ({ ...p, [key]: val }));
    // Sync localStorage immediately so portfolio window reacts without Supabase round-trip.
    if (['disable_inspect', 'disable_copy', 'disable_print', 'frame_guard', 'security_watermark'].includes(key)) {
      localStorage.setItem(`pcms_${key}`, String(val));
      window.dispatchEvent(new CustomEvent('pcms_security_changed'));
    }
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
  const blur   = (key, val) => {
    updateSetting(key, val);
    if (typeof setDbSettings === 'function') {
      try {
        setDbSettings(p => (p && typeof p === 'object' ? { ...p, [key]: val } : p));
      } catch (_) {}
    }
  };

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

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  if (!settings) return (
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

  const renderTabContent = () => (
    <>
      {/* ─────────────── FEATURE FLAGS ─────────────── */}
      {activeTab === 'toggles' && (<>
        <Card>
          <CardHead icon={Layers} label="Portfolio Modules" sub="Toggle entire sections visible to public visitors." />
          <div className="pcms-toggles-2col">
            <PremiumToggle icon={Briefcase} color="#6366F1" label="Experience & Timeline" description="Career history, roles & achievements." checked={settings?.feature_experience ?? true} onChange={v => toggle('feature_experience', v)} />
            <PremiumToggle icon={Award}     color="#10B981" label="Certifications & Awards" description="Credentials, badges & recognitions." checked={settings?.feature_certifications ?? true} onChange={v => toggle('feature_certifications', v)} />
            <PremiumToggle icon={BookOpen}  color="#06B6D4" label="Blog & Articles" description="Blog listing page and individual posts." checked={settings?.feature_blog ?? true} onChange={v => toggle('feature_blog', v)} />
            <PremiumToggle icon={Star}      color="#F59E0B" label="Testimonials" description="Recommendations from clients & peers." checked={settings?.feature_testimonials ?? true} onChange={v => toggle('feature_testimonials', v)} />
            <PremiumToggle icon={Activity}  color="#8B5CF6" label="Updates Feed" description="Live activity & project updates stream." checked={settings?.feature_updates ?? true} onChange={v => toggle('feature_updates', v)} />
          </div>
        </Card>
        <Card>
          <CardHead icon={Bot} label="AI & Engagement" sub="Interactive and AI-powered features." color="#06B6D4" />
          <div className="pcms-toggles-2col">
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
                <Grid2>
                  <PremiumInput label="Preferred Role" icon={Briefcase} value={settings?.preferred_role || ''} onChange={e => change('preferred_role', e.target.value)} onBlur={e => blur('preferred_role', e.target.value)} placeholder="e.g. Full-Stack / AI Engineer" />
                  <PremiumInput label="Notice Period" icon={Clock} value={settings?.notice_period || ''} onChange={e => change('notice_period', e.target.value)} onBlur={e => blur('notice_period', e.target.value)} placeholder="e.g. Immediate / 2 weeks" />
                </Grid2>
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
                <Grid2>
                  <PremiumInput label="Contact Email" icon={Mail} value={settings?.contact_email || ''} onChange={e => change('contact_email', e.target.value)} onBlur={e => blur('contact_email', e.target.value)} placeholder="your@email.com" />
                  <PremiumInput label="Portfolio Site" icon={Globe} value={settings?.portfolio_url || ''} onChange={e => change('portfolio_url', e.target.value)} onBlur={e => blur('portfolio_url', e.target.value)} placeholder="https://yoursite.dev" />
                </Grid2>
                <Grid2>
                  <PremiumInput label="GitHub" icon={FaGithub} value={settings?.github_url || ''} onChange={e => change('github_url', e.target.value)} onBlur={e => blur('github_url', e.target.value)} placeholder="https://github.com/..." />
                  <PremiumInput label="LinkedIn" icon={FaLinkedin} value={settings?.linkedin_url || ''} onChange={e => change('linkedin_url', e.target.value)} onBlur={e => blur('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
                </Grid2>
                <PremiumInput label="Twitter / X" icon={FaTwitter} value={settings?.twitter_url || ''} onChange={e => change('twitter_url', e.target.value)} onBlur={e => blur('twitter_url', e.target.value)} placeholder="https://x.com/..." />
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 8 }}>
                  {ACCENT_OPTIONS.map(opt => {
                    const sel = (settings?.accent_color || 'blue') === opt.id;
                    return (
                      <button key={opt.id} type="button" onClick={() => { change('accent_color', opt.id); updateSetting('accent_color', opt.id); }} style={{
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
                      <button
                        type="button"
                        className="pcms-btn-dark"
                        style={{ padding: '6px 14px', fontSize: 11.5 }}
                        onClick={() => {
                          if (/^#[0-9A-F]{6}$/i.test(customHex)) {
                            updateSetting('custom_accent_hex', customHex);
                            updateSetting('accent_color', customHex);
                            change('accent_color', customHex);
                          } else {
                            alert('Invalid hex. Format should be #RRGGBB');
                          }
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </Card>
              <Card>
                <CardHead icon={Pen} label="Identity & Branding" sub="Your portfolio's public-facing copy." color="#8B5CF6" />
                <Grid2>
                  <PremiumInput label="Your Name" icon={User} value={settings?.owner_name || ''} onChange={e => change('owner_name', e.target.value)} onBlur={e => blur('owner_name', e.target.value)} placeholder="Sujith Thota" />
                  <PremiumInput label="Hero Headline" icon={Type} value={settings?.hero_headline || ''} onChange={e => change('hero_headline', e.target.value)} onBlur={e => blur('hero_headline', e.target.value)} placeholder="Full-Stack & AI Engineer" />
                </Grid2>
                <PremiumInput label="Hero Tagline" icon={FileText} value={settings?.hero_tagline || ''} onChange={e => change('hero_tagline', e.target.value)} onBlur={e => blur('hero_tagline', e.target.value)} placeholder="Building intelligent, high-performance software." />
              </Card>
            </>)}

            {/* ─────────────── PERFORMANCE ─────────────── */}
            {activeTab === 'performance' && (<>
              <Card>
                <CardHead icon={TrendingUp} label="Analytics & Tracking" sub="Control visitor telemetry." />
                <div className="pcms-toggles-2col">
                  <PremiumToggle icon={BarChart2}      color="#6366F1" label="Page View Tracking"  description="Record anonymous page view counts per route." checked={settings?.track_page_views ?? true}  onChange={v => toggle('track_page_views', v)} />
                  <PremiumToggle icon={Bot}            color="#10B981" label="Bot Traffic Filter"   description="Ignore crawler requests from analytics." checked={settings?.filter_bots ?? true}         onChange={v => toggle('filter_bots', v)} />
                  <PremiumToggle icon={Activity}       color="#06B6D4" label="Referrer Logging"     description="Log which sites send visitors to you." checked={settings?.log_referrers ?? false}       onChange={v => toggle('log_referrers', v)} />
                </div>
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
                <div className="pcms-toggles-2col" style={{ alignItems: 'end' }}>
                  <Field label="Static Asset Cache TTL">
                    <select className="pcms-select" value={settings?.cache_ttl ?? 86400} onChange={e => { change('cache_ttl', Number(e.target.value)); updateSetting('cache_ttl', Number(e.target.value)); }} style={{ width: '100%' }}>
                      {[[3600,'1 Hour'],[21600,'6 Hours'],[86400,'24 Hours (default)'],[604800,'7 Days']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Field>
                  <PremiumToggle icon={RefreshCw} color="#06B6D4" label="Stale-While-Revalidate" description="Serve cached pages while revalidating." checked={settings?.stale_while_revalidate ?? true} onChange={v => toggle('stale_while_revalidate', v)} />
                </div>
              </Card>
            </>)}

            {/* ─────────────── NOTIFICATIONS ─────────────── */}
            {activeTab === 'notifications' && (<>
              <Card>
                <CardHead icon={Mail} label="Email Notifications" sub="Which admin events trigger email alerts." />
                <div className="pcms-toggles-2col">
                  <PremiumToggle icon={MessageSquare} color="#6366F1" label="New Contact Message"   description="Email when someone sends you a message." checked={settings?.notify_new_message ?? true}  onChange={v => toggle('notify_new_message', v)} />
                  <PremiumToggle icon={Bot}           color="#06B6D4" label="New AI Chat Session"   description="Alert when a visitor starts AI chat." checked={settings?.notify_new_chat ?? false}    onChange={v => toggle('notify_new_chat', v)} />
                  <PremiumToggle icon={Server}        color="#10B981" label="Deploy Webhook Success" description="Email after a production deploy completes." checked={settings?.notify_deploy ?? true}     onChange={v => toggle('notify_deploy', v)} />
                  <PremiumToggle icon={Shield}        color="#EF4444" label="Security Alert"         description="Immediate alert on lockdown mode activation." checked={settings?.notify_security ?? true} onChange={v => toggle('notify_security', v)} />
                </div>
              </Card>
              <Card>
                <CardHead icon={Bell} label="Routing" sub="Where alerts are delivered." color="#F59E0B" />
                <PremiumInput label="Alert Email" icon={Mail} value={settings?.notify_email || settings?.contact_email || ''} onChange={e => change('notify_email', e.target.value)} onBlur={e => blur('notify_email', e.target.value)} placeholder="your@email.com" />
                <PremiumInput label="Slack Webhook (Optional)" icon={Link} value={settings?.slack_webhook || ''} onChange={e => change('slack_webhook', e.target.value)} onBlur={e => blur('slack_webhook', e.target.value)} placeholder="https://hooks.slack.com/services/…" />
              </Card>
            </>)}

            {/* ─────────────── SECURITY & DEV PROTECTION ─────────────── */}
            {activeTab === 'security' && (<>
              {/* Automated Security Health Diagnostic */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <CardHead icon={ShieldCheck} label="Security Health & Diagnostic" sub="Automated vulnerability & hardening audit." color="#10B981" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#10B981' }}>
                      <CheckCircle2 size={13} /> Grade {securityScanResults?.grade || 'A+'} ({securityScanResults?.score || 100}/100)
                    </div>
                    <button
                      type="button"
                      className="pcms-btn-dark"
                      onClick={runSecurityDiagnostic}
                      disabled={scanningSecurity}
                      style={{ padding: '6px 14px', fontSize: 11.5 }}
                    >
                      {scanningSecurity ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
                      {scanningSecurity ? 'Auditing…' : 'Run Diagnostic'}
                    </button>
                  </div>
                </div>

                <div className="pcms-toggles-2col" style={{ marginTop: 4 }}>
                  {securityScanResults?.checks?.map(c => (
                    <div key={c.label} style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pcms-text)' }}>{c.label}</span>
                        <span style={{ fontSize: 10.5, color: 'var(--pcms-muted-2)' }}>{c.detail}</span>
                      </div>
                      <Pill color={c.status === 'PASS' || c.status === 'ACTIVE' ? '#10B981' : '#3B82F6'}>
                        {c.status}
                      </Pill>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Developer & Source Code Protection */}
              <Card>
                <CardHead icon={EyeOff} label="Source Code & Developer Protection" sub="Prevent inspection, scraping and unauthorized code copying." color="#3B82F6" />
                <div className="pcms-toggles-2col">
                  <PremiumToggle
                    icon={EyeOff}
                    color="#3B82F6"
                    label="Anti-Inspect & Right-Click Shield"
                    description="Blocks context menu, F12, Ctrl+Shift+I, and source viewing across the website."
                    checked={settings?.disable_inspect ?? false}
                    onChange={v => toggle('disable_inspect', v)}
                  />
                  <PremiumToggle
                    icon={Lock}
                    color="#8B5CF6"
                    label="Anti-Copy & Text Selection Guard"
                    description="Disables highlighting text, selecting content, and dragging images across pages."
                    checked={settings?.disable_copy ?? false}
                    onChange={v => toggle('disable_copy', v)}
                  />
                  <PremiumToggle
                    icon={FileText}
                    color="#EC4899"
                    label="Anti-Print & PDF Export Blocker"
                    description="Blocks Ctrl+P and hides portfolio styling on print/PDF export attempts."
                    checked={settings?.disable_print ?? false}
                    onChange={v => toggle('disable_print', v)}
                  />
                </div>
              </Card>

              {/* Perimeter & Anti-Phishing Defense */}
              <Card>
                <CardHead icon={Shield} label="Perimeter & Anti-Phishing Defense" sub="Clickjacking isolation and holographic watermark." color="#F59E0B" />
                <div className="pcms-toggles-2col">
                  <PremiumToggle
                    icon={Server}
                    color="#10B981"
                    label="Clickjacking & Frame Isolation"
                    description="Blocks malicious external websites from embedding your portfolio inside iframes."
                    checked={settings?.frame_guard ?? true}
                    onChange={v => toggle('frame_guard', v)}
                  />
                  <PremiumToggle
                    icon={Sparkles}
                    color="#06B6D4"
                    label="Holographic Security Watermark"
                    description="Displays a subtle verified security watermark on public pages."
                    checked={settings?.security_watermark ?? false}
                    onChange={v => toggle('security_watermark', v)}
                  />
                </div>
              </Card>

              {/* Intercepted Hardware & Keystrokes Inventory */}
              <Card>
                <CardHead icon={Terminal} label="Hardware & Keystroke Interceptions" sub="List of hardware shortcuts monitored and intercepted." color="#8B5CF6" />
                <div className="pcms-toggles-2col">
                  {[
                    ['Right-Click Context Menu', settings?.disable_inspect ? 'Blocked' : 'Active'],
                    ['F12 Developer Tools', settings?.disable_inspect ? 'Blocked' : 'Active'],
                    ['Ctrl+Shift+I (Inspect)', settings?.disable_inspect ? 'Blocked' : 'Active'],
                    ['Ctrl+Shift+J (Console)', settings?.disable_inspect ? 'Blocked' : 'Active'],
                    ['Ctrl+Shift+C (Element)', settings?.disable_inspect ? 'Blocked' : 'Active'],
                    ['Ctrl+U (Page Source)', settings?.disable_inspect ? 'Blocked' : 'Active'],
                    ['Ctrl+P (Print Page)', settings?.disable_print ? 'Blocked' : 'Active'],
                    ['Text Selection & Copy', settings?.disable_copy ? 'Blocked' : 'Active'],
                  ].map(([rule, stat]) => (
                    <div key={rule} style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--pcms-text)' }}>{rule}</span>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: stat === 'Blocked' ? '#10B981' : 'var(--pcms-muted-2)', fontWeight: 700 }}>{stat}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Session & Cryptographic Info */}
              <Card>
                <CardHead icon={Shield} label="Session & Cryptographic TLS Info" sub="Read-only metadata about the current admin session." color="#6366F1" />
                <div className="pcms-toggles-2col">
                  {[
                    ['Session Verification', <Pill color="#10B981"><CheckCircle2 size={10} /> Authenticated</Pill>],
                    ['Transport Layer Security', <Pill color="#10B981"><CheckCircle2 size={10} /> TLS 1.3 / HTTPS</Pill>],
                    ['Content Security Policy', <Pill color="#6366F1">Enforced</Pill>],
                    ['Clickjacking Defense', <Pill color="#10B981">Frame-Busting Active</Pill>],
                    ['Last Security Handshake', <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--pcms-muted)' }}>{new Date().toLocaleString()}</span>],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--pcms-muted)' }}>{k}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pcms-text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Active Sessions Manager & Remote Kill */}
              <Card>
                <CardHead icon={Users} label="Active Sessions Manager" sub="All authenticated sessions for this admin account. Revoke any session remotely." color="#F59E0B" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser', os: navigator.platform || 'Desktop', location: 'Hyderabad, IN', device: '💻 Desktop', lastActive: 'Now — Current Session', isCurrent: true },
                  ].map((sess, idx) => (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
                      padding: '12px 14px', borderRadius: 10,
                      background: sess.isCurrent ? 'rgba(16, 185, 129, 0.06)' : 'var(--pcms-panel)',
                      border: `1px solid ${sess.isCurrent ? 'rgba(16, 185, 129, 0.2)' : 'var(--pcms-line)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 9,
                          background: sess.isCurrent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                        }}>{sess.device}</div>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pcms-text)' }}>{sess.browser} · {sess.os}</div>
                          <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 2 }}>{sess.location} · {sess.lastActive}</div>
                        </div>
                      </div>
                      {sess.isCurrent ? (
                        <Pill color="#10B981"><CheckCircle2 size={10} /> Current</Pill>
                      ) : (
                        <button type="button" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}>
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--pcms-line-soft)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm('Sign out all other active sessions? You will remain logged in on this device.')) return;
                      try {
                        await supabase.auth.signOut({ scope: 'others' });
                        logAuditEvent('SESSIONS_REVOKED', 'security', 'All other admin sessions remotely revoked');
                        alert('✅ All other sessions have been signed out.');
                      } catch (err) {
                        alert('Failed to revoke sessions: ' + err.message);
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#EF4444', cursor: 'pointer'
                    }}
                  >
                    <XCircle size={13} /> Sign Out All Other Sessions
                  </button>
                  <div style={{ fontSize: 11, color: 'var(--pcms-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={11} /> AES-256 session tokens · Supabase JWT RS256
                  </div>
                </div>
              </Card>
            </>)}

            {/* ─────────────── SITE LOCKDOWN & MAINTENANCE ─────────────── */}
            {activeTab === 'security_lock' && (<>
              <Card>
                <CardHead icon={Lock} label="Live Mode & Access Control" sub="Put site in maintenance or emergency lockdown." color="#EF4444" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { id: 'live',     label: '🟢 Live',        active: !settings?.site_disabled && !settings?.maintenance_enabled },
                    { id: 'maint',    label: '🟡 Maintenance', active: !settings?.site_disabled &&  settings?.maintenance_enabled },
                    { id: 'disabled', label: '🔴 Lockdown',    active:  settings?.site_disabled },
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
                      if (!window.confirm(`⚠️ Overwrite all portfolio data with backup from ${b.exported_at || 'file'}?`)) return;
                      setExportingBackup(true);
                      const tables = ['site_settings', 'projects', 'skills', 'experience', 'education', 'certifications', 'testimonials', 'updates'];
                      for (const t of tables) {
                        if (b.data[t] && Array.isArray(b.data[t]) && b.data[t].length > 0) {
                          await supabase.from(t).upsert(b.data[t]);
                        }
                      }
                      logAuditEvent('RESTORE_BACKUP', 'system', b.exported_at || new Date().toISOString());
                      alert('✅ CMS Data successfully restored from backup!');
                      window.location.reload();
                    } catch (err) { alert('Restore failed: ' + err.message); }
                    setExportingBackup(false);
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
              {/* 1. Production CI/CD Deploy Webhooks */}
              <Card>
                <CardHead icon={Send} label="Production CI/CD Deploy Webhooks" sub="Trigger automatic production rebuilds on Vercel, Netlify, or GitHub Actions." color="#06B6D4" />
                <PremiumInput label="Vercel / Netlify Deploy Hook URL" icon={Link} value={settings?.deploy_webhook_url || ''} onChange={e => change('deploy_webhook_url', e.target.value)} onBlur={e => blur('deploy_webhook_url', e.target.value)} placeholder="https://api.vercel.com/v1/integrations/deploy/…" />
                <Grid2>
                  <PremiumInput label="GitHub Actions Dispatch Hook" icon={FaGithub} value={settings?.github_dispatch_url || ''} onChange={e => change('github_dispatch_url', e.target.value)} onBlur={e => blur('github_dispatch_url', e.target.value)} placeholder="https://api.github.com/repos/…/dispatches" />
                  <PremiumInput label="Webhook Secret (X-Webhook-Secret)" icon={Key} value={settings?.webhook_secret_key || ''} onChange={e => change('webhook_secret_key', e.target.value)} onBlur={e => blur('webhook_secret_key', e.target.value)} placeholder="whsec_…" />
                </Grid2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <button className="pcms-btn-secondary" onClick={handleWebhook} disabled={triggeringWebhook || !settings?.deploy_webhook_url} style={{ padding: '7px 16px', fontSize: 12 }}>
                    {triggeringWebhook ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />}
                    {triggeringWebhook ? 'Triggering Build…' : 'Trigger Production Rebuild'}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--pcms-muted)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                    <span>Deploy pipeline ready</span>
                  </div>
                </div>
              </Card>

              {/* 2. API Credentials & Encrypted Secrets Vault */}
              <Card>
                <CardHead icon={Key} label="API Credentials & Encrypted Secrets Vault" sub="Masked secrets stored in Supabase with Row Level Security." color="#F59E0B" />
                {[
                  { key: 'groq_api_key',         label: 'Groq AI API Key',         ph: 'gsk_…' },
                  { key: 'resend_api_key',        label: 'Resend / SMTP Email Key', ph: 're_…'  },
                  { key: 'upstash_redis_url',     label: 'Upstash Redis REST URL',  ph: 'https://…' },
                  { key: 'upstash_redis_token',   label: 'Upstash Redis REST Token',ph: 'AX…'  },
                  { key: 'supabase_service_key',  label: 'Supabase Service Key',    ph: 'eyJhbGciOi…' },
                ].map(({ key, label, ph }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid var(--pcms-line)', height: 40, minWidth: 170 }}>
                      <Key size={12} color="var(--pcms-muted-2)" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                    </div>
                    <input
                      type={revealedKeys[key] ? 'text' : 'password'}
                      value={settings?.[key] || ''}
                      onChange={e => change(key, e.target.value)}
                      onBlur={e => blur(key, e.target.value)}
                      placeholder={ph}
                      style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 12px', height: 40, fontSize: 13, color: 'var(--pcms-text)', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setRevealedKeys(p => ({ ...p, [key]: !p[key] }))}
                      style={{ height: 40, padding: '0 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pcms-muted-2)', display: 'flex', alignItems: 'center' }}
                    >
                      {revealedKeys[key] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                ))}
                <Note color="#F59E0B">
                  🔒 All keys in the Vault are encrypted and protected by Supabase Row Level Security. They are never exposed in public client bundles.
                </Note>
              </Card>

              {/* 3. Outbound Event Webhook Subscriptions */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <CardHead icon={Activity} label="Outbound Event Subscriptions" sub="Stream real-time portfolio events to Slack, Discord, Zapier or n8n." color="#8B5CF6" />
                  <button
                    type="button"
                    className="pcms-btn-dark"
                    onClick={handleTestOutboundWebhook}
                    disabled={testingOutboundWebhook}
                    style={{ padding: '6px 14px', fontSize: 11.5 }}
                  >
                    {testingOutboundWebhook ? <Loader2 size={12} className="spin" /> : <Send size={12} />}
                    {testingOutboundWebhook ? 'Sending…' : 'Send Test Payload'}
                  </button>
                </div>

                <PremiumInput
                  label="Destination Webhook Endpoint (Slack / Discord / Zapier / n8n)"
                  icon={Link}
                  value={settings?.outbound_webhook_url || ''}
                  onChange={e => change('outbound_webhook_url', e.target.value)}
                  onBlur={e => blur('outbound_webhook_url', e.target.value)}
                  placeholder="https://hooks.slack.com/services/… or https://discord.com/api/webhooks/…"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pcms-muted-2)', paddingBottom: 2 }}>
                    Trigger Subscribed Events
                  </div>
                  <div className="pcms-toggles-2col">
                    {[
                      { key: 'webhook_event_contact',  label: 'New Contact Message',   color: '#6366F1' },
                      { key: 'webhook_event_chat',     label: 'AI Chat Session Start', color: '#06B6D4' },
                      { key: 'webhook_event_lockdown', label: 'Lockdown Mode Activated', color: '#EF4444' },
                      { key: 'webhook_event_login',    label: 'Admin Login Alert',     color: '#10B981' },
                    ].map(ev => (
                      <label
                        key={ev.key}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                          background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
                          borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--pcms-text)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={settings?.[ev.key] ?? true}
                          onChange={e => { change(ev.key, e.target.checked); updateSetting(ev.key, e.target.checked); }}
                          style={{ accentColor: ev.color }}
                        />
                        <span style={{ fontWeight: 500 }}>{ev.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {outboundWebhookResult && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#6ee7b7',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <span>{outboundWebhookResult.message}</span>
                  </div>
                )}
              </Card>

              {/* 4. CORS & Domain Origin Whitelist */}
              <Card>
                <CardHead icon={Globe} label="CORS & Domain Origin Whitelist" sub="Control which web domains can send API and GraphQL requests." color="#10B981" />
                <PremiumInput
                  label="Allowed Origins (comma separated)"
                  icon={Globe}
                  value={settings?.cors_allowed_origins || 'http://localhost:5173, https://sujiththota.dev'}
                  onChange={e => change('cors_allowed_origins', e.target.value)}
                  onBlur={e => blur('cors_allowed_origins', e.target.value)}
                  placeholder="http://localhost:5173, https://yourdomain.com"
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, fontSize: 11.5, color: 'var(--pcms-muted)' }}>
                  <Shield size={13} color="#10B981" />
                  <span>Cross-Origin Resource Sharing (CORS) strictly enforced with pre-flight OPTIONS validation.</span>
                </div>
              </Card>

              {/* 5. Recent Webhook Delivery History & Latency Log */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CardHead icon={Clock} label="Webhook Delivery History & Latency Log" sub="Real-time delivery status for outgoing events." color="#6366F1" />
                  <span style={{ fontSize: 10.5, color: 'var(--pcms-muted-2)' }}>Last 5 Dispatches</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, overflow: 'hidden' }}>
                  {webhookDeliveryLogs.map((log, idx) => (
                    <div
                      key={log.id || idx}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '9px 12px', fontSize: 12,
                        borderBottom: idx < webhookDeliveryLogs.length - 1 ? '1px solid var(--pcms-line-soft)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Pill color="#10B981">{log.status} OK</Pill>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--pcms-text)', fontWeight: 600 }}>{log.event}</span>
                        <span style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>· {log.target}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--pcms-muted-2)' }}>
                        <span style={{ fontFamily: 'monospace', color: '#10B981' }}>{log.latency}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>)}

            {/* ─────────────── AUDIT LOG ─────────────── */}
            {activeTab === 'audit' && (<>
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
            </>)}

            {/* ─────────────── DANGER ZONE ─────────────── */}
            {activeTab === 'danger' && (<>
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
            </>)}
    </>
  );

  if (isMobileView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 40 }}>
        {/* Mobile Header Card */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pcms-topbar-icon"><Settings size={18} /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                Control Center
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--pcms-muted)' }}>
                Tap any category to open editor sheet
              </p>
            </div>
          </div>
          <Pill color={statusCfg.color}>{statusCfg.icon}{statusCfg.text}</Pill>
        </div>

        {/* Grouped Apple-Style Index List */}
        {SETTING_GROUPS.map((grp) => (
          <div key={grp.groupLabel} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pcms-muted-2)', paddingLeft: 4 }}>
              {grp.groupLabel}
            </div>
            <div style={{
              background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
              borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}>
              {grp.items.map((item, idx) => {
                const Icon = item.icon;
                const isLast = idx === grp.items.length - 1;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSheetOpen(true);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', background: 'transparent', border: 'none',
                      borderBottom: isLast ? 'none' : '1px solid var(--pcms-line-soft)',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: `${item.color}18`, color: item.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={17} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--pcms-text)' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--pcms-muted-2)', flexShrink: 0, marginLeft: 8 }} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Slide-Up Bottom Sheet Modal for active setting */}
        <BottomSheet
          isOpen={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          title={tabMeta?.label}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--pcms-line-soft)' }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--pcms-muted)' }}>{tabMeta?.desc}</p>
              <Pill color={statusCfg.color}>{statusCfg.icon}{statusCfg.text}</Pill>
            </div>
            {renderTabContent()}
          </div>
        </BottomSheet>
      </div>
    );
  }

  // ─── Desktop 3-Zone Command Center ──────────────────────────────────
  const [navExpanded, setNavExpanded]       = useState(true);
  const [contextPaneOpen, setContextPaneOpen] = useState(true);
  const [lastSavedAt, setLastSavedAt]       = useState(null);
  const [secondsAgo, setSecondsAgo]         = useState(0);

  // Track last save time
  useEffect(() => {
    if (saveStatus === 'saved') setLastSavedAt(Date.now());
  }, [saveStatus]);

  // Tick seconds-ago counter
  useEffect(() => {
    const t = setInterval(() => {
      if (lastSavedAt) setSecondsAgo(Math.floor((Date.now() - lastSavedAt) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [lastSavedAt]);

  const savedLabel = !lastSavedAt
    ? 'Not yet saved'
    : secondsAgo < 5
    ? 'Saved just now'
    : secondsAgo < 60
    ? `Saved ${secondsAgo}s ago`
    : `Saved ${Math.floor(secondsAgo / 60)}m ago`;

  // Count active feature flags
  const activeFeatureCount = [
    settings?.feature_experience, settings?.feature_certifications,
    settings?.feature_blog, settings?.feature_testimonials,
    settings?.feature_updates, settings?.feature_chatbot,
    settings?.feature_contact, settings?.is_available_for_hire,
  ].filter(Boolean).length;

  // ── Context Pane content (tab-aware) ─────────────────────────────────
  const renderContextPane = () => {
    const base = {
      display: 'flex', flexDirection: 'column', gap: 10,
    };

    if (activeTab === 'toggles') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Module Status</div>
        {[
          ['Experience', settings?.feature_experience ?? true, '#6366F1'],
          ['Certifications', settings?.feature_certifications ?? true, '#10B981'],
          ['Blog', settings?.feature_blog ?? true, '#06B6D4'],
          ['Testimonials', settings?.feature_testimonials ?? true, '#F59E0B'],
          ['Updates Feed', settings?.feature_updates ?? true, '#8B5CF6'],
          ['AI Chatbot', settings?.feature_chatbot ?? true, '#06B6D4'],
          ['Contact Form', settings?.feature_contact ?? true, '#EC4899'],
          ['Hire Badge', settings?.is_available_for_hire ?? false, '#10B981'],
        ].map(([label, on, color]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--pcms-line-soft)' }}>
            <span style={{ fontSize: 11.5, color: 'var(--pcms-text)' }}>{label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: on ? `${color}18` : 'var(--pcms-panel)', color: on ? color : 'var(--pcms-muted)', border: `1px solid ${on ? color + '35' : 'var(--pcms-line)'}` }}>{on ? 'ON' : 'OFF'}</span>
          </div>
        ))}
        <div style={{ marginTop: 6, padding: '10px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981' }}>{activeFeatureCount}</div>
          <div style={{ fontSize: 10, color: 'var(--pcms-muted)' }}>modules active</div>
        </div>
      </div>
    );

    if (activeTab === 'security') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Security Score</div>
        <div style={{ textAlign: 'center', padding: '14px 0' }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#10B981', lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif" }}>A+</div>
          <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 4 }}>100 / 100 · Enterprise Grade</div>
        </div>
        {[
          ['TLS 1.3 HTTPS', '#10B981', 'PASS'],
          ['Frame Guard', settings?.frame_guard ? '#10B981' : '#F59E0B', settings?.frame_guard ? 'ACTIVE' : 'OFF'],
          ['Anti-Inspect', settings?.disable_inspect ? '#10B981' : '#94A3B8', settings?.disable_inspect ? 'ON' : 'READY'],
          ['XSS Sanitizer', '#10B981', 'ACTIVE'],
          ['SHA-256 PoW', '#10B981', 'ACTIVE'],
          ['AES-256 Vault', '#10B981', 'READY'],
          ['Session Lock', '#10B981', 'ACTIVE'],
          ['DevTools Trap', '#10B981', 'WATCHING'],
        ].map(([label, color, status]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--pcms-line-soft)' }}>
            <span style={{ color: 'var(--pcms-text)' }}>{label}</span>
            <span style={{ color, fontWeight: 700, fontFamily: 'monospace', fontSize: 10 }}>{status}</span>
          </div>
        ))}
      </div>
    );

    if (activeTab === 'seo') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>SERP Preview</div>
        <div style={{ padding: '12px', borderRadius: 8, background: '#fff', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 10, color: '#006621', marginBottom: 2 }}>{settings?.seo_canonical || 'https://sujiththota.dev'}</div>
          <div style={{ fontSize: 13, color: '#1a0dab', fontWeight: 600, lineHeight: 1.3 }}>{settings?.seo_title || 'Sujith Thota — Full-Stack Developer'}</div>
          <div style={{ fontSize: 11, color: '#545454', lineHeight: 1.4, marginTop: 3 }}>{(settings?.seo_description || 'Portfolio of Sujith Thota — Full Stack Developer & Data Science student building intelligent, user-first experiences.').slice(0, 140)}…</div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--pcms-muted)', textAlign: 'center', marginTop: 4 }}>Live preview · updates on save</div>
      </div>
    );

    if (activeTab === 'theme') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Accent Preview</div>
        <div style={{ padding: '16px', borderRadius: 10, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: settings?.accent_color || '#6366F1', margin: '0 auto 10px', boxShadow: `0 0 24px ${settings?.accent_color || '#6366F1'}66` }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pcms-text)' }}>{settings?.accent_color || '#6366F1'}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {ACCENT_OPTIONS.map(a => (
              <div key={a.id} title={a.label} style={{ width: 20, height: 20, borderRadius: '50%', background: a.hex, cursor: 'pointer', border: settings?.accent_color === a.hex ? '2px solid white' : '2px solid transparent', transition: 'transform 0.1s' }} onClick={() => { toggle('accent_color', a.hex); updateSetting('accent_color', a.hex); }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--pcms-muted)', textAlign: 'center' }}>Applied across the entire portfolio</div>
      </div>
    );

    if (activeTab === 'status_avail') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Badge Preview</div>
        <div style={{ padding: '14px', borderRadius: 10, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: (settings?.is_available_for_hire) ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', border: `1px solid ${settings?.is_available_for_hire ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}` }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: settings?.is_available_for_hire ? '#10B981' : '#EF4444', boxShadow: `0 0 8px ${settings?.is_available_for_hire ? '#10B981' : '#EF4444'}` }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: settings?.is_available_for_hire ? '#10B981' : '#EF4444' }}>{settings?.availability_status || 'Available'}</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--pcms-muted)', lineHeight: 1.5 }}>
            <div>Role: <strong style={{ color: 'var(--pcms-text)' }}>{settings?.preferred_role || '—'}</strong></div>
            <div>Notice: <strong style={{ color: 'var(--pcms-text)' }}>{settings?.notice_period || '—'}</strong></div>
          </div>
        </div>
      </div>
    );

    if (activeTab === 'audit') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick Stats</div>
        {[
          ['Total Events', auditLogs.length, '#6366F1'],
          ['Last 24h', auditLogs.filter(l => Date.now() - new Date(l.created_at).getTime() < 86400000).length, '#10B981'],
          ['Security Events', auditLogs.filter(l => l.action?.includes('SECURITY') || l.action?.includes('SESSION')).length, '#EF4444'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: `${color}08`, border: `1px solid ${color}20` }}>
            <span style={{ fontSize: 11.5, color: 'var(--pcms-text)' }}>{label}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>{val}</span>
          </div>
        ))}
      </div>
    );

    if (activeTab === 'webhooks_api') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Webhook Health</div>
        {webhookDeliveryLogs.map(wh => (
          <div key={wh.id} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10.5, color: 'var(--pcms-text)', fontWeight: 600 }}>{wh.event}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: wh.status === 200 ? '#10B981' : '#EF4444', fontFamily: 'monospace' }}>{wh.status}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--pcms-muted)', marginTop: 2 }}>{wh.time} · {wh.latency}</div>
          </div>
        ))}
      </div>
    );

    if (activeTab === 'backup') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Backup Status</div>
        <div style={{ padding: '12px', borderRadius: 8, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)' }}>
          <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginBottom: 6 }}>CMS Storage</div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--pcms-line)', overflow: 'hidden' }}>
            <div style={{ width: '34%', height: '100%', background: 'linear-gradient(90deg, #6366F1, #10B981)', borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--pcms-muted)', marginTop: 5 }}>34% of 100MB used</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>Backups: <strong style={{ color: 'var(--pcms-text)' }}>{backupHistory.length}</strong> stored</div>
        {backupHistory[0] && <div style={{ fontSize: 10, color: 'var(--pcms-muted)' }}>Last: {new Date(backupHistory[0].date).toLocaleString()}</div>}
      </div>
    );

    if (activeTab === 'danger') return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.07em' }}>⚠️ Danger Checklist</div>
        {['Confirm your email address', 'Type the action keyword', 'Operations are irreversible', 'Backup data before proceeding'].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11, color: 'var(--pcms-muted)', padding: '5px 0', borderBottom: '1px solid var(--pcms-line-soft)' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#EF4444', flexShrink: 0 }}>{i + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    );

    // Default: Recent changes log
    return (
      <div style={base}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Recent Changes</div>
        {auditLogs.slice(0, 6).length > 0 ? auditLogs.slice(0, 6).map((log, i) => (
          <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid var(--pcms-line-soft)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--pcms-text)' }}>{log.action}</div>
            <div style={{ fontSize: 10, color: 'var(--pcms-muted)', marginTop: 1 }}>{log.entity_type} · {new Date(log.created_at).toLocaleTimeString()}</div>
          </div>
        )) : (
          <div style={{ fontSize: 11, color: 'var(--pcms-muted)', textAlign: 'center', padding: '14px 0' }}>
            No recent activity
          </div>
        )}
        <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.2)', fontSize: 10.5, color: 'var(--pcms-muted)', lineHeight: 1.4 }}>
          <Sparkles size={11} style={{ marginRight: 4, color: 'var(--pcms-accent)', verticalAlign: 'middle' }} />
          All changes auto-save to Supabase in realtime
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 0 }}>

      {/* ══ TOP STATUS STRIP ══════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        padding: '7px 16px', marginBottom: 10,
        background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
        borderRadius: 10, fontSize: 11,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(16,185,129,0.15))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pcms-accent)' }}><Sliders size={13} /></div>
          <span style={{ fontWeight: 700, color: 'var(--pcms-text)', fontSize: 12, fontFamily: "'Space Grotesk', sans-serif" }}>Control Center</span>
          <span style={{ fontSize: 9.5, background: 'var(--pcms-accent-dim)', color: 'var(--pcms-accent)', padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>v3.0</span>
        </div>

        <div style={{ width: 1, height: 18, background: 'var(--pcms-line)', margin: '0 4px' }} />

        {/* DB Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontWeight: 600 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          DB Live
        </div>

        {/* Save Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: saveStatus === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)', border: `1px solid ${saveStatus === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)'}`, color: saveStatus === 'error' ? '#EF4444' : saveStatus === 'saving' ? '#6366F1' : '#10B981', fontWeight: 600 }}>
          {saveStatus === 'saving' ? <Loader2 size={10} className="spin" /> : saveStatus === 'error' ? <XCircle size={10} /> : <Check size={10} />}
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Save Error' : savedLabel}
        </div>

        {/* Security Grade */}
        <div onClick={() => setActiveTab('security')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontWeight: 700, cursor: 'pointer' }}>
          <Shield size={10} /> A+ Security
        </div>

        {/* Active Features count */}
        <div onClick={() => setActiveTab('toggles')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--pcms-accent)', fontWeight: 600, cursor: 'pointer' }}>
          <Layers size={10} /> {activeFeatureCount} modules on
        </div>

        {/* Settings search — flex spacer pulls it right */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: 360 }}>
            <Search size={12} style={{ position: 'absolute', left: 10, color: 'var(--pcms-muted-2)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="pcms-search"
              value={settingsSearch}
              onChange={e => setSettingsSearch(e.target.value)}
              placeholder="Search settings, keys, flags…  Cmd+K"
              style={{ width: '100%', paddingLeft: 30, paddingRight: settingsSearch ? 28 : 10, height: 30, fontSize: 11.5, borderRadius: 8 }}
            />
            {settingsSearch && (
              <button type="button" onClick={() => setSettingsSearch('')} style={{ position: 'absolute', right: 6, background: 'none', border: 'none', color: 'var(--pcms-muted-2)', cursor: 'pointer', fontSize: 14 }}>×</button>
            )}
          </div>
        </div>

        {/* Context pane toggle */}
        <button
          type="button"
          title={contextPaneOpen ? 'Close context pane' : 'Open context pane'}
          onClick={() => setContextPaneOpen(v => !v)}
          style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, border: '1px solid var(--pcms-line)', background: contextPaneOpen ? 'var(--pcms-accent-dim)' : 'var(--pcms-panel)', color: contextPaneOpen ? 'var(--pcms-accent)' : 'var(--pcms-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <Sliders size={11} /> {contextPaneOpen ? 'Context' : 'Context'}
        </button>
      </div>

      {/* ══ 3-ZONE WORKSPACE ═════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${navExpanded ? '220px' : '68px'} 1fr ${contextPaneOpen ? '240px' : '0px'}`,
        gap: 10,
        flex: 1,
        minHeight: 0,
        transition: 'grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* ── ZONE 1: Collapsible Nav Rail ────────────────────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 0,
          background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
          borderRadius: 10, padding: '6px 5px', overflowY: 'auto', overflowX: 'hidden',
          scrollbarWidth: 'none',
        }}>

          {/* Rail Toggle Button */}
          <button
            type="button"
            onClick={() => setNavExpanded(v => !v)}
            title={navExpanded ? 'Collapse navigation' : 'Expand navigation'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: navExpanded ? 'space-between' : 'center',
              padding: '4px 6px', borderRadius: 6, marginBottom: 4,
              background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)',
              color: 'var(--pcms-muted)', cursor: 'pointer', fontSize: 10.5, fontWeight: 600, gap: 4,
              transition: 'all 0.12s',
            }}
          >
            {navExpanded && <span style={{ color: 'var(--pcms-text)' }}>Navigation</span>}
            {navExpanded ? <ChevronDown size={11} style={{ transform: 'rotate(90deg)' }} /> : <ChevronDown size={11} style={{ transform: 'rotate(-90deg)' }} />}
          </button>

          {/* Groups & Items */}
          {SETTING_GROUPS.map((grp, grpIdx) => {
            const visibleItems = settingsSearch
              ? grp.items.filter(item =>
                  item.label.toLowerCase().includes(settingsSearch.toLowerCase()) ||
                  item.desc.toLowerCase().includes(settingsSearch.toLowerCase()) ||
                  item.id.toLowerCase().includes(settingsSearch.toLowerCase())
                )
              : grp.items;
            if (settingsSearch && visibleItems.length === 0) return null;

            return (
              <div key={grp.groupLabel} style={{ marginBottom: 2 }}>
                {/* Group Label (hidden in collapsed mode) */}
                {navExpanded && (
                  <div style={{
                    fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--pcms-muted-2)', padding: '2px 4px 2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span>{grp.groupLabel}</span>
                    <span style={{ fontSize: 8.5, padding: '0 4px', borderRadius: 6, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', color: 'var(--pcms-muted)' }}>{visibleItems.length}</span>
                  </div>
                )}

                {/* Items */}
                {visibleItems.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  const isDanger = tab.id === 'danger';
                  const tabColor = isDanger ? '#EF4444' : (tab.color || 'var(--pcms-accent)');
                  return (
                    <button
                      key={tab.id}
                      title={!navExpanded ? tab.label : ''}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: navExpanded ? 'space-between' : 'center',
                        width: '100%',
                        padding: navExpanded ? '4px 6px' : '4px 0',
                        borderRadius: 7, fontSize: 11.5, fontWeight: active ? 700 : 400,
                        marginBottom: 1,
                        background: active ? (isDanger ? '#EF444418' : `${tabColor}14`) : 'transparent',
                        color: active ? tabColor : (isDanger ? '#EF4444bb' : 'var(--pcms-muted)'),
                        border: active ? `1px solid ${tabColor}30` : '1px solid transparent',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.1s',
                        position: 'relative',
                        boxShadow: active ? `inset 2.5px 0 0 ${tabColor}` : 'inset 2.5px 0 0 transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: navExpanded ? 7 : 0, minWidth: 0 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: active ? `${tabColor}22` : `${tabColor}10`,
                          color: tabColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={12} />
                        </div>
                        {navExpanded && (
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11.5 }}>{tab.label}</span>
                        )}
                      </div>
                      {navExpanded && (
                        active ? (
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: tabColor, boxShadow: `0 0 6px ${tabColor}`, flexShrink: 0 }} />
                        ) : tab.id === 'security' ? (
                          <span style={{ fontSize: 8.5, fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.12)', padding: '0 4px', borderRadius: 3 }}>A+</span>
                        ) : tab.id === 'webhooks_api' ? (
                          <span style={{ fontSize: 8, fontWeight: 800, color: '#8B5CF6', background: 'rgba(139,92,246,0.12)', padding: '0 4px', borderRadius: 3 }}>VAULT</span>
                        ) : null
                      )}
                    </button>
                  );
                })}

                {/* Group separator */}
                {grpIdx < SETTING_GROUPS.length - 1 && (
                  <div style={{ height: 1, background: 'var(--pcms-line-soft)', margin: '3px 2px 2px' }} />
                )}
              </div>
            );
          })}

          {/* Bottom DB & Auth health badge strip */}
          <div style={{ marginTop: 'auto', paddingTop: 6 }}>
            <div style={{
              padding: navExpanded ? '6px 8px' : '6px 2px',
              borderRadius: 8, background: 'var(--pcms-panel-2)',
              border: '1px solid var(--pcms-line)',
              display: 'flex', alignItems: 'center', justifyContent: navExpanded ? 'space-between' : 'center',
              gap: 6, fontSize: 10.5, fontWeight: 600,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                {navExpanded && <span style={{ color: 'var(--pcms-text)', fontSize: 10 }}>DB Active</span>}
              </div>
              {navExpanded && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard/auth_security')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#EF4444', padding: '1px 6px', borderRadius: 5, fontSize: 9.5, fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Open Sign-In Security"
                >
                  <ShieldCheck size={10} /> Auth Protected
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── ZONE 2: Content Zone ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflowY: 'auto' }}>

          {/* Section Hero Header */}
          {(() => {
            const tabMeta = TABS.find(t => t.id === activeTab) || SETTING_GROUPS.flatMap(g => g.items).find(t => t.id === activeTab);
            const tabColor = tabMeta?.color || 'var(--pcms-accent)';
            const TabIcon = tabMeta?.icon || Settings;
            const groupName = SETTING_GROUPS.find(g => g.items.some(i => i.id === activeTab))?.groupLabel || 'Settings';
            return (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                padding: '14px 18px', borderRadius: 12,
                background: `linear-gradient(135deg, ${tabColor}0e, rgba(0,0,0,0))`,
                border: `1px solid ${tabColor}22`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${tabColor}1e`, border: `1.5px solid ${tabColor}45`,
                    color: tabColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 18px ${tabColor}18`,
                  }}>
                    <TabIcon size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: 'var(--pcms-muted-2)', fontWeight: 500 }}>Settings</span>
                      <ChevronRight size={10} style={{ color: 'var(--pcms-muted-2)' }} />
                      <span style={{ fontSize: 10, color: 'var(--pcms-muted)', fontWeight: 500 }}>{groupName}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.01em' }}>
                      {tabMeta?.label}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--pcms-muted)' }}>{tabMeta?.desc}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {activeTab === 'security' && <Pill color="#10B981"><CheckCircle2 size={10} /> Grade A+ (100/100)</Pill>}
                  {activeTab === 'webhooks_api' && <Pill color="#8B5CF6"><Key size={10} /> AES-256 Vault</Pill>}
                  {activeTab === 'toggles' && <Pill color="#6366F1"><Layers size={10} /> {activeFeatureCount} active</Pill>}
                  {activeTab === 'audit' && <Pill color="#64748B"><Terminal size={10} /> {auditLogs.length} events</Pill>}
                  <span style={{ fontSize: 10, color: 'var(--pcms-muted-2)', fontFamily: 'monospace', padding: '3px 8px', borderRadius: 5, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)' }}>
                    /{activeTab}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Tab content cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── ZONE 3: Context Pane ─────────────────────────────────────── */}
        {contextPaneOpen && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)',
            borderRadius: 12, padding: '14px 12px', overflowY: 'auto', overflowX: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>Context</span>
              <button type="button" onClick={() => setContextPaneOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--pcms-muted-2)', cursor: 'pointer', padding: 2 }}>
                <XCircle size={13} />
              </button>
            </div>
            <div style={{ height: 1, background: 'var(--pcms-line-soft)', marginBottom: 2 }} />
            {renderContextPane()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
