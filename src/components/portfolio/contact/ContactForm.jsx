import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Loader2, ChevronRight, Send } from 'lucide-react';

const shakeVariants = {
  shake: { x: [-4, 4, -4, 4, 0], transition: { duration: 0.35 } },
  idle: { x: 0 }
};

export const SwipeToSend = ({ onSend, status, isFormValid, triggerValidation }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = (event, info) => {
    if (status === "sending") return;
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const knobWidth = 44;
    const padding = 12;
    const maxDrag = containerWidth - knobWidth - padding;
    
    if (info.offset.x >= maxDrag * 0.75) {
      if (!isFormValid) {
        controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 15 } });
        triggerValidation();
      } else {
        controls.start({ x: maxDrag });
        onSend();
      }
    } else {
      controls.start({ x: 0 });
    }
  };

  useEffect(() => {
    if (status === "idle") controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } });
    if (status === "sending") {
      const containerWidth = containerRef.current?.offsetWidth || 300;
      controls.start({ x: containerWidth - 44 - 12 });
    }
  }, [status, controls]);

  const backgroundFill = useTransform(x, [0, 200], ["rgba(37,99,235,0)", "rgba(37,99,235,0.15)"]);
  const textOpacity = useTransform(x, [0, 120], [1, 0]);

  return (
    <div 
      className="swipe-send-container" 
      ref={containerRef}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <motion.div className="swipe-send-bg" style={{ background: backgroundFill }} />
      <motion.div className="swipe-send-text" style={{ opacity: textOpacity }}>
        Swipe to send
      </motion.div>
      <motion.div
        className="swipe-send-knob"
        drag={status === "sending" ? false : "x"}
        dragConstraints={containerRef}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        whileTap={{ scale: status === "sending" ? 1 : 0.95 }}
      >
        {status === "sending" ? (
          <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <ChevronRight size={20} strokeWidth={2.5} style={{ marginLeft: '2px' }} />
        )}
      </motion.div>
    </div>
  );
};

export default function ContactForm({ form, setForm, errors, touched, setTouched, handleSubmit, status, isMobile }) {
  return (
    <div className="contact-glass-card">
      <div style={{ display: 'none' }}>
        <input
          type="text"
          name="_catch"
          tabIndex={-1}
          autoComplete="off"
          value={form._catch}
          onChange={(e) => setForm(prev => ({ ...prev, _catch: e.target.value }))}
        />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <motion.div className="field-group" animate={errors.name && touched.name ? "shake" : "idle"} variants={shakeVariants}>
          <label className="field-label" htmlFor="name">Your Name</label>
          <input
            id="name"
            type="text"
            className={`modern-input ${errors.name && touched.name ? 'error' : ''}`}
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
          />
          {errors.name && touched.name && <span className="error-text">{errors.name}</span>}
        </motion.div>

        <motion.div className="field-group" animate={errors.email && touched.email ? "shake" : "idle"} variants={shakeVariants}>
          <label className="field-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className={`modern-input ${errors.email && touched.email ? 'error' : ''}`}
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
          />
          {errors.email && touched.email && <span className="error-text">{errors.email}</span>}
        </motion.div>

        <motion.div className="field-group" animate={errors.message && touched.message ? "shake" : "idle"} variants={shakeVariants}>
          <label className="field-label" htmlFor="message">Message</label>
          <textarea
            id="message"
            className={`modern-input ${errors.message && touched.message ? 'error' : ''}`}
            placeholder="Tell me about your project or inquiry..."
            rows={4}
            value={form.message}
            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
            onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
          />
          {errors.message && touched.message && <span className="error-text">{errors.message}</span>}
        </motion.div>

        {isMobile ? (
          <SwipeToSend
            onSend={handleSubmit}
            status={status}
            isFormValid={!errors.name && !errors.email && !errors.message && form.name && form.email && form.message}
            triggerValidation={() => setTouched({ name: true, email: true, message: true })}
          />
        ) : (
          <button type="submit" className="submit-btn" disabled={status === "sending"}>
            {status === "sending" ? (
              <>
                <Loader2 size={18} className="spin" /> Sending...
              </>
            ) : (
              <>
                Send Message <Send size={16} />
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
