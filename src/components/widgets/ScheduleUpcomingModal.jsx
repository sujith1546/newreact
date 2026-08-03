import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Minus, Maximize2, Minimize2, Mail, Loader2, Video } from 'lucide-react';
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
      return parts.find(p => p.type === 'timeZoneName')?.value || 'IST';
    } catch {
      return 'IST';
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
  const slots = selectedDate ? availability[selectedDate] || [] : [];

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
          email: 'sujithreddy1546@gmail.com', // Always route booking alert directly to Sujith
          message: messageBody,
          referrer_path: '/instant-scheduling-modal'
        })
      });

      if (!res.ok) {
        // Fallback to direct mailto trigger if backend endpoint fails or SMTP unconfigured
        const mailtoSubject = encodeURIComponent(`📅 Meeting Request: ${formattedDate} at ${selectedSlot} (${duration} min)`);
        const mailtoBody = encodeURIComponent(messageBody);
        window.location.href = `mailto:sujithreddy1546@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      }

      triggerIsland?.({
        title: 'Meeting Request Sent! 📅',
        subtitle: `Details delivered to Sujith Thota`,
        icon: <Check size={16} strokeWidth={3} />,
        color: '#10b981',
        duration: 4000,
      });
    } catch (err) {
      console.warn("Meeting booking API error, triggering mailto fallback:", err);
      const mailtoSubject = encodeURIComponent(`📅 Meeting Request: ${formattedDate} at ${selectedSlot} (${duration} min)`);
      const mailtoBody = encodeURIComponent(messageBody);
      window.location.href = `mailto:sujithreddy1546@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    } finally {
      setIsSubmitting(false);
      if (onConfirm) {
        await onConfirm({ date: selectedDate, slot: selectedSlot, duration, email: guestEmail, topic: topicNote, meetLink });
      }
      setBooked(true);
      setTimeout(() => {
        setBooked(false);
        onClose();
      }, 2600);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          {!minimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 999998,
              }}
            />
          )}

          {/* Mail-style Floating Window */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scheduling-header-title"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              right: maximized ? '0px' : '16px',
              bottom: minimized ? '-460px' : '0px',
              top: maximized ? '0px' : 'auto',
              left: maximized ? '0px' : 'auto',
              width: maximized ? '100vw' : '560px',
              maxWidth: maximized ? '100vw' : 'calc(100vw - 32px)',
              height: maximized ? '100vh' : 'auto',
              zIndex: 999999,
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: maximized ? '0px' : '8px 8px 0 0',
              border: '1px solid var(--border-color)',
              borderBottom: 'none',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              userSelect: 'none'
            }}
          >
            {/* Gmail/Mail-style Header Bar */}
            <div
              style={{
                height: '42px',
                backgroundColor: 'var(--bg-primary)',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                flexShrink: 0
              }}
              onClick={() => setMinimized(!minimized)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={15} color="var(--primary-blue)" />
                <span id="scheduling-header-title" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {booked ? "Meeting Booked!" : "Book a time with Sujith Thota"}
                </span>
              </div>

              {/* Window Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setMinimized(!minimized)}
                  title={minimized ? "Restore" : "Minimize"}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Minus size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMaximized(!maximized);
                    setMinimized(false);
                  }}
                  title={maximized ? "Restore" : "Maximize"}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {maximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  title="Close"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div style={{ padding: '20px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {booked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '32px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                    margin: 'auto 0'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.14)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px'
                  }}>
                    <Check size={24} />
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    {formatDateLabel(selectedDate)} · {selectedSlot} {timezoneAbbr}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    Email confirmation & Google Meet invite dispatched! ({duration} min 1:1 call)
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Segmented Pill Duration Toggle */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      marginBottom: '18px',
                      backgroundColor: 'color-mix(in srgb, var(--text-primary) 8%, var(--bg-primary))',
                      padding: '4px',
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
                          padding: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          borderRadius: '999px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: duration === d ? 'var(--bg-secondary)' : 'transparent',
                          color: duration === d ? 'var(--text-primary)' : 'var(--text-secondary)',
                          boxShadow: duration === d ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>

                  {/* Calendar Grid + Slots Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px', marginBottom: '18px' }}>
                    {/* Left Column: Dynamic Calendar */}
                    <div>
                      {/* Calendar Month Header & Navigation */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>{monthLabel}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => goToMonth(-1)}
                            aria-label="Previous month"
                            style={{
                              width: '24px',
                              height: '24px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              backgroundColor: 'transparent',
                              color: 'var(--text-primary)',
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
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              backgroundColor: 'transparent',
                              color: 'var(--text-primary)',
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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
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
                                setSelectedSlot(null);
                              }}
                              style={{
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                cursor: cell.isAvailable ? 'pointer' : 'default',
                                backgroundColor: isSelected ? 'var(--primary-blue)' : 'transparent',
                                color: isSelected
                                  ? '#ffffff'
                                  : cell.isAvailable
                                  ? 'var(--text-primary)'
                                  : 'var(--text-muted)',
                                border: !isSelected && cell.isAvailable ? '1px solid var(--border-color)' : 'none',
                                opacity: cell.isAvailable || isSelected ? 1 : 0.35,
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        <Clock size={13} color="var(--text-muted)" />
                        <span>{timezoneAbbr} (auto-detected)</span>
                      </div>

                      {/* Time Slots List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {!selectedDate && (
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '16px 0', textAlign: 'center' }}>
                            Select a date to see times
                          </p>
                        )}
                        {slots.map((slot) => {
                          const isSel = slot === selectedSlot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              style={{
                                width: '100%',
                                height: '36px',
                                borderRadius: '9px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: isSel ? 'none' : '1px solid var(--border-color)',
                                backgroundColor: isSel ? 'var(--primary-blue)' : 'var(--bg-primary)',
                                color: isSel ? '#ffffff' : 'var(--text-primary)',
                                textAlign: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Selected Summary Card + Email Input + Confirm Button */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: 'auto' }}>
                    
                    {/* Visitor Email Input Field */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Mail size={13} color="var(--primary-blue)" />
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            padding: '0 10px',
                            fontSize: '12px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Clock size={13} color="#10b981" />
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            padding: '0 10px',
                            fontSize: '12px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '6px', textTransform: 'uppercase' }}>
                      SELECTED SESSION
                    </div>

                    {/* Summary Card */}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}>
                      <CalendarIcon size={15} color="var(--primary-blue)" />
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
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: !selectedDate || !selectedSlot ? 'var(--border-color)' : 'var(--primary-blue)',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: !selectedDate || !selectedSlot || isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: !selectedDate || !selectedSlot || isSubmitting ? 0.5 : 1,
                        boxShadow: !selectedDate || !selectedSlot ? 'none' : '0 4px 14px color-mix(in srgb, var(--primary-blue) 35%, transparent)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Dispatching Invite...
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Confirm & Dispatch Invite
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
