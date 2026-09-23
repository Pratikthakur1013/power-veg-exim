import React, { useState, useRef, useCallback } from "react";
import { MotionValue, useMotionValueEvent, motion, AnimatePresence } from "motion/react";
import { Globe2, Sprout, ShieldCheck, Ship, ArrowRight, MessageCircle } from "lucide-react";

interface OverlayProps {
  scrollYProgress: MotionValue<number>;
}

// Scene thresholds — one scene is active at a time, zero overlap possible
const THRESHOLDS = [0.17, 0.34, 0.51, 0.68, 0.85] as const;

function getScene(v: number): number {
  if (v < THRESHOLDS[0]) return 0;
  if (v < THRESHOLDS[1]) return 1;
  if (v < THRESHOLDS[2]) return 2;
  if (v < THRESHOLDS[3]) return 3;
  if (v < THRESHOLDS[4]) return 4;
  return 5;
}

// ─── Ripple Effect Hook ────────────────────────────────────────────────────────
interface Ripple {
  id: number;
  x: number;
  y: number;
}

function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const addRipple = useCallback((e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - btn.left;
    const y = clientY - btn.top;
    const id = nextId.current++;

    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  return { ripples, addRipple };
}

// ─── Mobile Primary CTA Button ────────────────────────────────────────────────
interface MobilePrimaryBtnProps {
  onClick: () => void;
  label: string;
}

function MobilePrimaryBtn({ onClick, label }: MobilePrimaryBtnProps) {
  const { ripples, addRipple } = useRipple();

  const handleInteraction = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    addRipple(e);
    onClick();
  };

  return (
    <motion.button
      onClick={handleInteraction as React.MouseEventHandler<HTMLButtonElement>}
      onTouchStart={addRipple as unknown as React.TouchEventHandler<HTMLButtonElement>}
      aria-label="Explore our premium agricultural products"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.3 }}
      className="relative overflow-hidden flex items-center justify-center gap-2.5 cursor-pointer select-none"
      style={{
        height: "56px",
        minWidth: "160px",
        flex: 1,
        borderRadius: "9999px",
        background: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
        boxShadow: "0 12px 28px rgba(249,115,22,0.30), 0 4px 8px rgba(249,115,22,0.15)",
        border: "none",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      // Focus ring for accessibility
      onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(249,115,22,0.5), 0 12px 28px rgba(249,115,22,0.30)"; }}
      onBlur={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 28px rgba(249,115,22,0.30), 0 4px 8px rgba(249,115,22,0.15)"; }}
    >
      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute pointer-events-none rounded-full bg-white/30"
          style={{
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            transform: "translate(-50%, -50%) scale(0)",
            animation: "mobile-cta-ripple 0.6s cubic-bezier(0.4,0,0.2,1) forwards",
          }}
        />
      ))}

      {/* Sheen highlight */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)",
        }}
      />

      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          color: "#ffffff",
          letterSpacing: "0.3px",
          lineHeight: 1,
          position: "relative",
          zIndex: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <ArrowRight
        style={{ width: 17, height: 17, color: "#ffffff", flexShrink: 0, position: "relative", zIndex: 1 }}
        strokeWidth={2.5}
      />
    </motion.button>
  );
}

// ─── Mobile Secondary CTA Button ─────────────────────────────────────────────
interface MobileSecondaryBtnProps {
  onClick: () => void;
  label: string;
}

function MobileSecondaryBtn({ onClick, label }: MobileSecondaryBtnProps) {
  const { ripples, addRipple } = useRipple();
  const [isHovered, setIsHovered] = useState(false);

  const handleInteraction = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    addRipple(e);
    onClick();
  };

  return (
    <motion.button
      onClick={handleInteraction as React.MouseEventHandler<HTMLButtonElement>}
      onTouchStart={addRipple as unknown as React.TouchEventHandler<HTMLButtonElement>}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-label="Get a quote from our export team"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.3 }}
      className="relative overflow-hidden flex items-center justify-center gap-2.5 cursor-pointer select-none"
      style={{
        height: "56px",
        minWidth: "160px",
        flex: 1,
        borderRadius: "9999px",
        background: isHovered
          ? "linear-gradient(135deg, #0E8ACF 0%, #003F7F 100%)"
          : "linear-gradient(135deg, #003F7F 0%, #0E8ACF 100%)",
        border: "none",
        boxShadow: isHovered
          ? "0 12px 28px rgba(14,138,207,0.35), 0 4px 8px rgba(0,63,127,0.2)"
          : "0 12px 28px rgba(0,63,127,0.30), 0 4px 8px rgba(14,138,207,0.15)",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
      }}
      onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(14,138,207,0.5), 0 12px 28px rgba(0,63,127,0.30)"; }}
      onBlur={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 28px rgba(0,63,127,0.30), 0 4px 8px rgba(14,138,207,0.15)"; }}
    >
      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute pointer-events-none rounded-full bg-white/25"
          style={{
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            transform: "translate(-50%, -50%) scale(0)",
            animation: "mobile-cta-ripple 0.6s cubic-bezier(0.4,0,0.2,1) forwards",
          }}
        />
      ))}

      {/* Glass reflection streak */}
      <motion.span
        className="absolute top-0 left-0 w-full pointer-events-none rounded-full"
        style={{
          height: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
        }}
        animate={{ opacity: isHovered ? 0.9 : 0.5 }}
        transition={{ duration: 0.3 }}
      />

      <MessageCircle
        style={{ width: 17, height: 17, color: "#ffffff", flexShrink: 0, position: "relative", zIndex: 1 }}
        strokeWidth={2}
      />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          color: "#ffffff",
          letterSpacing: "0.3px",
          lineHeight: 1,
          position: "relative",
          zIndex: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}

