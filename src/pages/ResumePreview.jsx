import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Printer, Download, ArrowLeft, Mail, MapPin, Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { trackRecruiterEvent } from '../lib/analyticsTracker';

export default function ResumePreview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    settings: null,
    experiences: [],
    skills: [],
    education: [],
    certifications: [],
    projects: []
  });

  useEffect(() => {
    fetchResumeData();
    trackRecruiterEvent('resume_preview_view', 'Opened Dynamic PDF Resume Generator');
  }, []);

  const fetchResumeData = async () => {
    setLoading(true);
    const [sett, exp, sk, edu, cert, proj] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase.from('experience').select('*').order('display_order', { ascending: true }),
      supabase.from('skills').select('*').order('order_index', { ascending: true }),
      supabase.from('education').select('*').order('display_order', { ascending: true }),
      supabase.from('certifications').select('*').order('display_order', { ascending: true }),
      supabase.from('projects').select('*').order('display_order', { ascending: true })
    ]);

    setData({
      settings: sett.data || {},
      experiences: exp.data || [],
      skills: sk.data || [],
      education: edu.data || [],
      certifications: cert.data || [],
      projects: proj.data || []
    });
    setLoading(false);
  };

  const handlePrint = () => {
    trackRecruiterEvent('resume_download', 'Printed/Saved Resume PDF');
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <Loader2 className="spin" size={36} color="#3b82f6" />
        <p style={{ marginTop: 16, fontSize: 14, opacity: 0.8 }}>Generating Dynamic Resume from Supabase...</p>
      </div>
    );
  }

  const { settings, experiences, skills, education, certifications, projects } = data;

  return (
    <div className="resume-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          .resume-paper { box-shadow: none !important; margin: 0 !important; width: 100% !important; padding: 0 !important; }
          .resume-container { padding: 0 !important; background: #fff !important; }
        }

        .resume-container {
          min-height: 100vh;
          background: #0f172a;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .action-bar {
          position: fixed;
          top: 20px;
          display: flex;
          gap: 12px;
          background: rgba(30, 41, 59, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 99px;
          z-index: 1000;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-btn:hover { background: #2563eb; transform: translateY(-1px); }

        .action-btn-secondary {
          background: rgba(255,255,255,0.1);
          color: #e2e8f0;
        }
        .action-btn-secondary:hover { background: rgba(255,255,255,0.2); }

        .resume-paper {
          background: #ffffff;
          color: #1e293b;
          width: 800px;
          min-height: 1050px;
          padding: 48px;
          border-radius: 4px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          margin-top: 60px;
          box-sizing: border-box;
        }

        .resume-header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }

        .resume-name {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .resume-tagline {
          font-size: 14px;
          color: #3b82f6;
          font-weight: 600;
          margin: 4px 0 12px;
        }

        .contact-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 12px;
          color: #64748b;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0f172a;
          border-bottom: 1.5px solid #0f172a;
          padding-bottom: 4px;
          margin: 24px 0 14px;
        }

        .exp-item {
          margin-bottom: 16px;
        }
        .exp-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 14px;
          color: #0f172a;
        }
        .exp-sub {
          font-size: 13px;
          color: #475569;
          margin: 2px 0 6px;
          display: flex;
          justify-content: space-between;
        }
        .exp-desc {
          font-size: 12.5px;
          line-height: 1.5;
          color: #334155;
          margin: 0;
        }

        .skills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .skill-pill {
          background: #f1f5f9;
          color: #334155;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 600;
        }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
      `}</style>

      {/* Action Bar */}
      <div className="action-bar no-print">
        <button className="action-btn action-btn-secondary" onClick={() => window.history.back()}>
          <ArrowLeft size={14} /> Back
        </button>
        <button className="action-btn" onClick={handlePrint}>
          <Printer size={14} /> Print / Save PDF
        </button>
      </div>

      {/* Paper Content */}
      <div className="resume-paper">
        {/* Header */}
        <div className="resume-header">
          <h1 className="resume-name">Sujith Thota</h1>
          <p className="resume-tagline">{settings.hero_headline || 'Data Science & Full Stack Software Engineer'}</p>
          
          <div className="contact-grid">
            <div className="contact-item"><Mail size={12} /> sujiththota@example.com</div>
            <div className="contact-item"><MapPin size={12} /> Vellore / Andhra Pradesh, India</div>
            <div className="contact-item"><Globe size={12} /> sujith-thota.vercel.app</div>
            <div className="contact-item"><FaGithub size={12} /> github.com/sujith1546</div>
            <div className="contact-item"><FaLinkedin size={12} /> linkedin.com/in/sujith-thota</div>
          </div>
        </div>

        {/* Experience */}
        {experiences.length > 0 && (
          <div>
            <h2 className="section-title">Professional Experience</h2>
            {experiences.map(exp => (
              <div key={exp.id} className="exp-item">
                <div className="exp-header">
                  <span>{exp.role}</span>
                  <span>{exp.period}</span>
                </div>
                <div className="exp-sub">
                  <span>{exp.company} • {exp.type || 'Full-time'}</span>
                  <span>{exp.location}</span>
                </div>
                <p className="exp-desc">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="section-title">Key Projects</h2>
            {projects.slice(0, 3).map(proj => (
              <div key={proj.id} className="exp-item">
                <div className="exp-header">
                  <span>{proj.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>{proj.tech_stack ? proj.tech_stack.join(', ') : ''}</span>
                </div>
                <p className="exp-desc">{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Two Column Layout for Education & Skills */}
        <div className="two-col">
          {/* Education */}
          <div>
            <h2 className="section-title">Education</h2>
            {education.map(edu => (
              <div key={edu.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{edu.title}</div>
                <div style={{ fontSize: 12, color: '#475569' }}>{edu.institution} ({edu.year})</div>
                {edu.score && <div style={{ fontSize: 11.5, color: '#3b82f6', fontWeight: 600 }}>{edu.score}</div>}
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div>
            <h2 className="section-title">Certifications</h2>
            {certifications.map(cert => (
              <div key={cert.id} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: '#0f172a' }}>{cert.title}</div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>{cert.issuer} • {cert.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="section-title">Technical Skills</h2>
          <div className="skills-wrap">
            {skills.map(sk => (
              <span key={sk.id} className="skill-pill">
                {sk.name} ({sk.level_label || 'Proficient'})
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
