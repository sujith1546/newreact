import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Compass, BookOpen, Dumbbell, Gamepad2, Award, Terminal, Layers, Target } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const HOBBIES = [
  { label: 'Strategic Thinking', value: 'Chess Enthusiast', icon: Gamepad2 },
  { label: 'Continuous Learning', value: 'Avid Reader', icon: BookOpen },
  { label: 'Physical Health', value: 'Fitness & Sports', icon: Dumbbell },
  { label: 'Exploration', value: 'Traveling', icon: Compass }
];

export default function MobileAbout() {
  return (
    <div className="mobile-page-about" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
          About Me
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Hello! I'm <strong>Thota Sujith Reddy</strong>, a dedicated B.Tech student at <strong>VIT University, Vellore</strong>. 
          Specializing in <strong>Data Science</strong>, I bridge complex backend data structures and sleek UI experiences.
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <a href="mailto:sujithreddy1546@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textDecoration: 'none' }}>
            <Mail size={14} /> Email
          </a>
          <a href="https://linkedin.com/in/thota-sujith-reddy" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: '#0a66c2', textDecoration: 'none' }}>
            <FaLinkedin size={14} /> LinkedIn
          </a>
          <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textDecoration: 'none' }}>
            <FaGithub size={14} /> GitHub
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
          <Terminal size={20} color="#3b82f6" />
          <h4 style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 2px 0', color: 'var(--text-primary)' }}>3.5+</h4>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Years Coding</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
          <Layers size={20} color="#10b981" />
          <h4 style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 2px 0', color: 'var(--text-primary)' }}>10+</h4>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Projects Shipped</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
          <Target size={20} color="#f59e0b" />
          <h4 style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 2px 0', color: 'var(--text-primary)' }}>200+</h4>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>DSA Solved</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
          <Award size={20} color="#8b5cf6" />
          <h4 style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 2px 0', color: 'var(--text-primary)' }}>8.7</h4>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>CGPA</p>
        </div>
      </div>
    </div>
  );
}
