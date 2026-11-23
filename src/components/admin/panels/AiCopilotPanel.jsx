import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Loader2, Zap, FileText, Star, Briefcase, Award, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import Groq from 'groq-sdk';

function getGroqClient() {
  const key = localStorage.getItem('pcms_groq_api_key') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY : '') || '';
  if (!key) return null;
  return new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
}

const CONTENT_TYPES = [
  { value: 'project', label: 'Project Description', icon: Briefcase, prompt: 'Write a punchy 2-3 sentence portfolio project description emphasizing technical impact, architecture, and metrics. 40-65 words.' },
  { value: 'skill', label: 'Skill Summary', icon: Star, prompt: 'Write a concise skill proficiency statement for a portfolio. 1-2 sentences, focus on real-world engineering experience and applications.' },
  { value: 'about', label: 'About Me', icon: FileText, prompt: 'Write a compelling About Me paragraph for a Data Scientist & Full-Stack Developer portfolio. 60-80 words, first person, professional and impactful.' },
  { value: 'experience', label: 'Experience Bullet', icon: Zap, prompt: 'Transform this into a powerful resume-style bullet point with strong action verb and quantifiable outcome. One crisp sentence.' },
  { value: 'cert', label: 'Certification Note', icon: Award, prompt: 'Write a brief 1-sentence description of this certification highlighting the exact verified competencies.' },
];

const TEMPLATES = [
  { label: 'Project Hero Text', icon: Briefcase, color: '#10B981', text: 'Built a privacy-first RAG pipeline using Gemini 2.5 Flash and ChromaDB to analyze financial SMS patterns with sub-2s SLA and 99.4% precision.' },
  { label: 'Skills Summary', icon: Star, color: '#6366F1', text: 'Specialized in Python, PyTorch, LangChain, and ChromaDB for end-to-end LLM application engineering and production vector search architectures.' },
  { label: 'Experience Highlight', icon: Zap, color: '#F59E0B', text: 'Engineered distributed microservices with FastAPI and Celery, cutting API latency by 35% across 200k daily requests.' },
  { label: 'Achievement Statement', icon: Award, color: '#EC4899', text: 'Ranked in top 1% across national technical hackathons, delivering automated fraud detection models with 94.8% ROC-AUC score.' },
];

export default function AiCopilotPanel() {
  const [inputText, setInputText] = useState('');
  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const hasApiKey = !!(
    (typeof window !== 'undefined' && localStorage.getItem('pcms_groq_api_key')) ||
    (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GROQ_API_KEY)
  );

  const handleEnhance = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const client = getGroqClient();
      if (!client) {
        throw new Error('No Groq API key configured. Please enter your key in Settings → Webhooks & Vault or set VITE_GROQ_API_KEY.');
      }
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an elite tech portfolio copywriter for a high-performing software engineer & AI/ML practitioner. Output ONLY the requested content — no conversational filler, no quotes, no markdown wrappers.' },
          { role: 'user', content: `${contentType.prompt}\n\nDraft input:\n"${inputText}"` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.35,
        max_tokens: 220,
      });
      setResult(completion.choices[0]?.message?.content?.trim() || '');
    } catch (e) {
      setError(e.message || 'AI generation failed. Please check your network connection and API key.');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>AI Content Co-Pilot</h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--pcms-muted)' }}>Draft, polish and elevate your portfolio copy with AI</p>
          </div>
        </div>
      </motion.div>

      {/* API Key Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 14px',
        borderRadius: 8,
        background: hasApiKey ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${hasApiKey ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
      }}>
        {hasApiKey ? <CheckCircle2 size={15} color="#10B981" /> : <AlertCircle size={15} color="#EF4444" />}
        <span style={{ fontSize: 12, fontWeight: 600, color: hasApiKey ? '#10B981' : '#EF4444' }}>
          {hasApiKey ? 'Groq LLaMA 3.1 Connected — Ready for instant generation' : 'Groq API Key not detected — Configure in Settings → Webhooks & Vault or .env'}
        </span>
      </div>

      {/* Main Generator Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pcms-panel-card">
        <div className="pcms-panel-header">
          <div className="pcms-panel-title-row">
            <div className="pcms-panel-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}><Sparkles size={15} /></div>
            <div>
              <div className="pcms-panel-title">Copywriting Studio</div>
              <div className="pcms-panel-subtitle">Select content target and provide rough bullets</div>
            </div>
          </div>
        </div>
        <div className="pcms-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Target Selector */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pcms-muted)', display: 'block', marginBottom: 6 }}>Target Category</label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(p => !p)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 8,
                background: 'var(--pcms-panel-2)',
                border: '1px solid var(--pcms-line)',
                cursor: 'pointer',
                color: 'var(--pcms-text)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <contentType.icon size={15} style={{ color: 'var(--pcms-accent, #6366f1)' }} />
                {contentType.label}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--pcms-muted)', transform: showTypeDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <AnimatePresence>
              {showTypeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: 'var(--pcms-panel)',
                    border: '1px solid var(--pcms-line)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginTop: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
                  }}
                >
                  {CONTENT_TYPES.map(ct => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => { setContentType(ct); setShowTypeDropdown(false); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        border: 'none',
                        background: contentType.value === ct.value ? 'var(--pcms-panel-2)' : 'transparent',
                        cursor: 'pointer',
                        color: 'var(--pcms-text)',
                        fontSize: 13,
                        fontWeight: contentType.value === ct.value ? 700 : 500,
                        textAlign: 'left'
                      }}
                    >
                      <ct.icon size={14} style={{ color: contentType.value === ct.value ? 'var(--pcms-accent)' : 'var(--pcms-muted)' }} />
                      {ct.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input text */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pcms-muted)', display: 'block', marginBottom: 6 }}>Rough Notes / Bullets / Keywords</label>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g. built a fast SMS classifier using Python, chroma vector db, gemini 2.5 flash, handles 600 req/hr with 2s latency..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--pcms-line)',
                background: 'var(--pcms-panel-2)',
                color: 'var(--pcms-text)',
                fontSize: 13,
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleEnhance}
            disabled={loading || !inputText.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              background: loading || !inputText.trim() ? 'var(--pcms-line)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
            {loading ? 'Generating with AI...' : '✨ Elevate & Polish with AI'}
          </button>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* Output Card */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '14px',
                  borderRadius: 10,
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6366F1' }}>
                    ✨ AI Output
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: copied ? 'rgba(16,185,129,0.12)' : 'var(--pcms-panel)',
                      border: '1px solid var(--pcms-line)',
                      color: copied ? '#10B981' : 'var(--pcms-muted)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: 'var(--pcms-text)', whiteSpace: 'pre-wrap' }}>
                  {result}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Starter Templates */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pcms-panel-card">
        <div className="pcms-panel-header">
          <div className="pcms-panel-title-row">
            <div className="pcms-panel-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}><FileText size={15} /></div>
            <div>
              <div className="pcms-panel-title">Quick Starter Templates</div>
              <div className="pcms-panel-subtitle">Click any sample to load draft copy into the editor</div>
            </div>
          </div>
        </div>
        <div className="pcms-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {TEMPLATES.map(t => (
              <motion.button
                key={t.label}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputText(t.text)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--pcms-panel-2)',
                  border: '1px solid var(--pcms-line)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${t.color}18`, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <t.icon size={14} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pcms-text)' }}>{t.label}</span>
                <span style={{ fontSize: 11, color: 'var(--pcms-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
