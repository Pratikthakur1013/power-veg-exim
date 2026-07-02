import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Loader — full-screen preloader displayed only on the very first page load.
 *
 * • White background, GIF perfectly centered.
 * • 2 000 ms visible, then 500 ms fade-out via Framer Motion.
 * • Body scroll locked while visible.
 * • Zero re-renders after unmount (sessionStorage flag prevents replay on
 *   same-tab navigation).
 */
export default function Loader() {
  // Skip on every visit after the first within the same browser session.
  const [visible, setVisible] = useState<boolean>(
    () => !sessionStorage.getItem("pve_loaded")
  );

  useEffect(() => {
    if (!visible) return;

    // Lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("pve_loaded", "1");
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prev;
    };
  }, [visible]);

  // Re-enable scroll immediately after state flips to false
  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pve-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Loading Power Veg Exim"
          aria-live="polite"
          role="status"
        >
          <img
            src="/logog.gif"
            alt="Power Veg Exim Loading"
            // Responsive size: 180px on mobile, 220px on tablet, 240px on desktop
            style={{
              width: "clamp(180px, 20vw, 240px)",
              height: "auto",
              display: "block",
              // Prevent browser caching from serving a static frame
              imageRendering: "auto",
            }}
            // No lazy loading — must appear immediately
            loading="eager"
            decoding="async"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
