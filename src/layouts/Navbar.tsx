import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, ChevronDown, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { translatePage, resetPage } from "../utils/translator";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [language, setLanguage] = useState<string>("EN");
  const [isTranslating, setIsTranslating] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  
  // Hidden Admin Trigger State
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    setIsHolding(true);
    if (navigator.vibrate) navigator.vibrate(50); // Light initial haptic
    
    holdTimeoutRef.current = setTimeout(() => {
      setIsCompleted(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Success haptic
      window.dispatchEvent(new CustomEvent("openAdminPanel"));
      setIsHolding(false);
      
      // Reset glow after 2 seconds
      setTimeout(() => setIsCompleted(false), 2000);
    }, 3000); // Exactly 3 seconds
  };

  const cancelHold = () => {
    setIsHolding(false);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isHolding) startHold();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cancelHold();
      if (!isCompleted) {
         window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCompleted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Detect active language from googtrans cookie on mount
  useEffect(() => {
    try {
      const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
      if (match) {
        const code = match[1];
        const found = languages.find(l => l.code === code);
        if (found) setLanguage(found.label);
      }
    } catch (err) {}
    }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Close desktop lang dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, mobileMenuOpen ? 350 : 0);
  };

  const navLinks = [
    { label: "Products", id: "products", emoji: "🌿" },
    { label: "About Us", id: "about", emoji: "🏢" },
    { label: "Markets", id: "markets", emoji: "🌍" },
    { label: "Contact", id: "contact", emoji: "📞" },
  ];

  const handleLanguageChange = async (code: string, label: string) => {
    if (isTranslating) return;
    setLanguage(label);
    setShowLangMenu(false);
    setMobileLangOpen(false);

    if (code === "en") {
      resetPage();
      return;
    }

    setIsTranslating(true);
    try {
      await translatePage(code);
    } finally {
      setIsTranslating(false);
    }
  };

  const languages = [
    { code: "en", label: "EN", name: "English", flag: "🇺🇸" },
    { code: "hi", label: "HI", name: "Hindi", flag: "🇮🇳" },
    { code: "ar", label: "AR", name: "Arabic", flag: "🇸🇦" },
    { code: "fr", label: "FR", name: "French", flag: "🇫🇷" },
    { code: "es", label: "ES", name: "Spanish", flag: "🇪🇸" },
  ];

  return (
    <>
      {/* ===================== SHARED HEADER ===================== */}
      <header
        className="fixed top-0 left-0 w-full z-50 transition-all duration-500 py-4 backdrop-blur-md"
        style={{
          background: isScrolled
            ? "rgba(11,16,32,0.72)"
            : "linear-gradient(to bottom, rgba(11,16,32,0.6) 0%, rgba(11,16,32,0.2) 70%, transparent 100%)",
          borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 xl:px-12 flex items-center justify-between">

          {/* Brand Logo with Hidden Admin Trigger */}
          <motion.a
            href="#"
            onClick={handleClick}
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            animate={{ scale: isHolding ? 1.03 : 1 }}
            transition={{ duration: 0.3 }}
            aria-label="Power Veg Exim Home. Press and hold to access settings."
            className={`relative flex items-center group h-10 md:h-12 w-[140px] md:w-[170px] outline-none ${isHolding ? "cursor-progress" : ""}`}
          >
            {/* Circular Progress Ring */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none z-0">
               <motion.circle
                  cx="96" cy="96" r="40"
                  fill="none"
                  stroke="#0E8ACF"
                  strokeWidth="3"
                  initial={{ pathLength: 0, opacity: 0, rotate: -90 }}
                  animate={{ 
                    pathLength: isHolding ? 1 : 0, 
                    opacity: isHolding ? 1 : 0,
                  }}
                  transition={{ 
                    pathLength: { duration: isHolding ? 3 : 0.3, ease: "linear" },
                    opacity: { duration: 0.3 }
                  }}
                  style={{ originX: "50%", originY: "50%" }}
               />
               <motion.circle
                  cx="96" cy="96" r="40"
                  fill="none"
                  stroke="#0E8ACF"
                  strokeWidth="8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isCompleted ? [0, 0.8, 0] : 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ filter: "blur(6px)" }}
               />
            </svg>

            <style dangerouslySetInnerHTML={{ __html: `
              .navbar-logo-img {
                height: 123px !important;
                max-height: none !important;
              }
              @media (min-width: 768px) {
                .navbar-logo-img {
                  height: 147px !important;
                }
              }
            ` }} />
            <img
              src="/logo.png"
              alt="Power Veg Exim Logo"
              className="absolute top-1/2 -translate-y-1/2 left-0 w-auto object-contain max-w-none navbar-logo-img z-10"
            />
          </motion.a>

          {/* ── DESKTOP Nav Links (hidden on mobile) ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="relative px-4 py-2 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 cursor-pointer group"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "rgba(255,255,255,0.82)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.82)"; }}
              >
                {label}
                <span className="absolute bottom-0 left-4 right-4 h-px bg-[#FF7A1A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            ))}
          </nav>

          {/* ── DESKTOP CTA Button (hidden on mobile) ── */}
          <div className="hidden md:block">
            <button
              onClick={() => scrollToSection("contact")}
              className="relative overflow-hidden bg-[#FF7A1A] hover:bg-orange-500 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,122,26,0.3)] hover:shadow-[0_0_32px_rgba(255,122,26,0.5)] cursor-pointer"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.1em" }}
            >
              Request Quote
            </button>
          </div>

          {/* ── DESKTOP Language Selector (hidden on mobile) ── */}
          <div ref={langDropdownRef} className="relative hidden md:block notranslate">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`flex items-center gap-1 transition-colors cursor-pointer p-2 ${
                isTranslating ? "text-[#FF7A1A] cursor-wait" : ""
              }`}
              style={{ color: "rgba(255,255,255,0.75)" }}
              aria-label="Select language"
              disabled={isTranslating}
            >
              {isTranslating
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Globe className="w-5 h-5" />}
              <span className="uppercase text-sm font-semibold">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-3 w-40 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-slate-400 font-mono border-b border-slate-100 mb-1">
                  Translate
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code, lang.label)}
                    className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                      language === lang.label
                        ? "text-[#FF7A1A] bg-[#FF7A1A]/5 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="mr-2">{lang.label}</span>
                    <span className="text-xs text-neutral-500">{lang.name}</span>
                    {language === lang.label && (
                      <span className="float-right">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── MOBILE: Right-side controls (Globe + Hamburger) — hidden on md+ ── */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Globe button (inline in header) */}
            <button
              onClick={() => { setMobileMenuOpen(true); setTimeout(() => setMobileLangOpen(true), 50); }}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 notranslate"
              style={{ color: "rgba(255,255,255,0.85)" }}
              aria-label="Language"
            >
              <Globe className="w-[18px] h-[18px]" />
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
              }}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* ===================== MOBILE DRAWER (≤767px only) ===================== */}

      {/* Backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`md:hidden fixed inset-0 z-[60] transition-all duration-400 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: mobileMenuOpen
            ? "linear-gradient(135deg, rgba(0,31,67,0.65) 0%, rgba(0,63,127,0.50) 100%)"
            : "transparent",
          backdropFilter: mobileMenuOpen ? "blur(6px)" : "blur(0px)",
          WebkitBackdropFilter: mobileMenuOpen ? "blur(6px)" : "blur(0px)",
          transition: "opacity 0.35s ease, backdrop-filter 0.35s ease",
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="md:hidden fixed top-0 right-0 h-full z-[70] flex flex-col"
        style={{
          width: "min(82vw, 320px)",
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(110%)",
          transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
          background: "linear-gradient(160deg, #ffffff 0%, #f8faff 60%, #eef3ff 100%)",
          boxShadow: mobileMenuOpen ? "-8px 0 40px rgba(0, 31, 67, 0.18), -2px 0 8px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {/* Drawer Header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{
            borderBottom: "1px solid rgba(203, 213, 225, 0.6)",
          }}
        >
          {/* Mini Logo in Drawer */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #003F7F 0%, #0E8ACF 100%)",
              }}
            >
              <span className="text-white text-xs font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>PV</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-[#003F7F] tracking-tight leading-none" style={{ fontFamily: "'Oswald', sans-serif" }}>
                POWER VEG
              </span>
              <span className="text-[8px] font-semibold text-[#0E8ACF] tracking-widest uppercase leading-none mt-0.5">
                EXIM
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer"
            style={{ background: "rgba(241, 245, 249, 0.8)" }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 mb-3 mt-1">
            Navigation
          </p>

          {navLinks.map(({ label, id, emoji }, index) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="w-full flex items-center justify-between px-3 py-3.5 rounded-xl mb-1.5 text-left group cursor-pointer transition-all duration-200"
              style={{
                transitionDelay: mobileMenuOpen ? `${index * 55 + 80}ms` : "0ms",
                transform: mobileMenuOpen ? "translateX(0)" : "translateX(24px)",
                opacity: mobileMenuOpen ? 1 : 0,
                transition: `transform 0.38s cubic-bezier(0.32, 0.72, 0, 1) ${index * 55 + 80}ms, opacity 0.38s ease ${index * 55 + 80}ms, background 0.15s ease`,
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0, 63, 127, 0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
              onTouchStart={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0, 63, 127, 0.06)";
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }, 200);
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg leading-none">{emoji}</span>
                <span
                  className="text-[13px] font-bold text-slate-700 uppercase tracking-[0.12em]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF7A1A] transition-colors duration-200" />
            </button>
          ))}

          {/* Divider */}
          <div className="my-4 h-px bg-slate-200/70 mx-2" />

          {/* Language Selector in Drawer */}
          <div className="notranslate">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 mb-2">
              Language
            </p>
            <button
              onClick={() => setMobileLangOpen(!mobileLangOpen)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: mobileLangOpen ? "rgba(0, 63, 127, 0.07)" : "rgba(241, 245, 249, 0.7)",
                border: mobileLangOpen ? "1px solid rgba(0,63,127,0.15)" : "1px solid transparent",
                transitionDelay: mobileMenuOpen ? "300ms" : "0ms",
                transform: mobileMenuOpen ? "translateX(0)" : "translateX(24px)",
                opacity: mobileMenuOpen ? 1 : 0,
                transition: `transform 0.38s cubic-bezier(0.32, 0.72, 0, 1) 300ms, opacity 0.38s ease 300ms, background 0.2s ease`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#003F7F]" />
                <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {languages.find(l => l.label === language)?.flag} {language}
                </span>
              </div>
              <ChevronDown
                className="w-4 h-4 text-slate-400 transition-transform duration-200"
                style={{ transform: mobileLangOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {/* Language sub-list */}
            <div
              style={{
                maxHeight: mobileLangOpen ? "220px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div className="pt-1 pb-1 px-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code, lang.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer transition-colors duration-150 ${
                      language === lang.label
                        ? "bg-[#FF7A1A]/8 text-[#FF7A1A]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-[12px] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {lang.name}
                      </span>
                      <span className={`text-[10px] font-bold tracking-wider ${language === lang.label ? "text-[#FF7A1A]" : "text-slate-400"}`}>
                        {lang.label}
                      </span>
                    </div>
                    {language === lang.label && (
                      <span className="text-[#FF7A1A] text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Drawer Footer — CTA */}
        <div
          className="px-5 pb-8 pt-4"
          style={{
            borderTop: "1px solid rgba(203, 213, 225, 0.6)",
            transitionDelay: mobileMenuOpen ? "360ms" : "0ms",
            transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
            opacity: mobileMenuOpen ? 1 : 0,
            transition: `transform 0.4s cubic-bezier(0.32, 0.72, 0, 1) 360ms, opacity 0.4s ease 360ms`,
          }}
        >
          <button
            onClick={() => scrollToSection("contact")}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-widest cursor-pointer transition-all duration-300 active:scale-[0.97]"
            style={{
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: "0.12em",
              background: "linear-gradient(135deg, #FF7A1A 0%, #FF9A4A 100%)",
              boxShadow: "0 8px 24px rgba(255, 122, 26, 0.35), 0 2px 6px rgba(255,122,26,0.2)",
            }}
          >
            Request a Quote
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-3 tracking-wide">
            Global Fresh Produce Exports
          </p>
        </div>
      </div>
    </>
  );
}
