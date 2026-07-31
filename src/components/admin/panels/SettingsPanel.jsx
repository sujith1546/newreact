import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { logAuditEvent } from '../../../lib/auditLogger';
import { 
  Loader2, Check, Settings, Layers, Briefcase, Award, Sparkles, Bell, 
  MessageSquare, User, Type, FileText, Globe, Image, Link, Mail, Upload, 
  Zap, Calendar, ShieldAlert, Sliders, ArrowRight, Lock, Database, Key, 
  Palette, Send, RefreshCw, AlertTriangle
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumToggle, PremiumInput } from '../shared/components';
import { useTheme } from '../../../context/ThemeContext';

const SETTINGS_TABS = [
  { id: 'toggles', label: 'Feature Toggles', icon: Layers, description: 'Enable or disable core site modules' },
  { id: 'status_avail', label: 'Status & Availability', icon: Zap, description: 'Current active project & hiring availability' },
  { id: 'banner', label: 'Announcement', icon: Bell, description: 'Global banner notification text' },
  { id: 'seo', label: 'SEO & Discovery', icon: Globe, description: 'Meta titles, description & OpenGraph image' },
  { id: 'links', label: 'Links & Assets', icon: Link, description: 'Contact email, social URLs & PDF resume' },
  { id: 'security_lock', label: 'Security & Lock', icon: Lock, description: 'Unified Maintenance & Full Site Lockdown' },
  { id: 'backup', label: 'Backup & Export', icon: Database, description: '1-Click JSON dataset export' },
  { id: 'webhooks_api', label: 'Webhooks & Vault', icon: Key, description: 'Deploy webhooks & API credentials vault' },
  { id: 'theme', label: 'Theme & Accent', icon: Palette, description: 'Public portfolio primary accent color' },
];

const ACCENT_OPTIONS = [
  { id: 'blue', label: 'Indigo / Blue', hex: '#6366F1' },
  { id: 'emerald', label: 'Emerald Green', hex: '#10B981' },
  { id: 'cyan', label: 'Cyan Neon', hex: '#06B6D4' },
  { id: 'rose', label: 'Rose Pink', hex: '#EC4899' },
  { id: 'amber', label: 'Amber Gold', hex: '#F59E0B' },
  { id: 'purple', label: 'Violet Purple', hex: '#8B5CF6' },
];

