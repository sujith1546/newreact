import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react"; // npm install qrcode.react
import {
  Mail,
  MessageCircle,
  Copy,
  Check,
  X,
  Download,
  RotateCw,
  QrCode,
  Link as LinkIcon,
} from "lucide-react"; // npm install lucide-react
import { useState, useEffect } from "react";

// ---- Animation variants ----
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const boxVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function QRModal({
  isOpen,
  onClose,
  shareUrl,
  title = "Share your portfolio",
  contactName = "Sujith Thota",
  contactRole = "Data Science Enthusiast · VIT",
  contactEmail = "sujith@example.com",
  contactPhone = "",
}) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Always reopen on the QR (front) face
  useEffect(() => {
    if (isOpen) setFlipped(false);
  }, [isOpen]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleGmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`Check this out: ${shareUrl}`);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  const initials = contactName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleDownloadCard = () => {
    const canvas = document.createElement("canvas");
    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const drawRoundedRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    ctx.save();
    drawRoundedRect(0, 0, width, height, 24);
    ctx.clip();

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#0d0d0d");
    grad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.035)";
    for (let x = 20; x < width; x += 26) {
      for (let y = 20; y < height; y += 26) {
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const glow = ctx.createRadialGradient(width - 60, 60, 10, width - 60, 60, 220);
    glow.addColorStop(0, "rgba(255,255,255,0.10)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(90, 90, 42, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.fillStyle = "#111111";
    ctx.font = "600 30px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, 90, 92);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 40px Arial, sans-serif";
    ctx.fillText(contactName, 155, 82);

    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.arc(159, 108, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "400 18px Arial, sans-serif";
    ctx.fillText(contactRole, 172, 114);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(60, 175);
    ctx.lineTo(width - 60, 175);
    ctx.stroke();

    const rows = [
      contactEmail && { icon: "✉", text: contactEmail },
      contactPhone && { icon: "☎", text: contactPhone },
      { icon: "⚭", text: shareUrl.replace(/^https?:\/\//, "") },
    ].filter(Boolean);

    let y = 220;
    rows.forEach((row) => {
      ctx.fillStyle = "#ffffff";
      ctx.font = "400 20px Arial, sans-serif";
      ctx.fillText(row.icon, 60, y);
      ctx.fillStyle = "#dddddd";
      ctx.font = "400 19px Arial, sans-serif";
      ctx.fillText(row.text, 92, y);
      y += 38;
    });

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "400 13px Arial, sans-serif";
    ctx.fillText("SCAN QR ON PORTFOLIO TO CONNECT", 60, height - 30);

    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.strokeRect(width - 110, height - 100, 60, 60);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if ((i + j) % 2 === 0) ctx.fillRect(width - 110 + i * 10, height - 100 + j * 10, 8, 8);
      }
    }

    ctx.restore();

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contactName.replace(/\s+/g, "_")}_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1600);
  };

  return createPortal(
    <>
      <style>{`
        .qr-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          perspective: 1200px;
        }
        .qr-flip-wrap {
          position: relative;
          width: 380px;
          height: 485px;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        .qr-flip-wrap.flipped {
          transform: rotateY(180deg);
        }
        .qr-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          box-sizing: border-box;
        }
        .qr-face-front {
          background: #ffffff;
          padding: 2.25rem 2rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .qr-modal-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .qr-face-back {
          background: linear-gradient(135deg, #0d0d0d, #1a1a1a);
          transform: rotateY(180deg);
          padding: 2.25rem 2rem 2rem;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          overflow: hidden;
        }
        .qr-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          z-index: 2;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .qr-face-front .qr-modal-close {
          color: #888888;
        }
        .qr-face-front .qr-modal-close:hover {
          background: #f2f2f2;
          color: #222222;
        }
        .qr-face-back .qr-modal-close {
          color: rgba(255, 255, 255, 0.6);
        }
        .qr-face-back .qr-modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .qr-modal-qr {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }
        .qr-modal-title {
          font-size: 16px;
          font-weight: 500;
          color: #111111;
          margin: 0 0 4px;
        }
        .qr-modal-subtitle {
          font-size: 13px;
          color: #777777;
          margin: 0 0 20px;
        }
        .qr-modal-share-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 16px;
        }
        .qr-share-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 8px;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          background: #fafafa;
          color: #333333;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .qr-share-btn:hover {
          background: #f0f0f0;
          border-color: #dddddd;
        }
        .qr-share-btn:active {
          transform: scale(0.96);
        }
        .qr-flip-btn {
          width: 100%;
          border: none;
          background: #111111;
          color: #ffffff;
          border-radius: 10px;
          padding: 11px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .qr-flip-btn:hover {
          background: #222222;
        }
        .qr-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          margin-top: 4px;
        }
        .qr-card-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #ffffff;
          color: #111111;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
          flex-shrink: 0;
        }
        .qr-card-name {
          font-weight: 700;
          font-size: 17px;
          margin: 0;
        }
        .qr-card-role {
          font-size: 11.5px;
          color: #aaaaaa;
          margin: 2px 0 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .qr-card-role-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          display: inline-block;
          flex-shrink: 0;
        }
        .qr-card-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          margin-bottom: 16px;
        }
        .qr-card-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13px;
          color: #dddddd;
          flex: 1;
        }
        .qr-card-details > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .qr-card-actions {
          display: flex;
          gap: 8px;
        }
        .qr-card-action-btn {
          flex: 1;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #ffffff;
          border-radius: 10px;
          padding: 9px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .qr-card-action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .qr-card-action-btn.saved {
          border-color: #4ade80;
          color: #4ade80;
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="qr-modal-overlay"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          >
            <motion.div
              variants={boxVariants}
              onClick={(e) => e.stopPropagation()}
              style={{ perspective: "1200px" }}
            >
              <div className={`qr-flip-wrap${flipped ? " flipped" : ""}`}>
              {/* ---------- FRONT FACE: QR + share ---------- */}
              <div className="qr-face qr-face-front">
                <button className="qr-modal-close" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>

                <motion.div
                  className="qr-modal-content"
                  variants={containerVariants}
                  initial="hidden"
                  animate={!flipped ? "visible" : "hidden"}
                >
                  <motion.div variants={itemVariants} className="qr-modal-qr">
                    <QRCodeSVG value={shareUrl} size={165} bgColor="transparent" fgColor="#111111" />
                  </motion.div>

                  <motion.p variants={itemVariants} className="qr-modal-title">
                    {title}
                  </motion.p>

                  <motion.p variants={itemVariants} className="qr-modal-subtitle">
                    Scan the code or share the link below
                  </motion.p>

                  <motion.div variants={itemVariants} className="qr-modal-share-row">
                    <button className="qr-share-btn" onClick={handleGmail} aria-label="Share via Gmail">
                      <Mail size={20} />
                      <span>Gmail</span>
                    </button>
                    <button className="qr-share-btn" onClick={handleWhatsApp} aria-label="Share via WhatsApp">
                      <MessageCircle size={20} />
                      <span>WhatsApp</span>
                    </button>
                    <button className="qr-share-btn" onClick={handleCopy} aria-label="Copy link">
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                      <span>{copied ? "Copied" : "Copy link"}</span>
                    </button>
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    className="qr-flip-btn"
                    onClick={() => setFlipped(true)}
                  >
                    <RotateCw size={15} />
                    View business card
                  </motion.button>
                </motion.div>
              </div>

              {/* ---------- BACK FACE: digital business card ---------- */}
              <div className="qr-face qr-face-back">
                <button className="qr-modal-close" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>

                <div className="qr-card-header">
                  <div className="qr-card-avatar">{initials}</div>
                  <div>
                    <p className="qr-card-name">{contactName}</p>
                    <p className="qr-card-role">
                      <span className="qr-card-role-dot" />
                      {contactRole}
                    </p>
                  </div>
                </div>

                <div className="qr-card-divider" />

                <div className="qr-card-details">
                  {contactEmail && (
                    <div>
                      <Mail size={15} />
                      {contactEmail}
                    </div>
                  )}
                  {contactPhone && (
                    <div>
                      <MessageCircle size={15} />
                      {contactPhone}
                    </div>
                  )}
                  <div>
                    <LinkIcon size={15} />
                    {shareUrl.replace(/^https?:\/\//, "")}
                  </div>
                </div>

                <div className="qr-card-actions">
                  <button
                    className={`qr-card-action-btn${downloaded ? " saved" : ""}`}
                    onClick={handleDownloadCard}
                  >
                    {downloaded ? <Check size={14} /> : <Download size={14} />}
                    {downloaded ? "Saved" : "Download"}
                  </button>
                  <button className="qr-card-action-btn" onClick={() => setFlipped(false)}>
                    <QrCode size={14} />
                    Back to QR
                  </button>
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
