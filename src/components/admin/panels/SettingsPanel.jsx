import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { logAuditEvent } from '../../../lib/auditLogger';
import { MaintenanceSettingsPanel } from '../../MaintenanceGate';
import { Loader2, Check, Settings, Layers, Briefcase, Award, Sparkles, Bell, MessageSquare, User, Type, FileText, Globe, Image, Link, Mail, Upload, Zap, Calendar, Clock } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumToggle, PremiumInput } from '../shared/components';

export default function SettingsPanel() {
  const { data: dbSettings, setData: setDbSettings, loading } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    // Only update local settings if they haven't been initialized yet
    // This prevents realtime updates from overwriting local state while the user is typing
    if (dbSettings && !settings) {
      setSettings(dbSettings);
    }
  }, [dbSettings, settings]);

  const updateSetting = async (key, value) => {
    setSaving(true);
    // Send only the changed key to Supabase
    const { error } = await supabase.from('site_settings').update({ [key]: value }).eq('id', 1);
    
    // Simulate slight network delay for better UX on fast connections
    setTimeout(() => setSaving(false), 600); 

    if (error) {
      alert(`Failed to save ${key}: ` + error.message);
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
    // Only save if the value actually changed from the DB state
    if (dbSettings && dbSettings[key] !== value) {
      updateSetting(key, value);
      // Manually update the dbSettings cache so we don't save the same thing twice
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

  if (loading || !settings) return (
    <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={32} color="var(--primary-blue)" /></div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="settings-panel-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={28} color="var(--primary-blue)" /> Global Settings
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15 }}>Configure site-wide features, SEO, and personal details.</p>
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', 
          background: saving ? 'color-mix(in srgb, var(--primary-blue) 10%, transparent)' : 'color-mix(in srgb, #10b981 10%, transparent)', 
          borderRadius: 20, color: saving ? 'var(--primary-blue)' : '#10b981',
          fontWeight: 600, fontSize: 14, transition: 'all 0.3s ease'
        }}>
          {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
          {saving ? 'Saving changes...' : 'All changes saved'}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 32 }}>
        
        {/* Section: Feature Flags */}
        <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'color-mix(in srgb, #8b5cf6 10%, transparent)', borderRadius: 10, color: '#8b5cf6' }}><Layers size={18} /></div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Feature Toggles</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <PremiumToggle 
              label="Experience Module" description="Show work history in navigation."
              icon={Briefcase} color="#3b82f6"
              checked={settings?.feature_experience ?? true} 
              onChange={val => handleToggleChange('feature_experience', val)} 
            />
            <PremiumToggle 
              label="Certifications Module" description="Display certificates & awards."
              icon={Award} color="#10b981"
              checked={settings?.feature_certifications ?? true} 
              onChange={val => handleToggleChange('feature_certifications', val)} 
            />
            <PremiumToggle 
              label="Available for Hire" description="Show 'Available' badge on profile."
              icon={Sparkles} color="#8b5cf6"
              checked={settings?.is_available_for_hire ?? false} 
              onChange={val => handleToggleChange('is_available_for_hire', val)} 
            />
          </div>
        </section>

        {/* Section: Currently Working On */}
        <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'color-mix(in srgb, #f59e0b 10%, transparent)', borderRadius: 10, color: '#f59e0b' }}><Zap size={18} /></div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Currently Working On</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <PremiumInput
              label="Project Name" icon={FileText}
              value={settings?.current_project || ''}
              onChange={e => handleInputChange('current_project', e.target.value)}
              onBlur={e => handleInputBlur('current_project', e.target.value)}
              placeholder="e.g. AI Portfolio Chatbot"
            />
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Status</label>
              <select
                value={settings?.current_project_status || 'In Progress'}
                onChange={e => { handleInputChange('current_project_status', e.target.value); updateSetting('current_project_status', e.target.value); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
              >
                {['Planning', 'In Progress', 'Testing', 'Deployed', 'On Hold'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Completion % (0–100)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="range" min={0} max={100} step={5}
                  value={settings?.current_project_pct ?? 0}
                  onChange={e => handleInputChange('current_project_pct', Number(e.target.value))}
                  onMouseUp={e => handleInputBlur('current_project_pct', Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', minWidth: 36 }}>{settings?.current_project_pct ?? 0}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Availability Status */}
        <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'color-mix(in srgb, #10b981 10%, transparent)', borderRadius: 10, color: '#10b981' }}><Calendar size={18} /></div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Availability Status</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Status Badge</label>
              <select
                value={settings?.availability_status || 'Available'}
                onChange={e => { handleInputChange('availability_status', e.target.value); updateSetting('availability_status', e.target.value); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
              >
                {['Available', 'Open to Part-time', 'In a Role', 'Busy', 'Actively Looking'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Available From (optional)</label>
              <input
                type="date"
                value={settings?.availability_from || ''}
                onChange={e => handleInputChange('availability_from', e.target.value)}
                onBlur={e => handleInputBlur('availability_from', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </section>

        {/* Section: Announcement Banner */}
        <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'color-mix(in srgb, #f59e0b 10%, transparent)', borderRadius: 10, color: '#f59e0b' }}><Bell size={18} /></div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Announcement Banner</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PremiumToggle 
              label="Enable Global Banner" description="Displays a prominent message at the top of the site."
              icon={Bell} color="#f59e0b"
              checked={settings?.announcement_enabled ?? false} 
              onChange={val => handleToggleChange('announcement_enabled', val)} 
            />
            <AnimatePresence>
              {settings?.announcement_enabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ paddingTop: 8 }}>
                    <PremiumInput 
                      label="Banner Text" icon={MessageSquare}
                      value={settings?.announcement_text || ''} 
                      onChange={e => handleInputChange('announcement_text', e.target.value)}
                      onBlur={e => handleInputBlur('announcement_text', e.target.value)}
                      placeholder="e.g., Actively seeking Senior Front-End Engineering roles."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
          {/* Section: Personal Info */}
          <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: 8, background: 'color-mix(in srgb, var(--primary-blue) 10%, transparent)', borderRadius: 10, color: 'var(--primary-blue)' }}><User size={18} /></div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Personal Info</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <PremiumInput 
                label="Hero Headline" icon={Type} 
                value={settings?.hero_headline || ''} 
                onChange={e => handleInputChange('hero_headline', e.target.value)}
                onBlur={e => handleInputBlur('hero_headline', e.target.value)}
                placeholder="Full Stack Developer" 
              />
              <PremiumInput 
                label="Short Bio" icon={FileText} multiline 
                value={settings?.short_bio || ''} 
                onChange={e => handleInputChange('short_bio', e.target.value)}
                onBlur={e => handleInputBlur('short_bio', e.target.value)}
                placeholder="Write a brief introduction..." 
              />
            </div>
          </section>

          {/* Section: SEO */}
          <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: 8, background: 'color-mix(in srgb, #06b6d4 10%, transparent)', borderRadius: 10, color: '#06b6d4' }}><Globe size={18} /></div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>SEO & Discovery</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <PremiumInput 
                label="Meta Title" icon={Type} 
                value={settings?.seo_title || ''} 
                onChange={e => handleInputChange('seo_title', e.target.value)}
                onBlur={e => handleInputBlur('seo_title', e.target.value)}
                placeholder="Portfolio | Sujith" 
              />
              <PremiumInput 
                label="Meta Description" icon={FileText} multiline 
                value={settings?.seo_description || ''} 
                onChange={e => handleInputChange('seo_description', e.target.value)}
                onBlur={e => handleInputBlur('seo_description', e.target.value)}
                placeholder="SEO Description..." 
              />
              <PremiumInput 
                label="OpenGraph Image URL" icon={Image} 
                value={settings?.seo_og_image || ''} 
                onChange={e => handleInputChange('seo_og_image', e.target.value)}
                onBlur={e => handleInputBlur('seo_og_image', e.target.value)}
                placeholder="https://..." 
              />
            </div>
          </section>
        </div>

        {/* Section: Links & Resume */}
        <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'color-mix(in srgb, #ec4899 10%, transparent)', borderRadius: 10, color: '#ec4899' }}><Link size={18} /></div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Links & Assets</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <PremiumInput 
              label="Contact Email" icon={Mail} 
              value={settings?.contact_email || ''} 
              onChange={e => handleInputChange('contact_email', e.target.value)}
              onBlur={e => handleInputBlur('contact_email', e.target.value)}
              placeholder="hello@example.com" 
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
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Resume PDF</label>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 12, padding: 8,
                background: 'var(--bg-secondary)', borderRadius: 16, border: '1px dashed var(--border-color)'
              }}>
                <div style={{ flex: 1, paddingLeft: 12, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <FileText size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: 14, color: settings?.resume_url ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {settings?.resume_url || 'No resume uploaded yet'}
                  </span>
                </div>
                <input type="file" id="resume-upload" accept="application/pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
                <button type="button" onClick={() => document.getElementById('resume-upload').click()} 
                  style={{ 
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 
                    padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                  }}>
                  {uploadingResume ? <Loader2 size={16} className="spin" /> : <Upload size={16} />} 
                  {uploadingResume ? 'Uploading...' : 'Upload New'}
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
      
      {/* Spacer before Maintenance panel */}
      <div style={{ height: 32 }} />
      <MaintenanceSettingsPanel />
    </motion.div>
  );
}
