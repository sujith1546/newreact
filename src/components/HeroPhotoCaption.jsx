import { motion } from "framer-motion";
import "./hero-photo-caption.css";

export default function HeroPhotoCaption({ label = "Education", title = "B.Tech CSE, VIT Vellore", subtitle = "8.7 CGPA" }) {
  return (
    <>
      <motion.div
        className="hero-photo-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      />
      <motion.div
        className="hero-photo-caption"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
      >
        <p className="caption-label">{label}</p>
        <p className="caption-title">{title}</p>
        <p className="caption-subtitle">{subtitle}</p>
      </motion.div>
    </>
  );
}
