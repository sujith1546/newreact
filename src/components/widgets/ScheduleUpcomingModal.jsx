import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_AVAILABILITY = {
  "2026-08-04": ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM"],
  "2026-08-05": ["11:00 AM", "2:00 PM", "4:30 PM"],
  "2026-08-07": ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:30 PM"],
  "2026-08-10": ["10:00 AM", "1:00 PM", "3:30 PM"],
  "2026-08-11": ["11:30 AM", "2:30 PM", "4:00 PM"],
  "2026-08-12": ["10:00 AM", "1:00 PM", "4:30 PM"]
};

export default function ScheduleUpcomingModal({ isOpen, onClose, onConfirm }) {
  const [duration, setDuration] = useState("30");
  const [selectedDay, setSelectedDay] = useState(7);
  const [selectedSlot, setSelectedSlot] = useState("3:00 PM");
  const [booked, setBooked] = useState(false);

  const timezoneAbbr = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date());
      return parts.find(p => p.type === 'timeZoneName')?.value || 'IST';
    } catch {
      return 'IST';
    }
  }, []);

  const dateStr = selectedDay ? `2026-08-${String(selectedDay).padStart(2, '0')}` : null;
  const slots = MOCK_AVAILABILITY[dateStr] || ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:30 PM"];

  const handleConfirm = async () => {
    if (!selectedDay || !selectedSlot) return;
    if (onConfirm) {
      await onConfirm({ date: dateStr, slot: selectedSlot, duration });
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

  // Calendar dates layout matching screenshot
  // Available days: 4, 5, 7, 10, 11, 12
  const daysRow1 = [1, 2, 3, 4, 5, 6, 7];
  const daysRow2 = [8, 9, 10, 11, 12, 13, 14];
  const availableDays = [4, 5, 7, 10, 11, 12];

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
                  {booked ? "Check your email for the confirmation." : "with Sujith Thota"}
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
                  Fri, Aug {selectedDay} · {selectedSlot} {timezoneAbbr}
                </h4>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                  Google Meet link generated ({duration} min)
                </p>
              </motion.div>
            ) : (
              <>
                {/* Duration Toggle Pills */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '22px' }}>
                  {["15", "30"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      style={{
                        flex: 1,
                        height: '42px',
                        borderRadius: '999px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: d === duration ? 'none' : '1px solid rgba(255, 255, 255, 0.25)',
                        backgroundColor: d === duration ? '#ffffff' : 'transparent',
                        color: d === duration ? '#000000' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {d} min
                    </button>
                  ))}
                </div>

                {/* Calendar Grid + Slots Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '24px' }}>
                  {/* Left Column: Calendar Grid */}
                  <div>
                    {/* Calendar Month Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>August 2026</span>
                      <div style={{ display: 'flex', gap: '8px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        <ChevronLeft size={16} style={{ cursor: 'pointer' }} />
                        <ChevronRight size={16} style={{ cursor: 'pointer' }} />
                      </div>
                    </div>

                    {/* Weekday Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
                      <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>

                    {/* Date Rows Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Row 1: 1 to 7 */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                        {daysRow1.map((d) => {
                          const isAvailable = availableDays.includes(d);
                          const isSelected = selectedDay === d;
                          return (
                            <div
                              key={d}
                              onClick={() => isAvailable && setSelectedDay(d)}
                              style={{
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '8px',
                                cursor: isAvailable ? 'pointer' : 'default',
                                opacity: isAvailable ? 1 : 0.35,
                                border: isSelected ? 'none' : isAvailable ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                                backgroundColor: isSelected ? '#ffffff' : 'transparent',
                                color: isSelected ? '#000000' : '#ffffff',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {d}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 2: 8 to 14 */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                        {daysRow2.map((d) => {
                          const isAvailable = availableDays.includes(d);
                          const isSelected = selectedDay === d;
                          return (
                            <div
                              key={d}
                              onClick={() => isAvailable && setSelectedDay(d)}
                              style={{
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '8px',
                                cursor: isAvailable ? 'pointer' : 'default',
                                opacity: isAvailable ? 1 : 0.35,
                                border: isSelected ? 'none' : isAvailable ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                                backgroundColor: isSelected ? '#ffffff' : 'transparent',
                                color: isSelected ? '#000000' : '#ffffff',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {d}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Time Slots Stack */}
                  <div>
                    {/* Timezone Label Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                      <Clock size={13} color="rgba(255, 255, 255, 0.7)" />
                      <span>{timezoneAbbr} (auto-detected)</span>
                    </div>

                    {/* Scrollable Slots Stack */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                      {slots.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            style={{
                              width: '100%',
                              height: '36px',
                              borderRadius: '8px',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                              backgroundColor: isSelected ? '#ffffff' : 'transparent',
                              color: isSelected ? '#000000' : '#ffffff',
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

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', marginTop: '10px' }}>
                  {/* SELECTED Label */}
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>
                    SELECTED
                  </div>

                  {/* Summary Box */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
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
                      {selectedDay && selectedSlot
                        ? `Fri, Aug ${selectedDay} · ${selectedSlot} ${timezoneAbbr} · ${duration} min`
                        : "Pick a date and time slot"}
                    </span>
                  </div>

                  {/* Confirm Booking Button */}
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedDay || !selectedSlot}
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: !selectedDay || !selectedSlot ? 'rgba(255, 255, 255, 0.2)' : '#ffffff',
                      color: '#000000',
                      fontSize: '14px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: !selectedDay || !selectedSlot ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: !selectedDay || !selectedSlot ? 0.5 : 1,
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
