import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function AboutUs() {
  return (
    <section id="about" className="py-16 md:py-32 px-4 md:px-24 bg-[#0B1020] relative border-t border-neutral-900 z-20 scroll-mt-24 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0E8ACF]/3 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 md:space-y-28 relative z-10">
        
        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left — story text */}
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs text-[#FF7A1A] uppercase tracking-[0.25em] block font-bold">
              01 / WHO WE ARE
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight text-white leading-tight">
              Bringing Indian Farms <br />
              <span className="text-[#0E8ACF]">To Global Ports.</span>
            </h2>
            <p className="font-sans text-neutral-300 text-sm md:text-base font-light leading-relaxed">
              Power Veg Exim is India's trusted B2B agricultural exporter, specializing in premium
              onions, grapes, pomegranates, and fresh vegetables. Based near Nashik, Maharashtra —
              India's onion capital — we grade directly at source and clear customs at speed.
            </p>
            <p className="font-sans text-neutral-400 text-xs md:text-sm leading-relaxed font-light">
              By maintaining rigorous supply chains, cold cargo ventilation, and phytosanitary
              compliance, we secure the nutritional life of crops across oceans.
            </p>

            {/* Quick credentials */}
            <div className="flex flex-wrap gap-3 pt-2">
              {["APEDA Registered", "IEC Certified", "Direct Farm Procurement", "Cold Chain Ready"].map((tag) => (
                <span key={tag} className="font-mono text-[10px] text-neutral-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Company Logo showcase */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            {/* Glow backdrop */}
            <div className="relative flex items-center justify-center">
              {/* Radial glow rings */}
              <div className="absolute w-80 h-80 rounded-full bg-[#FF7A1A]/20 blur-3xl animate-heartbeat" />
              <div className="absolute w-56 h-56 rounded-full bg-[#0E8ACF]/20 blur-2xl animate-heartbeat" style={{ animationDelay: '0.1s' }} />

              {/* Logo container with border ring */}
              <div className="relative w-56 h-56 md:w-80 md:h-80 rounded-full flex items-center justify-center bg-gradient-to-br from-white/3 to-white/0 border border-white/10 shadow-[0_0_60px_rgba(255,122,26,0.15)]">
                {/* Inner subtle ring */}
                <div className="absolute inset-4 rounded-full border border-white/5 animate-pulse" />

                {/* The actual logo */}
                <img
                  src="/logo.jpg"
                  alt="Power Veg Exim — Delivering Freshness Worldwide"
                  className="w-44 h-44 md:w-64 md:h-64 object-contain drop-shadow-2xl rounded-full"
                />
              </div>
            </div>

            {/* Tagline below logo */}
            <p
              className="mt-12 text-center font-bold text-lg text-neutral-300 uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              <span className="text-white">Delivering</span>{" "}
              <span className="text-[#FF7A1A]">Freshness</span>{" "}
              <span className="text-white">Worldwide</span>
            </p>
          </div>
        </div>


        {/* Trade Counters Section */}
        <div className="bg-[#0f162d]/30 border border-neutral-800/60 rounded-2xl md:rounded-3xl p-6 md:p-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12 text-center">
            
            <div className="space-y-2">
              <span className="block font-display text-4xl md:text-5xl font-black text-white">
                100%
              </span>
              <span className="block font-mono text-[10px] text-[#FF7A1A] uppercase tracking-widest font-bold">
                DOCUMENTED SOURCING
              </span>
              <p className="font-sans text-neutral-400 text-xs font-light max-w-[200px] mx-auto leading-relaxed mt-2">
                Working with verified farms and suppliers.
              </p>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-x border-neutral-800/80 pt-8 sm:pt-0">
              <span className="block font-display text-4xl md:text-5xl font-black text-[#0E8ACF]">
                IEC
              </span>
              <span className="block font-mono text-[10px] text-neutral-300 uppercase tracking-widest font-bold">
                EXPORT READY
              </span>
              <p className="font-sans text-neutral-400 text-xs font-light max-w-[200px] mx-auto leading-relaxed mt-2">
                Registered for international trade operations.
              </p>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 pt-8 sm:pt-0">
              <span className="block font-display text-4xl md:text-4xl lg:text-5xl font-black text-white">
                QUALITY
              </span>
              <span className="block font-mono text-[10px] text-[#FF7A1A] uppercase tracking-widest font-bold">
                INSPECTION PROCESS
              </span>
              <p className="font-sans text-neutral-400 text-xs font-light max-w-[200px] mx-auto leading-relaxed mt-2">
                Quality checks before shipment dispatch.
              </p>
            </div>

          </div>
        </div>

        {/* Why Choose Us */}
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="font-mono text-xs text-[#FF7A1A] uppercase tracking-[0.25em] block font-bold">
              02 / COMPLIANCE
            </span>
            <h3 className="font-display font-black text-3xl md:text-4xl text-white">
              Why Partner With Us?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="flex gap-4 items-start bg-[#0b1020] p-6 rounded-2xl border border-neutral-800/40">
              <CheckCircle2 className="w-5 h-5 text-[#FF7A1A] shrink-0 mt-1" />
              <div>
                <h5 className="font-display font-bold text-white text-base">APEDA & IEC Registered</h5>
                <p className="font-sans text-neutral-400 text-xs font-light leading-relaxed mt-2">
                  Full registration with agricultural and trade ministries, securing absolute export authorization credentials.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-[#0b1020] p-6 rounded-2xl border border-neutral-800/40">
              <CheckCircle2 className="w-5 h-5 text-[#0E8ACF] shrink-0 mt-1" />
              <div>
                <h5 className="font-display font-bold text-white text-base">Direct Field Procurement</h5>
                <p className="font-sans text-neutral-400 text-xs font-light leading-relaxed mt-2">
                  Procuring directly from onion fields in Lasalgaon and farm cooperatives to offer stable, speculation-free FOB prices.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-[#0b1020] p-6 rounded-2xl border border-neutral-800/40">
              <CheckCircle2 className="w-5 h-5 text-[#FF7A1A] shrink-0 mt-1" />
              <div>
                <h5 className="font-display font-bold text-white text-base">Cold Chain & Reefers</h5>
                <p className="font-sans text-neutral-400 text-xs font-light leading-relaxed mt-2">
                  Utilizing refrigerated container reefers set at optimal humidity levels to prevent dehydration or sprouting cycles.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
