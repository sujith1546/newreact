import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Briefcase, Users, Receipt, MessageCircle,
  Mail, CalendarDays, HelpCircle, Send, X, Sparkles,
} from "lucide-react";
import "./ContactMobile.css";

// Reliable LinkedIn SVG icon in case lucide-react excludes it
function LinkedinIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  );
}

// Sujith's real contact details
const CONTACT = {
  email: "sujithreddy1546@gmail.com",
  linkedin: "https://www.linkedin.com/in/thota-sujith-reddy-88a650275/",
  booking: "mailto:sujithreddy1546@gmail.com?subject=Schedule%2015-min%20Call",
};

const MAX = 500;

const TOPICS = [
  {
    key: "hiring", title: "Hiring", hint: "A role you think I'd fit", color: "#3b82f6", Icon: Briefcase,
    sheetTitle: "Hiring enquiry", sub: "Tell me about the role and your team.",
    extra: { label: "Company", placeholder: "Where are you hiring?" },
    starters: ["I'd like to discuss a role with you.", "Are you open to new opportunities?", "Could we set up a short call?"],
    cta: "Send to hiring", subject: "Hiring enquiry",
  },
  {
    key: "collab", title: "Collaborate", hint: "Build or ship together", color: "#10b981", Icon: Users,
    sheetTitle: "Let's collaborate", sub: "What are you building?",
    extra: { label: "Project link (optional)", placeholder: "GitHub, Figma or website" },
    starters: ["I have a project idea I'd love to build together.", "I'm looking for a teammate for a hackathon.", "Would you like to contribute to my open-source project?"],
    cta: "Propose collab", subject: "Collaboration idea",
  },
  {
    key: "freelance", title: "Freelance", hint: "A project and a budget", color: "#8b5cf6", Icon: Receipt,
    sheetTitle: "Freelance project", sub: "Share the scope and timeline.",
    extra: { label: "Budget (optional)", placeholder: "A range, or 'flexible'" },
    starters: ["I need a website built.", "I need help with a data or ML project.", "I'd like a quote for a small project."],
    cta: "Request a quote", subject: "Freelance project",
  },
  {
    key: "hi", title: "Say hi", hint: "Question or feedback", color: "#06b6d4", Icon: MessageCircle,
    sheetTitle: "Say hi", sub: "No agenda needed.",
    extra: null,
    starters: ["Loved your portfolio!", "I have a quick question.", "Just wanted to say hi."],
    cta: "Send message", subject: "Hello",
  },
];

const EMPTY = { name: "", email: "", extra: "", message: "" };
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function Field({ id, label, error, aside, children }) {
  return (
    <div className={`ms-field${error ? " bad" : ""}`}>
      <label htmlFor={id}><span>{label}</span>{aside && <em>{aside}</em>}</label>
      {children}
      {error && <small role="alert">{error}</small>}
    </div>
  );
}

