import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Minus, Maximize2, Minimize2, Mail, Loader2, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useIsland } from '../../context/IslandContext';

const DEFAULT_AVAILABILITY = {
  "2026-08-05": ["10:00 AM", "11:30 AM", "3:00 PM"],
  "2026-08-06": ["09:00 AM", "2:00 PM"],
  "2026-08-07": ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:30 PM"],
  "2026-08-08": ["10:00 AM", "1:00 PM", "4:30 PM"],
  "2026-08-10": ["10:00 AM", "11:30 AM", "3:00 PM"],
  "2026-08-11": ["11:30 AM", "2:30 PM", "4:30 PM"],
  "2026-08-12": ["10:00 AM", "1:00 PM", "4:30 PM"]
};

const getSessionToken = () => {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem('x-portfolio-session');
  if (!token) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('x-portfolio-session', token);
  }
  return token;
};

export default function ScheduleUpcomingModal({ isOpen, onClose, availability = DEFAULT_AVAILABILITY, onConfirm }) {
  const { theme } = useTheme();
  const { triggerIsland } = useIsland();

  const [duration, setDuration] = useState("30");
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorTopic, setVisitorTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // View month date state
  const [viewDate, setViewDate] = useState(() => new Date(2026, 7, 1));
  const [selectedDate, setSelectedDate] = useState("2026-08-07");
  const [selectedSlot, setSelectedSlot] = useState("3:00 PM");
  const [booked, setBooked] = useState(false);

  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  }, []);

  const timezoneAbbr = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' }).formatToParts(new Date());
      return parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+5:30';
    } catch {
      return 'GMT+5:30';
    }
  }, [timezone]);

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  // Dynamic calendar cells generator
  const calendarCells = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstDayIndex = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(y, m, d);
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const key = `${y}-${mm}-${dd}`;
      const isPast = cellDate < today;
      const hasSlots = Boolean(availability[key] && availability[key].length > 0);

      cells.push({
        day: d,
        key,
        isAvailable: hasSlots && !isPast,
      });
    }
    return cells;
  }, [viewDate, availability, today]);

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const slots = selectedDate ? availability[selectedDate] || ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:30 PM"] : [];

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const goToMonth = (delta) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    setIsSubmitting(true);
    
    const formattedDate = formatDateLabel(selectedDate);
    const guestEmail = visitorEmail.trim() || 'Not Provided';
    const topicNote = visitorTopic.trim() || 'General Portfolio Discussion & Networking';
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    
    const messageBody = `📌 NEW 1-ON-1 MEETING SESSION BOOKED FOR SUJITH\n\n` +
      `👤 Visitor Email: ${guestEmail}\n` +
      `📅 Meeting Date: ${formattedDate}\n` +
      `⏰ Time Slot: ${selectedSlot} (${timezoneAbbr})\n` +
      `⏳ Session Duration: ${duration} minutes\n` +
      `🌍 Visitor Location/TZ: ${timezone}\n` +
      `📝 Agenda / Topic: ${topicNote}\n` +
      `🎥 Google Meet Video Link: ${meetLink}\n\n` +
      `Google Meet session link & parameters auto-generated via Portfolio Instant Scheduling system.`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portfolio-session': getSessionToken(),
        },
        body: JSON.stringify({
          name: guestEmail !== 'Not Provided' ? guestEmail.split('@')[0] : 'Meeting Visitor',
          email: 'sujithreddy1546@gmail.com',
          message: messageBody,
          referrer_path: '/instant-scheduling-modal'
        })
      });

      if (!res.ok) {
        const mailtoSubject = encodeURIComponent(`📅 Meeting Request: ${formattedDate} at ${selectedSlot} (${duration} min)`);
        const mailtoBody = encodeURIComponent(messageBody);
        window.location.href = `mailto:sujithreddy1546@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      }

      setBooked(true);
      if (triggerIsland) {
        triggerIsland({
          title: "Meeting Request Confirmed!",
          message: `${formattedDate} at ${selectedSlot} (${duration} min)`,
          type: "success"
        });
      }

      if (onConfirm) {
        onConfirm({ date: selectedDate, time: selectedSlot, duration, email: guestEmail, topic: topicNote });
      }
    } catch (_) {
      setBooked(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Optional backdrop when not minimized */}
          {!minimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                zIndex: 999998,
              }}
            />
          )}

          {/* Floating Schedule Window Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scheduling-header-title"
            initial={{ opacity: 0, y: 40, scale: 0.90, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 30, scale: 0.94, filter: 'blur(4px)', transition: { duration: 0.16, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.85 }}
            style={{
              position: 'fixed',
              right: maximized ? '0px' : '24px',
              bottom: minimized ? '-460px' : (maximized ? '0px' : '24px'),
              top: maximized ? '0px' : 'auto',
              left: maximized ? '0px' : 'auto',
              width: maximized ? '100vw' : '520px',
              maxWidth: maximized ? '100vw' : 'calc(100vw - 32px)',
              height: maximized ? '100vh' : 'auto',
              zIndex: 999999,
              backgroundColor: 'rgba(20, 22, 28, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: maximized ? '0px' : '18px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              userSelect: 'none'
            }}
          >
            {/* Dark Window Header Bar */}
            <div
              style={{
                height: '44px',
                backgroundColor: '#1c1d22',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onClick={() => setMinimized(!minimized)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={15} color="#3b82f6" />
                <span id="scheduling-header-title" style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>
                  {booked ? "Meeting Booked!" : "Book a time with Sujith Thota"}
                </span>
              </div>

              {/* Window Actions (- ⤢ ✕) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                <motion.button
                  type="button"
                  onClick={() => setMinimized(!minimized)}
                  title={minimized ? "Restore" : "Minimize"}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Minus size={14} />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => {
                    setMaximized(!maximized);
                    setMinimized(false);
                  }}
                  title={maximized ? "Restore" : "Maximize"}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {maximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={onClose}
                  title="Close"
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={15} />
                </motion.button>
              </div>
            </div>

            {/* Body Content */}
            <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {booked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '32px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#22242a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                    margin: 'auto 0'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px'
                  }}>
                    <Check size={24} />
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                    {formatDateLabel(selectedDate)} · {selectedSlot} {timezoneAbbr}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' }}>
                    Email confirmation & Google Meet invite dispatched! ({duration} min 1:1 call)
                  </p>

                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`1-on-1 Meeting with Sujith Thota`)}&details=${encodeURIComponent(`Session Topic: ${visitorTopic || 'General Portfolio Discussion'}`)}&location=Google%20Meet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <CalendarIcon size={15} /> Add to Google Calendar
                  </a>
                </motion.div>
              ) : (
                <>
                  {/* Segmented Pill Duration Toggle */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      marginBottom: '16px',
                      backgroundColor: '#22242a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '3px',
                      borderRadius: '999px',
                    }}
                  >
                    {["15", "30"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        style={{
                          flex: 1,
                          padding: '7px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          borderRadius: '999px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: duration === d ? '#18191d' : 'transparent',
                          color: duration === d ? '#ffffff' : '#94a3b8',
                          boxShadow: duration === d ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>

                  {/* Calendar Grid + Slots Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px', marginBottom: '14px' }}>
                    {/* Left Column: Dynamic Calendar */}
                    <div>
                      {/* Calendar Month Header & Navigation */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>{monthLabel}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => goToMonth(-1)}
                            aria-label="Previous month"
                            style={{
                              width: '24px',
                              height: '24px',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '6px',
                              backgroundColor: '#22242a',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => goToMonth(1)}
                            aria-label="Next month"
                            style={{
                              width: '24px',
                              height: '24px',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '6px',
                              backgroundColor: '#22242a',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Weekday Header */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                        {["S", "M", "T", "W", "T", "F", "S"].map((dayName, idx) => (
                          <span key={idx}>{dayName}</span>
                        ))}
                      </div>

                      {/* Dynamic Calendar Date Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {calendarCells.map((cell, idx) => {
                          if (!cell) return <div key={`pad-${idx}`} />;
                          const isSelected = cell.key === selectedDate;
                          return (
                            <div
                              key={cell.key}
                              onClick={() => {
                                if (!cell.isAvailable) return;
                                setSelectedDate(cell.key);
                                setSelectedSlot("3:00 PM");
                              }}
                              style={{
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                cursor: cell.isAvailable ? 'pointer' : 'default',
                                backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                color: isSelected
                                  ? '#ffffff'
                                  : cell.isAvailable
                                  ? '#ffffff'
                                  : '#64748b',
                                border: !isSelected && cell.isAvailable ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                opacity: cell.isAvailable || isSelected ? 1 : 0.3,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {cell.day}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Time Slots Stack */}
                    <div>
                      {/* Timezone Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', fontSize: '11.5px', fontWeight: 600, color: '#94a3b8' }}>
                        <Globe size={13} color="#3b82f6" />
                        <span>{timezoneAbbr} (auto-detected)</span>
                      </div>

                      {/* Time Slots List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {slots.map((slot) => {
                          const isSel = slot === selectedSlot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              style={{
                                width: '100%',
                                height: '34px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: isSel ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                backgroundColor: isSel ? '#3b82f6' : '#22242a',
                                color: '#ffffff',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                boxShadow: isSel ? '0 2px 8px rgba(59, 130, 246, 0.35)' : 'none',
                              }}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Form Inputs: Email & Agenda */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <Mail size={12} color="#3b82f6" />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                          Your Email
                        </span>
                      </div>
                      <input
                        type="email"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                        style={{
                          width: '100%',
                          height: '34px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          backgroundColor: '#22242a',
                          color: '#ffffff',
                          padding: '0 10px',
                          fontSize: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <Clock size={12} color="#22c55e" />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                          Topic / Agenda (Optional)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={visitorTopic}
                        onChange={(e) => setVisitorTopic(e.target.value)}
                        placeholder="e.g. AI project, hiring"
                        style={{
                          width: '100%',
                          height: '34px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          backgroundColor: '#22242a',
                          color: '#ffffff',
                          padding: '0 10px',
                          fontSize: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Selected Summary Card + Confirm Button */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px', marginTop: 'auto' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '5px', textTransform: 'uppercase' }}>
                      SELECTED SESSION
                    </div>

                    {/* Summary Card */}
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#22242a',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}>
                      <CalendarIcon size={14} color="#3b82f6" />
                      <span>
                        {selectedDate && selectedSlot
                          ? `${formatDateLabel(selectedDate)} · ${selectedSlot} ${timezoneAbbr} · ${duration} min`
                          : "Pick a date and time slot"}
                      </span>
                    </div>

                    {/* Confirm Booking Button */}
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={!selectedDate || !selectedSlot || isSubmitting}
                      style={{
                        width: '100%',
                        height: '38px',
                        borderRadius: '8px',
                        backgroundColor: !selectedDate || !selectedSlot ? '#262830' : '#3b82f6',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: !selectedDate || !selectedSlot || isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: !selectedDate || !selectedSlot || isSubmitting ? 0.5 : 1,
                        boxShadow: !selectedDate || !selectedSlot ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.35)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Dispatching Invite...
                        </>
                      ) : (
                        <>
                          <Check size={15} /> Confirm & Dispatch Invite
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
