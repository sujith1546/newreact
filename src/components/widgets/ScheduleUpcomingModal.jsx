import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_AVAILABILITY = {
  "2026-08-05": ["10:00", "11:30", "15:00"],
  "2026-08-06": ["09:00", "14:00"],
  "2026-08-07": ["10:00", "11:30", "13:00", "15:00", "16:30"],
  "2026-08-08": ["10:00", "13:00", "16:30"],
  "2026-08-10": ["10:00", "11:30", "15:00"],
  "2026-08-11": ["11:30", "14:30", "16:30"],
  "2026-08-12": ["10:00", "13:00", "16:30"]
};

export default function ScheduleUpcomingModal({ isOpen, onClose, availability = DEFAULT_AVAILABILITY, onConfirm }) {
  const [duration, setDuration] = useState("30");
  
  // View month date state (defaults to Aug 1, 2026 or current month)
  const [viewDate, setViewDate] = useState(() => {
    return new Date(2026, 7, 1); // August 2026
  });

  const [selectedDate, setSelectedDate] = useState("2026-08-07");
  const [selectedSlot, setSelectedSlot] = useState("15:00");
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

  // Dynamic calendar generation (fixes weekday offset & month days)
  const calendarCells = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstDayIndex = new Date(y, m, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const cells = [];
    // Padding empty cells for weekday offset
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(y, m, d);
      // Key format: YYYY-MM-DD
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

  const formatTimeLabel = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(":").map(Number);
    const dateObj = new Date();
    dateObj.setHours(h, m);
    return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const goToMonth = (delta) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    if (onConfirm) {
      await onConfirm({ date: selectedDate, slot: selectedSlot, duration });
    }
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      onClose();
    }, 2200);
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="scheduling-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '620px',
              backgroundColor: '#222222',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '28px',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.75)',
              color: '#ffffff',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              zIndex: 1000000,
              userSelect: 'none'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 id="scheduling-title" style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {booked ? "Booked!" : "Book a time"}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontWeight: 500 }}>
                  {booked ? "Check your email for the confirmation." : "with Sujith Thota · 1:1 call"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255, 255, 255, 0.5)',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {booked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '28px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                  margin: '16px 0'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Check size={22} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                  {formatDateLabel(selectedDate)} · {formatTimeLabel(selectedSlot)} {timezoneAbbr}
                </h4>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                  Google Meet invitation sent ({duration} min)
                </p>
              </motion.div>
            ) : (
              <>
                {/* Segmented Pill Duration Toggle */}
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '22px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
                        fontSize: '13.5px',
                        fontWeight: 700,
                        borderRadius: '999px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: duration === d ? '#ffffff' : 'transparent',
                        color: duration === d ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                        boxShadow: duration === d ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {d} min
                    </button>
                  ))}
                </div>

                {/* Calendar Grid + Slots Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '28px', marginBottom: '24px' }}>
                  {/* Left Column: Dynamic Calendar */}
                  <div>
                    {/* Calendar Month Header & Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff' }}>{monthLabel}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => goToMonth(-1)}
                          aria-label="Previous month"
                          style={{
                            width: '24px',
                            height: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
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
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
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
                              backgroundColor: isSelected ? '#ffffff' : 'transparent',
                              color: isSelected
                                ? '#000000'
                                : cell.isAvailable
                                ? '#ffffff'
                                : 'rgba(255, 255, 255, 0.35)',
                              border: !isSelected && cell.isAvailable ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                      <Clock size={13} color="rgba(255, 255, 255, 0.7)" />
                      <span>{timezoneAbbr} (auto-detected)</span>
                    </div>

                    {/* Scrollable Time Slots List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '190px', overflowY: 'auto', paddingRight: '4px' }}>
                      {!selectedDate && (
                        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: '16px 0', textAlign: 'center' }}>
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
                              height: '38px',
                              borderRadius: '9px',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: isSel ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                              backgroundColor: isSel ? '#ffffff' : 'transparent',
                              color: isSel ? '#000000' : '#ffffff',
                              textAlign: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {formatTimeLabel(slot)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected Summary Card + Confirm Button */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>
                    SELECTED
                  </div>

                  {/* Summary Card with Muted Background */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ffffff'
                  }}>
                    <CalendarIcon size={16} color="#3b82f6" />
                    <span>
                      {selectedDate && selectedSlot
                        ? `${formatDateLabel(selectedDate)} · ${formatTimeLabel(selectedSlot)} ${timezoneAbbr} · ${duration} min`
                        : "Pick a date and time slot"}
                    </span>
                  </div>

                  {/* Confirm Booking Button */}
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedSlot}
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: !selectedDate || !selectedSlot ? 'rgba(255, 255, 255, 0.2)' : '#ffffff',
                      color: '#000000',
                      fontSize: '14px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: !selectedDate || !selectedSlot ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: !selectedDate || !selectedSlot ? 0.5 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Check size={16} /> Confirm booking
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