// ─── Mobile CTA Container ──────────────────────────────────────────────────────
interface MobileCtaGroupProps {
  onPrimary: () => void;
  onSecondary: () => void;
  visible: boolean;
}

function MobileCtaGroup({ onPrimary, onSecondary, visible }: MobileCtaGroupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mobile-cta-group"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="pointer-events-auto w-full"
          // Constrain to left side on ≥375px, stack on <360px
          style={{ maxWidth: "min(88vw, 360px)" }}
        >
          {/* ≥375px: side-by-side row */}
          <div
            className="hidden"
            style={{
              // We use a JS-driven inline approach instead of Tailwind breakpoints
              // to avoid adding new Tailwind classes that could affect desktop
            }}
          />

          {/* Responsive row: side-by-side on ≥360px, stacked on <360px */}
          <style dangerouslySetInnerHTML={{ __html: `
            .mobile-cta-row {
              display: flex;
              flex-direction: column;
              gap: 14px;
              width: 100%;
            }
            .mobile-cta-row > button {
              width: 100% !important;
              flex: none !important;
            }
            @media (min-width: 360px) {
              .mobile-cta-row {
                flex-direction: row;
                gap: 16px;
              }
              .mobile-cta-row > button {
                width: auto !important;
                flex: 1 !important;
              }
            }
            @keyframes mobile-cta-ripple {
              to {
                transform: translate(-50%, -50%) scale(20);
                opacity: 0;
              }
            }
          ` }} />

          <div className="mobile-cta-row">
            <MobilePrimaryBtn onClick={onPrimary} label="Explore Products" />
            <MobileSecondaryBtn onClick={onSecondary} label="Get a Quote" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Overlay Component ───────────────────────────────────────────────────
export default function Overlay({ scrollYProgress }: OverlayProps) {
  const [active, setActive] = useState(0);

  // Only fires when crossing a threshold boundary — not on every scroll pixel
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = getScene(v);
    if (next !== active) setActive(next);
  });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Shared CSS for each scene panel — in/out driven purely by `active` index
  const sceneClass = (index: number) =>
    `absolute inset-0 flex transition-all duration-700 ease-in-out ${
      active === index
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-6 pointer-events-none"
    }`;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">

      {/* ── Scene 0 : Brand Reveal ───────────────────────────────────── */}
      <div className={`${sceneClass(0)} flex-col items-center justify-center text-center px-4`}>
        <span className="font-mono text-xs md:text-sm text-[#FF7A1A] uppercase tracking-[0.3em] mb-4 block font-bold">
          Power Veg Exim
        </span>
        <h1 className="font-display font-black text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none mb-4 md:mb-6 text-white drop-shadow-2xl">
          DELIVERING FRESHNESS
          <span className="block bg-gradient-to-r from-[#0E8ACF] via-[#FF7A1A] to-orange-400 bg-clip-text text-transparent">
            WORLDWIDE.
          </span>
        </h1>
        <p className="font-sans text-xs sm:text-sm md:text-xl text-neutral-300 max-w-xl font-light tracking-wide leading-relaxed px-2 md:px-0">
          Global Agricultural Exporter · Connecting Indian Farms To International Markets.
        </p>
      </div>

      {/* ── Scene 1 : Farm Origin ────────────────────────────────────── */}
      <div className={`${sceneClass(1)} items-center justify-center md:justify-start px-4 md:px-24`}>
        <div className="w-full max-w-xl bg-[#0B1020]/75 backdrop-blur-md border border-white/10 p-5 md:p-12 rounded-2xl md:rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FF7A1A] uppercase tracking-wider mb-4">
            <Sprout className="w-4 h-4" />
            <span>01 / Farm Origin</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight leading-tight text-white mb-4">
            Freshness Sourced<br />
            <span className="text-[#0E8ACF]">Directly From Farms</span>
          </h2>
          <p className="font-sans text-xs md:text-sm text-neutral-300 leading-relaxed font-light mb-6">
            We partner with certified growers in India's agricultural hubs to harvest premium onions,
            grapes, pomegranates, and fresh vegetables at peak maturity.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Onions", "Okra", "Pomegranates", "Grapes"].map((item) => (
              <span key={item} className="font-mono text-[10px] bg-white/5 border border-white/10 text-neutral-300 px-3 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scene 2 : Quality Control ────────────────────────────────── */}
      <div className={`${sceneClass(2)} items-center justify-center md:justify-end px-4 md:px-24`}>
        <div className="w-full max-w-xl bg-[#0B1020]/75 backdrop-blur-md border border-white/10 p-5 md:p-12 rounded-2xl md:rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FF7A1A] uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>02 / Quality Control</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight leading-tight text-white mb-4">
            Quality Assured<br />
            <span className="text-[#0E8ACF]">At Every Stage</span>
          </h2>
          <p className="font-sans text-xs md:text-sm text-neutral-300 leading-relaxed font-light">
            Every crop goes through strict sizing, double-skin grading, defect checks, and
            export-compliant ventilated packaging to lock in nutrients and freshness.
          </p>
        </div>
      </div>

      {/* ── Scene 3 : Maritime Logistics ─────────────────────────────── */}
      <div className={`${sceneClass(3)} items-center justify-center md:justify-start px-4 md:px-24`}>
        <div className="w-full max-w-xl bg-[#0B1020]/75 backdrop-blur-md border border-white/10 p-5 md:p-12 rounded-2xl md:rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FF7A1A] uppercase tracking-wider mb-4">
            <Ship className="w-4 h-4" />
            <span>03 / Maritime Transit</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight leading-tight text-white mb-4">
            Reliable Global<br />
            <span className="text-[#0E8ACF]">Supply Chain</span>
          </h2>
          <p className="font-sans text-xs md:text-sm text-neutral-300 leading-relaxed font-light">
            Through custom-cleared refrigerated reefers and elite global vessel-line partnerships,
            we establish seamless transit paths from India to international ports.
          </p>
        </div>
      </div>

      {/* ── Scene 4 : Worldwide Presence ─────────────────────────────── */}
      <div className={`${sceneClass(4)} items-center justify-center md:justify-end px-4 md:px-24`}>
        <div className="w-full max-w-xl bg-[#0B1020]/75 backdrop-blur-md border border-white/10 p-5 md:p-12 rounded-2xl md:rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FF7A1A] uppercase tracking-wider mb-4">
            <Globe2 className="w-4 h-4" />
            <span>04 / Target Ports</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight leading-tight text-white mb-4">
            Worldwide<br />
            <span className="text-[#0E8ACF]">Presence</span>
          </h2>
          <p className="font-sans text-xs md:text-sm text-neutral-300 leading-relaxed font-light mb-6">
            Active routes, custom clearances, and commercial pipelines to buyers in the Middle East,
            Southeast Asia, and Europe.
          </p>
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div>
              <span className="block font-mono text-2xl font-black text-[#FF7A1A]">25+</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Export Destinations</span>
            </div>
            <div>
              <span className="block font-mono text-2xl font-black text-white">100%</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Grade A Sourced</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scene 5 : Final CTA ───────────────────────────────────────── */}
      <div className={`${sceneClass(5)} flex-col justify-end px-0 md:px-4`}>

        {/* ── DESKTOP CTA (unchanged, hidden on mobile) ── */}
        <div className="hidden md:flex items-center justify-center gap-4 pb-20 w-full pointer-events-auto">
          <button
            onClick={() => scrollToSection("products")}
            className="cursor-pointer text-white text-xs font-mono uppercase tracking-widest px-10 py-4 rounded-full transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
              boxShadow: "0 8px 32px rgba(249,115,22,0.45), 0 2px 8px rgba(249,115,22,0.25)",
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(249,115,22,0.55), 0 4px 12px rgba(249,115,22,0.30)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(249,115,22,0.45), 0 2px 8px rgba(249,115,22,0.25)"; }}
          >
            Explore Products
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="cursor-pointer text-white text-xs font-mono uppercase tracking-widest px-10 py-4 rounded-full transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #0A2A5E 0%, #0E4A8A 100%)",
              border: "1.5px solid rgba(14,138,207,0.6)",
              boxShadow: "0 8px 32px rgba(0,63,127,0.45), 0 2px 8px rgba(14,138,207,0.20)",
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(14,138,207,0.55), 0 4px 12px rgba(0,63,127,0.30)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,63,127,0.45), 0 2px 8px rgba(14,138,207,0.20)"; }}
          >
            Contact Us
          </button>
        </div>

        {/* ── MOBILE CTA (premium redesign, hidden on md+) ── */}
        <div
          className="md:hidden flex items-end justify-start pb-16 px-5 w-full"
          style={{ minHeight: 0 }}
        >
          <MobileCtaGroup
            onPrimary={() => scrollToSection("products")}
            onSecondary={() => scrollToSection("contact")}
            visible={active === 5}
          />
        </div>

      </div>

      {/* Scroll Down indicator — only visible in Scene 0 */}
      <div className={`absolute bottom-5 md:bottom-10 right-4 md:right-8 flex flex-col items-center gap-1 transition-all duration-500 ${active === 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
        <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-[0.25em]">
          Scroll Down
        </span>
        <div className="flex flex-col items-center -space-y-1.5">
          <svg className="w-3 h-3 text-[#FF7A1A] animate-bounce [animation-delay:0ms]" fill="none" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg className="w-3 h-3 text-[#FF7A1A]/50 animate-bounce [animation-delay:150ms]" fill="none" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

    </div>
  );
}