export default function SettingsPanel() {
  const { data: dbSettings, setData: setDbSettings, loading } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [triggeringWebhook, setTriggeringWebhook] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('toggles');

  const { accentColor, setAccentColor } = useTheme();

  useEffect(() => {
    if (dbSettings && !settings) {
      const localDisabled = localStorage.getItem('pcms_site_disabled');
      const localReason = localStorage.getItem('pcms_site_disabled_reason');
      const localAt = localStorage.getItem('pcms_site_disabled_at');

      setSettings({
        ...dbSettings,
        site_disabled: dbSettings.site_disabled !== undefined ? dbSettings.site_disabled : (localDisabled === 'true'),
        site_disabled_reason: dbSettings.site_disabled_reason || localReason || 'Access to this website has been disabled by the administrator.',
        site_disabled_at: dbSettings.site_disabled_at || localAt || null,
      });
    }
  }, [dbSettings, settings]);

  const updateSetting = async (key, value) => {
    setSaving(true);
    if (key === 'site_disabled') localStorage.setItem('pcms_site_disabled', String(value));
    if (key === 'site_disabled_reason') localStorage.setItem('pcms_site_disabled_reason', String(value));
    if (key === 'site_disabled_at') localStorage.setItem('pcms_site_disabled_at', String(value));
    window.dispatchEvent(new Event('storage'));

    const { error } = await supabase.from('site_settings').update({ [key]: value }).eq('id', 1);
    setTimeout(() => setSaving(false), 400); 

    if (error) {
      if (error.message?.includes('schema cache') || error.code === 'PGRST204' || error.message?.includes('column')) {
        console.warn(`Supabase column missing for ${key}. Saved locally.`);
      } else {
        alert(`Failed to save ${key}: ` + error.message);
      }
    } else {
      logAuditEvent('UPDATE_SETTINGS', 'site_settings', key);
    }
  };

  const handleToggleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    updateSetting(key, value);
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleInputBlur = (key, value) => {
    if (dbSettings && dbSettings[key] !== value) {
      updateSetting(key, value);
      setDbSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    const safeName = `resume_${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('portfolio-assets').upload(safeName, file, { upsert: true });
    
    if (!error) {
      const publicUrl = supabase.storage.from('portfolio-assets').getPublicUrl(safeName).data.publicUrl;
      const newSettings = { ...settings, resume_url: publicUrl };
      setSettings(newSettings);
      setDbSettings(newSettings);
      await supabase.from('site_settings').update({ resume_url: publicUrl }).eq('id', 1);
      logAuditEvent('UPLOAD_RESUME', 'storage', safeName);
    } else {
      alert(`Upload failed: ${error.message}`);
    }
    setUploadingResume(false);
    e.target.value = '';
  };

  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      const tables = ['projects', 'blog_posts', 'skills', 'experience', 'education', 'certifications', 'testimonials', 'updates', 'site_settings'];
      const backupObj = {
        exported_at: new Date().toISOString(),
        version: '2.0',
        environment: 'Production CMS',
        data: {}
      };

      for (const t of tables) {
        const { data } = await supabase.from(t).select('*');
        backupObj.data[t] = data || [];
      }

      const jsonStr = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio_cms_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      logAuditEvent('EXPORT_BACKUP', 'system', 'Full JSON Dataset Export');
    } catch (e) {
      alert('Export failed: ' + e.message);
    }
    setExportingBackup(false);
  };

  const handleTriggerDeployWebhook = async () => {
    const url = settings?.deploy_webhook_url;
    if (!url) {
      alert('Please enter a valid Deploy Webhook URL first.');
      return;
    }
    setTriggeringWebhook(true);
    try {
      await fetch(url, { method: 'POST' });
      alert('🚀 Deploy webhook triggered successfully! Your build provider has started compilation.');
      logAuditEvent('TRIGGER_DEPLOY', 'webhooks', url);
    } catch (e) {
      alert('Failed to trigger webhook: ' + e.message);
    }
    setTriggeringWebhook(false);
  };

  if (loading || !settings) return (
    <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
      <Loader2 className="spin" size={24} color="var(--pcms-accent)" />
    </div>
  );

  const activeTabMeta = SETTINGS_TABS.find(t => t.id === activeSubTab);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 10, padding: '14px 20px' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--pcms-text)', margin: 0, fontFamily: "'Space Grotesk', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} color="var(--pcms-accent)" /> Control Center Settings
          </h2>
          <p style={{ margin: '2px 0 0', color: 'var(--pcms-muted)', fontSize: 11.5 }}>Configure site modules, deployment webhooks, security mode, and system backups.</p>
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', 
          background: saving ? 'var(--pcms-green-dim)' : 'var(--pcms-panel-2)', 
          borderRadius: 20, color: saving ? 'var(--pcms-green)' : 'var(--pcms-muted)',
          fontWeight: 600, fontSize: 11.5, border: '1px solid var(--pcms-line)'
        }}>
          {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
          <span>{saving ? 'Saving...' : 'Saved'}</span>
        </div>
      </div>

      {/* Sub-sidebar layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left Sub-sidebar Navigation */}
        <div style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 10, padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pcms-muted-2)', padding: '6px 10px', fontWeight: 700 }}>
            Categories
          </div>
          {SETTINGS_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 8, fontSize: 12,
                  background: isActive ? 'var(--pcms-accent-dim)' : 'transparent',
                  color: isActive ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
                  fontWeight: isActive ? 600 : 400, border: 'none', cursor: 'pointer',
                  textAlign: 'left', width: '100%', transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 10, padding: 20, minHeight: 400 }}>
          {/* Active section header */}
          <div style={{ borderBottom: '1px solid var(--pcms-line-soft)', paddingBottom: 12, marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--pcms-text)', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              {activeTabMeta?.label}
            </h3>
            <p style={{ fontSize: 11.5, color: 'var(--pcms-muted)', margin: '3px 0 0' }}>
              {activeTabMeta?.description}
            </p>
          </div>

          {/* Section 1: Toggles */}
          {activeSubTab === 'toggles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
              <PremiumToggle 
                label="Experience Module" description="Display work history & career timeline on public portfolio."
                icon={Briefcase} color="#6366F1"
                checked={settings?.feature_experience ?? true} 
                onChange={val => handleToggleChange('feature_experience', val)} 
              />
              <PremiumToggle 
                label="Certifications Module" description="Display credentials & industry awards."
                icon={Award} color="#10B981"
                checked={settings?.feature_certifications ?? true} 
                onChange={val => handleToggleChange('feature_certifications', val)} 
              />
              <PremiumToggle 
                label="Available for Hire Badge" description="Show prominent 'Open for Opportunities' pill."
                icon={Sparkles} color="#8B5CF6"
                checked={settings?.is_available_for_hire ?? false} 
                onChange={val => handleToggleChange('is_available_for_hire', val)} 
              />
            </div>
          )}

          {/* Section 2: Status & Availability */}
          {activeSubTab === 'status_avail' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
              <div style={{ padding: 14, background: 'var(--pcms-panel-2)', borderRadius: 8, border: '1px solid var(--pcms-line)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--pcms-text)', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Current Active Project</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <PremiumInput
                    label="Project Name" icon={FileText}
                    value={settings?.current_project || ''}
                    onChange={e => handleInputChange('current_project', e.target.value)}
                    onBlur={e => handleInputBlur('current_project', e.target.value)}
                    placeholder="e.g. AI Portfolio Engine v2.0"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Status</label>
                      <select
                        className="pcms-select"
                        value={settings?.current_project_status || 'In Progress'}
                        onChange={e => { handleInputChange('current_project_status', e.target.value); updateSetting('current_project_status', e.target.value); }}
                        style={{ width: '100%' }}
                      >
                        {['Planning', 'In Progress', 'Testing', 'Deployed', 'On Hold'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Progress %</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 36 }}>
                        <input
                          type="range" min={0} max={100} step={5}
                          value={settings?.current_project_pct ?? 0}
                          onChange={e => handleInputChange('current_project_pct', Number(e.target.value))}
                          onMouseUp={e => handleInputBlur('current_project_pct', Number(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pcms-green)' }}>{settings?.current_project_pct ?? 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 14, background: 'var(--pcms-panel-2)', borderRadius: 8, border: '1px solid var(--pcms-line)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--pcms-text)', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Hiring & Availability</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Hiring Status</label>
                    <select
                      className="pcms-select"
                      value={settings?.availability_status || 'Available'}
                      onChange={e => { handleInputChange('availability_status', e.target.value); updateSetting('availability_status', e.target.value); }}
                      style={{ width: '100%' }}
                    >
                      {['Available', 'Open to Part-time', 'In a Role', 'Busy', 'Actively Looking'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Available From</label>
                    <input
                      type="date"
                      className="pcms-search"
                      value={settings?.availability_from || ''}
                      onChange={e => handleInputChange('availability_from', e.target.value)}
                      onBlur={e => handleInputBlur('availability_from', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Announcement */}
          {activeSubTab === 'banner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
              <PremiumToggle 
                label="Enable Global Banner" description="Displays a prominent announcement bar at the top of the site."
                icon={Bell} color="#F59E0B"
                checked={settings?.announcement_enabled ?? false} 
                onChange={val => handleToggleChange('announcement_enabled', val)} 
              />
              {settings?.announcement_enabled && (
                <PremiumInput 
                  label="Banner Text" icon={MessageSquare}
                  value={settings?.announcement_text || ''} 
                  onChange={e => handleInputChange('announcement_text', e.target.value)}
                  onBlur={e => handleInputBlur('announcement_text', e.target.value)}
                  placeholder="e.g., Currently open for Full-Time Lead Frontend & Fullstack Roles!"
                />
              )}
            </div>
          )}

          {/* Section 4: SEO */}
          {activeSubTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
              <PremiumInput 
                label="Meta Title" icon={Type} 
                value={settings?.seo_title || ''} 
                onChange={e => handleInputChange('seo_title', e.target.value)}
                onBlur={e => handleInputBlur('seo_title', e.target.value)}
                placeholder="Sujith Thota | Portfolio & Software Engineer" 
              />
              <PremiumInput 
                label="Meta Description" icon={FileText} multiline 
                value={settings?.seo_description || ''} 
                onChange={e => handleInputChange('seo_description', e.target.value)}
                onBlur={e => handleInputBlur('seo_description', e.target.value)}
                placeholder="High-performance web software engineer portfolio showcasing full-stack projects..." 
              />
              <PremiumInput 
                label="OpenGraph Image URL" icon={Image} 
                value={settings?.seo_og_image || ''} 
                onChange={e => handleInputChange('seo_og_image', e.target.value)}
                onBlur={e => handleInputBlur('seo_og_image', e.target.value)}
                placeholder="https://..." 
              />
            </div>
          )}

          {/* Section 5: Links & Resume */}
          {activeSubTab === 'links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
              <PremiumInput 
                label="Contact Email" icon={Mail} 
                value={settings?.contact_email || ''} 
                onChange={e => handleInputChange('contact_email', e.target.value)}
                onBlur={e => handleInputBlur('contact_email', e.target.value)}
                placeholder="sujithreddy1546@gmail.com" 
              />
              <PremiumInput 
                label="GitHub URL" icon={FaGithub} 
                value={settings?.github_url || ''} 
                onChange={e => handleInputChange('github_url', e.target.value)}
                onBlur={e => handleInputBlur('github_url', e.target.value)}
                placeholder="https://github.com/..." 
              />
              <PremiumInput 
                label="LinkedIn URL" icon={FaLinkedin} 
                value={settings?.linkedin_url || ''} 
                onChange={e => handleInputChange('linkedin_url', e.target.value)}
                onBlur={e => handleInputBlur('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/..." 
              />
              
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>PDF Resume Asset</label>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                  background: 'var(--pcms-panel-2)', borderRadius: 8, border: '1px dashed var(--pcms-line)'
                }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <FileText size={16} color="var(--pcms-accent)" />
                    <span style={{ fontSize: 12, color: settings?.resume_url ? 'var(--pcms-text)' : 'var(--pcms-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {settings?.resume_url || 'No resume uploaded yet'}
                    </span>
                  </div>
                  <input type="file" id="resume-upload" accept="application/pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
                  <button type="button" onClick={() => document.getElementById('resume-upload').click()} className="pcms-btn-dark" style={{ padding: '6px 12px', fontSize: 11 }}>
                    {uploadingResume ? <Loader2 size={13} className="spin" /> : <Upload size={13} />} 
                    {uploadingResume ? 'Uploading...' : 'Upload New'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Security & Unified Lock */}
          {activeSubTab === 'security_lock' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
              {/* Lock Mode Selector */}
              <div style={{ background: 'var(--pcms-panel-2)', borderRadius: 10, border: '1px solid var(--pcms-line)', padding: 16 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Lock size={15} color="var(--pcms-red)" /> Unified System Security & Lock Control
                </h4>
                <p style={{ fontSize: 11.5, color: 'var(--pcms-muted)', margin: '0 0 14px' }}>
                  Choose public access state. Admin console (`/admin/*`) always remains accessible.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                  {[
                    { id: 'live', label: '🟢 Live Site', active: !settings?.site_disabled && !settings?.maintenance_enabled },
                    { id: 'maint', label: '🟡 Maintenance', active: !settings?.site_disabled && settings?.maintenance_enabled },
                    { id: 'lockdown', label: '🔴 Full Lock', active: !!settings?.site_disabled },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        if (mode.id === 'live') {
                          localStorage.setItem('pcms_maint_enabled', 'false');
                          localStorage.setItem('pcms_site_disabled', 'false');
                          handleToggleChange('site_disabled', false);
                          handleToggleChange('maintenance_enabled', false);
                        } else if (mode.id === 'maint') {
                          localStorage.setItem('pcms_maint_enabled', 'true');
                          localStorage.setItem('pcms_site_disabled', 'false');
                          handleToggleChange('site_disabled', false);
                          handleToggleChange('maintenance_enabled', true);
                        } else if (mode.id === 'lockdown') {
                          const now = new Date().toISOString();
                          localStorage.setItem('pcms_site_disabled', 'true');
                          localStorage.setItem('pcms_maint_enabled', 'false');
                          localStorage.setItem('pcms_site_disabled_at', now);
                          handleToggleChange('maintenance_enabled', false);
                          handleToggleChange('site_disabled', true);
                          updateSetting('site_disabled_at', now);
                        }
                      }}
                      style={{
                        padding: '10px 8px', borderRadius: 8, border: '1px solid var(--pcms-line)',
                        background: mode.active ? 'var(--pcms-accent-dim)' : 'var(--pcms-panel)',
                        color: mode.active ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
                        fontWeight: mode.active ? 700 : 500, fontSize: 11.5, cursor: 'pointer',
                        textAlign: 'center', transition: 'all 0.15s'
                      }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Maintenance Mode Options */}
                {!settings?.site_disabled && settings?.maintenance_enabled && (
                  <div style={{ paddingTop: 12, borderTop: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-amber)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Estimated Maintenance Time (Minutes)</label>
                      <input
                        type="number"
                        min={1}
                        className="pcms-search"
                        value={settings?.maintenance_eta ?? 20}
                        onChange={e => handleInputChange('maintenance_eta', Number(e.target.value))}
                        onBlur={e => handleInputBlur('maintenance_eta', Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-amber)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Custom Maintenance Message (Optional)</label>
                      <textarea
                        rows={2}
                        value={settings?.maintenance_message || ''}
                        onChange={e => handleInputChange('maintenance_message', e.target.value)}
                        onBlur={e => handleInputBlur('maintenance_message', e.target.value)}
                        placeholder="e.g. We are performing scheduled database upgrades..."
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}

                {/* Full Lockdown Options */}
                {settings?.site_disabled && (
                  <div style={{ paddingTop: 12, borderTop: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-red)', textTransform: 'uppercase' }}>Full Lockdown Reason Message</label>
                    <textarea
                      rows={2}
                      value={settings?.site_disabled_reason || ''}
                      onChange={e => handleInputChange('site_disabled_reason', e.target.value)}
                      onBlur={e => handleInputBlur('site_disabled_reason', e.target.value)}
                      placeholder="Access to this website has been disabled by the administrator."
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 7: Backup & Export */}
          {activeSubTab === 'backup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
              <div style={{ padding: 18, background: 'var(--pcms-panel-2)', borderRadius: 10, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--pcms-accent-dim)', color: 'var(--pcms-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>1-Click Full CMS Backup</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--pcms-muted)' }}>Export all 9 portfolio tables into a single timestamped JSON file.</p>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--pcms-muted)', lineHeight: 1.5 }}>
                  Includes Projects, Blog Posts, Skills, Experience, Education, Certifications, Testimonials, Updates, and Settings.
                </div>
                <button type="button" onClick={handleExportBackup} disabled={exportingBackup} className="pcms-btn-dark" style={{ width: 'fit-content', padding: '9px 18px' }}>
                  {exportingBackup ? <Loader2 size={14} className="spin" /> : <Database size={14} />}
                  {exportingBackup ? 'Generating Backup...' : 'Download CMS Backup (.json)'}
                </button>
              </div>
            </div>
          )}

          {/* Section 8: Webhooks & API Vault */}
          {activeSubTab === 'webhooks_api' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
              <div style={{ padding: 16, background: 'var(--pcms-panel-2)', borderRadius: 10, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Send size={15} color="var(--pcms-cyan)" /> Deploy Webhooks
                </h4>
                <PremiumInput
                  label="Vercel / Netlify Deploy Hook URL" icon={Link}
                  value={settings?.deploy_webhook_url || ''}
                  onChange={e => handleInputChange('deploy_webhook_url', e.target.value)}
                  onBlur={e => handleInputBlur('deploy_webhook_url', e.target.value)}
                  placeholder="https://api.vercel.com/v1/integrations/deploy/..."
                />
                <button type="button" onClick={handleTriggerDeployWebhook} disabled={triggeringWebhook} className="pcms-btn-secondary" style={{ width: 'fit-content' }}>
                  {triggeringWebhook ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />}
                  {triggeringWebhook ? 'Triggering...' : 'Trigger Production Rebuild'}
                </button>
              </div>

              <div style={{ padding: 16, background: 'var(--pcms-panel-2)', borderRadius: 10, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Key size={15} color="var(--pcms-amber)" /> API Credentials Vault
                </h4>
                <PremiumInput
                  label="Groq AI API Key (Masked)" icon={Key}
                  type="password"
                  value={settings?.groq_api_key || ''}
                  onChange={e => handleInputChange('groq_api_key', e.target.value)}
                  onBlur={e => handleInputBlur('groq_api_key', e.target.value)}
                  placeholder="gsk_..."
                />
                <PremiumInput
                  label="Resend Email Key" icon={Mail}
                  type="password"
                  value={settings?.resend_api_key || ''}
                  onChange={e => handleInputChange('resend_api_key', e.target.value)}
                  onBlur={e => handleInputBlur('resend_api_key', e.target.value)}
                  placeholder="re_..."
                />
              </div>
            </div>
          )}

          {/* Section 9: Theme & Accent */}
          {activeSubTab === 'theme' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
              <div style={{ padding: 16, background: 'var(--pcms-panel-2)', borderRadius: 10, border: '1px solid var(--pcms-line)' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Palette size={15} color="var(--pcms-accent)" /> Primary Accent Swatch
                </h4>
                <p style={{ fontSize: 11.5, color: 'var(--pcms-muted)', margin: '0 0 14px' }}>Select the primary accent color for public portfolio highlights and badges.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {ACCENT_OPTIONS.map(opt => {
                    const isSelected = accentColor === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setAccentColor(opt.id);
                          updateSetting('accent_color', opt.id);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '9px 12px', borderRadius: 8,
                          background: isSelected ? 'var(--pcms-panel)' : 'transparent',
                          border: `1px solid ${isSelected ? opt.hex : 'var(--pcms-line)'}`,
                          color: 'var(--pcms-text)', fontSize: 12, fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: opt.hex, flexShrink: 0 }} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
