import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * RollingText
 *
 * A scroll-triggered text effect. Each letter rolls up to reveal a colored
 * copy of itself. Delay grows with distance from the middle letter, so the
 * roll spreads from the center to the edges.
 *
 * Props:
 *   text        {string}  - The text to animate (required)
 *   speed       {number}  - Seconds of delay per letter from center (default 0.05)
 *   duration    {number}  - Roll time = max(0.5, duration / 4) seconds (default 4)
 *   className   {string}  - Extra CSS class names
 *   once        {boolean} - If true, plays only once; default false (replays on re-entry)
 *   accentColor {string}  - Override accent color inline; default uses CSS var --rolling-accent
 */
export function RollingText({
  text,
  speed = 0.05,
  duration = 4,
  className = "",
  once = false,
  accentColor,
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const seen = useInView(ref, { amount: 0.9, margin: "0px 0px -15% 0px", once });
  const active = reduceMotion ? true : seen;

  const roll = Math.max(0.5, duration / 4);
  const words = text.split(" ");
  const total = text.replace(/\s/g, "").length;
  const mid = (total - 1) / 2;
  let index = 0;

  const inlineStyle = accentColor ? { "--rolling-accent": accentColor } : {};

  return (
    <span
      ref={ref}
      role="img"
      aria-label={text}
      style={inlineStyle}
      className={`rolling-text-root ${className}`}
    >
      {words.map((word, wi) => (
        <span key={wi}>
          <span aria-hidden="true" style={{ display: "inline-flex" }}>
            {Array.from(word).map((char, ci) => {
              const i = index++;
              const delay = Math.abs(i - mid) * speed;
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    height: "1em",
                    overflow: "hidden",
                    lineHeight: 1,
                  }}
                >
                  <motion.span
                    style={{ display: "flex", flexDirection: "column" }}
                    initial={false}
                    animate={{ y: active ? "-50%" : "0%" }}
                    transition={{
                      duration: roll,
                      delay,
                      ease: [0.76, 0, 0.18, 1],
                    }}
                  >
                    <span style={{ display: "block", height: "1em", lineHeight: 1 }}>
                      {char}
                    </span>
                    <span
                      style={{
                        display: "block",
                        height: "1em",
                        lineHeight: 1,
                        color: "var(--rolling-accent, var(--primary-blue, #007bff))",
                      }}
                    >
                      {char}
                    </span>
                  </motion.span>
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </span>
  );
}

export default RollingText;
