import React, { useRef, useState, useEffect } from "react";
import { useScroll } from "motion/react";

import Navbar from "../layouts/Navbar";
import ScrollyCanvas from "../components/ScrollyCanvas";
import Overlay from "../layouts/Overlay";
import Products from "../components/Products";
import AboutUs from "../components/AboutUs";
import Markets from "../components/Markets";
import Contact from "../components/Contact";
import Footer from "../layouts/Footer";

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Listen for the hidden admin trigger from Navbar logo
    const handleOpenAdmin = () => {
      window.location.href = "/admin";
    };
    window.addEventListener("openAdminPanel", handleOpenAdmin);
    return () => window.removeEventListener("openAdminPanel", handleOpenAdmin);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/public/data");
        if (res.ok) {
          await res.json();
        }
      } catch (err) {
        // Suppress errors silently for public data
      }
    }
    loadData();
  }, []);

  /**
   * scrollYProgress tracks 0→1 across the entire 500vh container.
   * ONE hook at root level, passed as prop — no hook-in-hook violations.
   */
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div className="relative bg-[#0B1020] text-slate-900 font-sans selection:bg-[#FF7A1A]/25 selection:text-white">


      {/* FLOAT CONTACT WIDGETS */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/919890761639?text=Hello%20Power%20Veg%20Exim%2C%20I%20would%20like%20to%20inquire%20about%20your%20export%20products."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: "#25D366" }}
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40 group-hover:opacity-0" />
          {/* WhatsApp SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-6 h-6 fill-white relative z-10"
          >
            <path d="M16 0C7.163 0 0 7.163 0 16c0 2.83.738 5.484 2.027 7.788L0 32l8.418-2.004A15.938 15.938 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.25a13.21 13.21 0 0 1-6.733-1.839l-.483-.287-4.998 1.19 1.243-4.862-.316-.5A13.215 13.215 0 0 1 2.75 16C2.75 8.682 8.682 2.75 16 2.75S29.25 8.682 29.25 16 23.318 29.25 16 29.25zm7.273-9.875c-.398-.2-2.356-1.162-2.72-1.294-.365-.133-.63-.2-.896.2-.265.398-1.029 1.294-1.261 1.56-.232.265-.465.298-.863.1-.398-.2-1.68-.62-3.2-1.977-1.183-1.056-1.982-2.361-2.214-2.759-.232-.398-.025-.613.174-.812.18-.178.398-.465.597-.697.2-.232.265-.398.398-.664.133-.265.066-.497-.033-.697-.1-.2-.896-2.16-1.228-2.958-.323-.777-.65-.672-.896-.684l-.763-.013c-.265 0-.697.1-1.062.497-.365.398-1.394 1.362-1.394 3.322s1.427 3.853 1.626 4.12c.2.265 2.808 4.286 6.803 6.01.951.41 1.693.655 2.272.839.954.304 1.823.261 2.51.158.765-.114 2.356-.963 2.688-1.893.332-.93.332-1.727.232-1.893-.099-.166-.364-.265-.763-.465z"/>
          </svg>
          {/* Tooltip */}
          <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-[#0B1020] text-white text-xs font-mono px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/10 shadow-lg pointer-events-none">
            Chat on WhatsApp
          </span>
        </a>
      </div>

      <Navbar />

      <main>
        {/*
         * ┌─────────────────────────────────────────────────────────────┐
         * │  500vh scroll driver                                        │
         * │  The sticky child (h-screen) pins for the whole scroll.    │
         * │  Canvas + Overlay both live INSIDE that sticky div so      │
         * │  every `absolute inset-0` scene is relative to 100vh.      │
         * └─────────────────────────────────────────────────────────────┘
         */}
        <div ref={scrollContainerRef} className="relative w-full h-[500vh]">
          {/*
           * Sticky viewport — pointer-events-none on the whole frame so
           * wheel/touch events fall through to the 500vh scroll driver.
           * Only Scene-6 CTA buttons restore pointer-events-auto.
           */}
          <div className="sticky top-0 w-full h-screen overflow-hidden pointer-events-none">

            {/* Background gradient tint for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/70 z-[1]" />

            {/* Image sequence canvas (desktop) / static hero (mobile) */}
            <div className="absolute inset-0 z-0">
              <ScrollyCanvas scrollYProgress={scrollYProgress} />
            </div>

            {/* Cinematic text scenes — each scene is absolute inset-0 WITHIN h-screen */}
            <div className="absolute inset-0 z-20">
              <Overlay scrollYProgress={scrollYProgress} />
            </div>

          </div>
        </div>

        {/* ── Below-the-fold page sections ────────────────────────────────── */}
        <Products />
        <AboutUs />
        <Markets />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
