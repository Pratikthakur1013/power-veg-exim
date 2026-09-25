import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Globe2, Anchor, Sprout, ShieldCheck } from "lucide-react";

/* ── helpers ───────────────────────────────────────────────────────────── */
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ── stats ─────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "25+", label: "Export\nDestinations" },
  { value: "100%", label: "Grade A\nSourced" },
];

const MOSAIC_IMAGES = [
  {
    // Red onions — same ID used in Products.tsx, proven working
    src: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
    alt: "Fresh Red Onion",
    label: "Red Onion",
  },
  {
    // Pomegranate — same ID used in Products.tsx
    src: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80",
    alt: "Bhagwa Pomegranate",
    label: "Pomegranate",
  },
  {
    // Grapes — same ID used in Products.tsx
    src: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80",
    alt: "Thompson Seedless Grapes",
    label: "Grapes",
  },
  {
    // Okra — same ID used in Products.tsx
    src: "https://images.unsplash.com/photo-1627485501819-44b209e99298?auto=format&fit=crop&w=800&q=80",
    alt: "Fresh Okra",
    label: "Okra",
  },
];


/* ── Export route steps ─────────────────────────────────────────────────── */
const ROUTE_STEPS = ["India", "UAE", "Europe", "SE Asia"];

/* ── Animated counter hook ──────────────────────────────────────────────── */
function useCountUp(target: string, duration = 1800) {
  const [display, setDisplay] = useState("0");
  const hasPlus = target.endsWith("+");
  const hasPct = target.endsWith("%");
  const num = parseInt(target.replace(/[^0-9]/g, ""), 10);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num);
      setDisplay(`${current}${hasPlus ? "+" : hasPct ? "%" : ""}`);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [num, hasPlus, hasPct, duration]);

  return display;
}

function StatCounter({ value, label }: { value: string; label: string }) {
  const count = useCountUp(value, 1600);
  return (
    <div className="flex flex-col">
      <span
        className="font-display font-black text-3xl md:text-4xl leading-none"
        style={{ color: "#FF7A1A" }}
      >
        {count}
      </span>
      <span
        className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400 mt-1 leading-tight whitespace-pre-line"
      >
        {label}
      </span>
    </div>
  );
}