/* ---------- slide-up message sheet ---------- */
function MessageSheet({ topic, open, onClose, onSend }) {
  const ref = useRef(null);
  const y0 = useRef(null);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [kb, setKb] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fresh message + extra field whenever a topic opens (name/email are remembered)
  useEffect(() => {
    if (!open) return;
    setForm((f) => ({ ...f, extra: "", message: "" }));
    setTried(false);
    setStatus("idle");
    setDy(0);
    ref.current?.focus();
  }, [open, topic?.key]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lift the sheet above the on-screen keyboard
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !open) return;
    const on = () => setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    on();
    vv.addEventListener("resize", on);
    vv.addEventListener("scroll", on);
    return () => { vv.removeEventListener("resize", on); vv.removeEventListener("scroll", on); setKb(0); };
  }, [open]);

  const start = (e) => {
    y0.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (y0.current !== null) setDy(Math.max(0, e.clientY - y0.current));
  };
  const end = () => {
    if (y0.current === null) return;
    y0.current = null;
    setDragging(false);
    if (dy > 100) onClose();
    setDy(0);
  };

  const errors = {
    name: form.name.trim() ? "" : "Please enter your name",
    email: validEmail(form.email) ? "" : "Enter a valid email",
    message: form.message.trim().length >= 10 ? "" : "Write at least 10 characters",
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const addStarter = (s) =>
    setForm((f) => ({ ...f, message: ((f.message.trim() ? f.message.trim() + " " : "") + s).slice(0, MAX) }));

  const submit = async (e) => {
    e.preventDefault();
    setTried(true);
    if (errors.name || errors.email || errors.message) return;
    setStatus("sending");
    const payload = {
      topic: topic.key, topicTitle: topic.sheetTitle,
      name: form.name.trim(), email: form.email.trim(),
      extraLabel: topic.extra?.label || "", extraValue: form.extra.trim(),
      message: form.message.trim(),
    };
    try {
      if (onSend) {
        await onSend(payload);
      } else {
        const body = [
          payload.message, "", `Name: ${payload.name}`, `Email: ${payload.email}`,
          payload.extraValue ? `${payload.extraLabel}: ${payload.extraValue}` : "",
        ].filter((l) => l !== "").join("\n");
        window.location.href =
          `mailto:${CONTACT.email}?subject=${encodeURIComponent(`${topic.subject} from ${payload.name}`)}&body=${encodeURIComponent(body)}`;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const first = form.name.trim().split(" ")[0] || "there";

  const sheetContent = (
    <>
      <div className={`ms-scrim${open ? " on" : ""}`} onClick={onClose} aria-hidden="true" />
      <section
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={topic ? topic.sheetTitle : "Message"}
        className="ms-sheet"
        style={{
          "--c": topic?.color,
          bottom: kb,
          transform: open ? `translateY(${dy}px)` : "translateY(105%)",
          transition: dragging ? "none" : undefined,
        }}
      >
        {topic && (
          <>
            <div className="ms-drag" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
              <div className="ms-grab"><div className="ms-pill" /></div>
              <div className="ms-head">
                <span className="ms-ico"><topic.Icon size={18} aria-hidden="true" /></span>
                <div className="ms-ttl">
                  <div className="ms-ttl-row">
                    <h2>{topic.sheetTitle}</h2>
                    <span className="ms-badge">Direct Message</span>
                  </div>
                  <p>{topic.sub}</p>
                </div>
                <button type="button" className="ms-x" aria-label="Close" onClick={onClose} onPointerDown={(e) => e.stopPropagation()}>
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            </div>

            {status === "sent" ? (
              <div className="ms-done" role="status">
                <svg className="ms-tick" viewBox="0 0 52 52" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" /><path d="M15 27l8 8 14-16" />
                </svg>
                <h3>{onSend ? "Message sent" : "One more step"}</h3>
                <p>
                  {onSend
                    ? `Thanks ${first}, I'll get back to you soon.`
                    : "Your email app should have opened with the message ready. Press send there to finish."}
                </p>
                <button type="button" className="ms-send" onClick={onClose}>Done</button>
              </div>
            ) : (
              <form className="ms-form" onSubmit={submit} noValidate>
                <div className="ms-body">
                  <div className="ms-two">
                    <Field id="ms-name" label="Your name" error={tried && errors.name}>
                      <input id="ms-name" value={form.name} onChange={set("name")} autoComplete="name"
                        placeholder="Your name" aria-invalid={!!(tried && errors.name)} />
                    </Field>
                    <Field id="ms-email" label="Email" error={tried && errors.email}>
                      <input id="ms-email" type="email" inputMode="email" value={form.email} onChange={set("email")}
                        autoComplete="email" placeholder="you@email.com" aria-invalid={!!(tried && errors.email)} />
                    </Field>
                  </div>

                  {topic.extra && (
                    <Field id="ms-extra" label={topic.extra.label}>
                      <input id="ms-extra" value={form.extra} onChange={set("extra")} placeholder={topic.extra.placeholder} />
                    </Field>
                  )}

                  <Field id="ms-msg" label="Message" aside={`${form.message.length}/${MAX}`} error={tried && errors.message}>
                    <textarea id="ms-msg" rows={3} maxLength={MAX} value={form.message} onChange={set("message")}
                      placeholder="Write your message..." aria-invalid={!!(tried && errors.message)} />
                  </Field>

                  <div className="ms-starters" role="group" aria-label="Quick starters">
                    {topic.starters.map((s) => (
                      <button key={s} type="button" onClick={() => addStarter(s)}>
                        <Sparkles size={11} aria-hidden="true" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <footer className="ms-foot">
                  {status === "error" && <p className="ms-err" role="alert">Couldn't send. Please try again or use Email.</p>}
                  <button type="submit" className="ms-send" disabled={status === "sending"}>
                    {status === "sending" ? <span className="ms-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                    {status === "sending" ? "Sending..." : topic.cta}
                  </button>
                </footer>
              </form>
            )}
          </>
        )}
      </section>
    </>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(sheetContent, document.body);
}

/* ---------- page ---------- */
export default function ContactMobile({ onOpenFaq, onSend }) {
  const [selected, setSelected] = useState(null); // topic key
  const [lastTopic, setLastTopic] = useState(null); // keeps content while the sheet animates out

  const openTopic = (t) => { setSelected(t.key); setLastTopic(t); };
  const close = () => setSelected(null);

  return (
    <main className="cm">
      <header className="cm-intro">
        <h1>Let's talk.</h1>
        <p><span className="cm-live" />Open to roles and projects · replies within a day</p>
      </header>

      <div className="cm-grid">
        {TOPICS.map((t) => {
          const on = selected === t.key;
          return (
            <button
              key={t.key} type="button" aria-haspopup="dialog"
              className={`cm-tile${on ? " on" : ""}${selected && !on ? " dim" : ""}`}
              style={{ "--c": t.color }} onClick={() => openTopic(t)}
            >
              <span className="cm-ic"><t.Icon size={16} aria-hidden="true" /></span>
              <span className="cm-ck" aria-hidden="true">✓</span>
              <span><h2>{t.title}</h2><p>{t.hint}</p></span>
            </button>
          );
        })}
      </div>

      <div className="cm-chan">
        <a className="cm-ch" href={`mailto:${CONTACT.email}`}><Mail size={14} aria-hidden="true" /> Email</a>
        <a className="cm-ch" href={CONTACT.linkedin} target="_blank" rel="noreferrer"><LinkedinIcon size={14} /> LinkedIn</a>
        <a className="cm-ch" href={CONTACT.booking} target="_blank" rel="noreferrer"><CalendarDays size={14} aria-hidden="true" /> Book call</a>
      </div>

      <button type="button" className="cm-faq" onClick={onOpenFaq}>
        <HelpCircle size={14} aria-hidden="true" />
        <span>Quick question first?</span>
        <b>View FAQ</b>
      </button>

      <MessageSheet topic={lastTopic} open={selected !== null} onClose={close} onSend={onSend} />
    </main>
  );
}