/* ── Main hero ──────────────────────────────────────────────────────────── */
export default function StaticHero() {
  const [activeImage, setActiveImage] = useState(0);
  const [routeStep, setRouteStep] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(new Array(MOSAIC_IMAGES.length).fill(false));

  // Cycle the large featured image every 3.5 s
  useEffect(() => {
    const id = setInterval(() => {
      setActiveImage((p) => (p + 1) % MOSAIC_IMAGES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Animate the route breadcrumb
  useEffect(() => {
    const id = setInterval(() => {
      setRouteStep((p) => (p + 1) % ROUTE_STEPS.length);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const markLoaded = (i: number) => {
    setLoaded((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen overflow-hidden flex flex-col"
      style={{ background: "#0B1020" }}
      aria-label="Hero section"
    >
      {/* ── Background layers ─────────────────────────────────────────── */}

      {/* Animated grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,138,207,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,138,207,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Ambient glow orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 700,
            height: 700,
            top: "-20%",
            left: "-15%",
            background: "radial-gradient(circle, rgba(14,138,207,0.18) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 550,
            height: 550,
            bottom: "-10%",
            right: "-10%",
            background: "radial-gradient(circle, rgba(255,122,26,0.14) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 350,
            height: 350,
            top: "55%",
            left: "42%",
            background: "radial-gradient(circle, rgba(0,63,127,0.20) 0%, transparent 65%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* Diagonal accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute hidden lg:block"
        style={{
          width: 1,
          top: 0,
          bottom: 0,
          left: "50%",
          background: "linear-gradient(to bottom, transparent, rgba(14,138,207,0.12) 30%, rgba(14,138,207,0.12) 70%, transparent)",
        }}
      />

      {/* ── Main two-column layout ─────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center max-w-7xl mx-auto w-full px-5 md:px-10 xl:px-16 pt-28 md:pt-32 pb-20 gap-10 lg:gap-0">

        {/* ══════════════════ LEFT COLUMN ══════════════════ */}
        <div className="flex flex-col justify-center lg:w-[52%] lg:pr-10 xl:pr-16">

          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 mb-6">
            <div
              className="flex items-center justify-center w-6 h-6 rounded-md"
              style={{ background: "rgba(255,122,26,0.15)", border: "1px solid rgba(255,122,26,0.3)" }}
            >
              <Globe2 className="w-3.5 h-3.5" style={{ color: "#FF7A1A" }} />
            </div>
            <span
              className="font-mono text-[11px] uppercase tracking-[0.28em] font-semibold"
              style={{ color: "#FF7A1A" }}
            >
              04 / Target Ports
            </span>
            <span
              className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest hidden sm:inline"
            >
              · Power Veg Exim
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="font-display font-black leading-[0.92] tracking-tight mb-6"
            style={{
              fontSize: "clamp(3rem, 7vw, 6rem)",
              color: "#ffffff",
            }}
          >
            Worldwide
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #0E8ACF 0%, #4AB8F1 50%, #0E8ACF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Presence.
            </span>
          </h1>

          {/* Description */}
          <p
            className="font-sans text-sm md:text-base leading-relaxed font-light mb-8 max-w-lg"
            style={{ color: "#9ca3af" }}
          >
            Connecting India's finest agricultural produce with buyers across
            the Middle East, Europe, Southeast Asia and beyond.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-8 mb-10">
          {STATS.map((s) => (
              <React.Fragment key={s.value}>
                <StatCounter value={s.value} label={s.label} />
              </React.Fragment>
            ))}

            <div
              className="hidden sm:block w-px self-stretch"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            {/* Feature pills */}
            <div className="hidden sm:flex flex-col gap-2">
              {[
                { icon: Sprout, text: "Farm-to-Worldwide" },
                { icon: ShieldCheck, text: "Certified Quality" },
                { icon: Anchor, text: "Reefer Logistics" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "#0E8ACF" }} />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => scrollToSection("products")}
              className="group flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-widest px-7 py-4 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
                boxShadow: "0 8px 28px rgba(249,115,22,0.4), 0 2px 8px rgba(249,115,22,0.2)",
                color: "#fff",
                letterSpacing: "0.14em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 36px rgba(249,115,22,0.5), 0 4px 12px rgba(249,115,22,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(249,115,22,0.4), 0 2px 8px rgba(249,115,22,0.2)";
              }}
            >
              Explore Products
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => scrollToSection("contact")}
              className="flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-widest px-7 py-4 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                background: "rgba(14,138,207,0.08)",
                border: "1.5px solid rgba(14,138,207,0.45)",
                color: "#ffffff",
                letterSpacing: "0.14em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(14,138,207,0.18)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(14,138,207,0.7)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(14,138,207,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(14,138,207,0.45)";
                (e.currentTarget as HTMLElement).style.transform = "";
              }}
            >
              Contact Us
            </button>
          </div>

          {/* Animated export route */}
          <div className="mt-10 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">
              Active Routes:
            </span>
            {ROUTE_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <span
                  className="font-mono text-[10px] uppercase tracking-wide transition-all duration-500"
                  style={{
                    color: i === routeStep ? "#FF7A1A" : i < routeStep ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
                    fontWeight: i === routeStep ? 700 : 400,
                  }}
                >
                  {step}
                </span>
                {i < ROUTE_STEPS.length - 1 && (
                  <svg
                    width="14"
                    height="8"
                    viewBox="0 0 14 8"
                    fill="none"
                    className="opacity-40"
                  >
                    <path
                      d="M0 4h12M8 1l4 3-4 3"
                      stroke={i < routeStep ? "#FF7A1A" : "#9ca3af"}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ══════════════════ RIGHT COLUMN ══════════════════ */}
        <div className="w-full lg:w-[48%] flex items-center justify-center lg:justify-end">

          <div className="relative w-full max-w-[520px]">

            {/* ── Large featured image ───────────────────── */}
            <div
              className="relative rounded-2xl md:rounded-3xl overflow-hidden"
              style={{
                aspectRatio: "4/3",
                boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {/* Images — crossfade via opacity */}
              {MOSAIC_IMAGES.map((img, i) => (
                <div
                  key={img.src}
                  className="absolute inset-0 transition-opacity duration-1000"
                  style={{ opacity: i === activeImage ? 1 : 0 }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={() => markLoaded(i)}
                    className="w-full h-full object-cover"
                    style={{
                      transform: i === activeImage ? "scale(1.04)" : "scale(1.0)",
                      transition: "transform 4s ease-in-out",
                    }}
                  />
                </div>
              ))}

              {/* Gradient overlays */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(11,16,32,0.85) 0%, rgba(11,16,32,0.2) 40%, transparent 70%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(11,16,32,0.3) 0%, transparent 40%)",
                }}
              />

              {/* Bottom label */}
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">
                    Currently showing
                  </p>
                  <p className="font-display font-bold text-white text-lg leading-tight">
                    {MOSAIC_IMAGES[activeImage].label}
                  </p>
                </div>
                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {MOSAIC_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`Show ${MOSAIC_IMAGES[i].label}`}
                      className="transition-all duration-300 rounded-full cursor-pointer"
                      style={{
                        width: i === activeImage ? 20 : 6,
                        height: 6,
                        background: i === activeImage ? "#FF7A1A" : "rgba(255,255,255,0.3)",
                        border: "none",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Grade badge — top left */}
              <div
                className="absolute top-4 left-4"
                style={{
                  background: "rgba(0,63,127,0.8)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(14,138,207,0.3)",
                  borderRadius: "9999px",
                  padding: "4px 12px",
                }}
              >
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/80">
                  Export Grade · India Origin
                </span>
              </div>

              {/* Global Reach card — top right, INSIDE image */}
              <div
                className="absolute top-4 right-4 rounded-xl p-3"
                style={{
                  background: "rgba(11,16,40,0.82)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(14,138,207,0.3)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  minWidth: 130,
                }}
              >
                <p
                  className="font-mono text-[8px] uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: "#0E8ACF" }}
                >
                  Global Reach
                </p>
                <div className="flex items-center gap-1.5 mb-1">
                  <Globe2 className="w-3 h-3 flex-shrink-0" style={{ color: "#FF7A1A" }} />
                  <span className="font-sans text-[11px] font-semibold text-white">
                    25+ Countries
                  </span>
                </div>
                <p className="font-mono text-[8px] text-neutral-400 leading-snug">
                  UAE · Europe<br />
                  SE Asia · GCC
                </p>
              </div>
            </div>

            {/* ── Thumbnail strip ────────────────────────── */}
            <div className="mt-8 grid grid-cols-4 gap-2">
              {MOSAIC_IMAGES.map((img, i) => (
                <button
                  key={img.src}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Switch to ${img.label}`}
                  className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300"
                  style={{
                    aspectRatio: "1",
                    border: i === activeImage
                      ? "2px solid #FF7A1A"
                      : "2px solid rgba(255,255,255,0.08)",
                    transform: i === activeImage ? "scale(1.04)" : "scale(1)",
                    padding: 0,
                    background: "none",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: "rgba(11,16,32,0.35)",
                      opacity: i === activeImage ? 0 : 1,
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-1.5 pb-1"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    }}
                  >
                    <span className="font-mono text-[7px] text-white/70 uppercase tracking-wide">
                      {img.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom scroll indicator ────────────────────────────────────── */}
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-2 opacity-50">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-neutral-500">
            Scroll
          </span>
          <div
            className="w-px h-10 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="absolute top-0 w-full"
              style={{
                background: "linear-gradient(to bottom, #FF7A1A, transparent)",
                height: "40%",
                animation: "hero-scroll-line 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Keyframes ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes hero-scroll-line {
          0%   { transform: translateY(-100%); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(280%); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
