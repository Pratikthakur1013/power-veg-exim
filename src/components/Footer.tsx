import React, { useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  Award,
  ExternalLink,
} from "lucide-react";

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const NAV_LINKS = [
  { label: "Products",  id: "products" },
  { label: "About Us",  id: "about"    },
  { label: "Markets",   id: "markets"  },
  { label: "Contact",   id: "contact"  },
];

const CERTIFICATIONS = [
  { icon: ShieldCheck, label: "APEDA Registered Exporter" },
  { icon: Award,       label: "FSSAI Certified Packing"   },
  { icon: Globe,       label: "Import Export Code (IEC)"  },
];

const EXPORT_MARKETS = [
  { flag: "🇲🇾", name: "Malaysia"    },
  { flag: "🇦🇪", name: "UAE"         },
  { flag: "🇧🇩", name: "Bangladesh"  },
  { flag: "🇱🇰", name: "Sri Lanka"   },
  { flag: "🇳🇵", name: "Nepal"       },
  { flag: "🇸🇬", name: "Singapore"   },
];

export default function Footer() {
  const lineRef = useRef<HTMLDivElement>(null);

  /* Animated underline on mount */
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transform = "scaleX(1)";
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-[#060C1A] border-t border-neutral-800/60 relative overflow-hidden">

      {/* Glow blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-[#003F7F]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-[#FF7A1A]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-6 xl:px-12 pt-12 md:pt-20 pb-10 md:pb-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-14">

          {/* ── Column 1 – Brand ── */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Logo */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center group w-fit"
            >
              <img
                src="/logo.png"
                alt="Power Veg Exim Logo"
                className="h-[150px] md:h-[180px] w-auto object-contain"
                style={{
                  filter: "drop-shadow(1px 0 0 #fff) drop-shadow(-1px 0 0 #fff) drop-shadow(0 1px 0 #fff) drop-shadow(0 -1px 0 #fff)"
                }}
              />
            </a>

            <p className="text-neutral-400 text-sm leading-relaxed font-light max-w-xs">
              Premium Nashik red onions exported to global markets with unmatched logistics efficiency and full phytosanitary compliance.
            </p>

            {/* Certifications */}
            <div className="space-y-2.5">
              {CERTIFICATIONS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-neutral-500 group/cert">
                  <div className="w-6 h-6 rounded-md bg-[#0f162d] border border-neutral-800 flex items-center justify-center flex-shrink-0 group-hover/cert:border-[#FF7A1A]/40 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-[#FF7A1A]" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider group-hover/cert:text-neutral-300 transition-colors">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Column 2 – Quick Links ── */}
          <div className="flex flex-col gap-5">
            <h3 className="font-mono text-[10px] text-[#FF7A1A] uppercase tracking-[0.25em] font-bold">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white py-2 border-b border-neutral-800/50 last:border-0 transition-colors duration-200 cursor-pointer text-left"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-700 group-hover:text-[#FF7A1A] transition-colors -rotate-45 group-hover:rotate-0 transition-transform duration-200" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Leaf badge */}
            <div className="mt-2 inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/40 rounded-full px-3 py-1.5 w-fit">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider">Farm-to-Port Traceability</span>
            </div>
          </div>

          {/* ── Column 3 – Export Markets ── */}
          <div className="flex flex-col gap-5">
            <h3 className="font-mono text-[10px] text-[#0E8ACF] uppercase tracking-[0.25em] font-bold">
              Export Markets
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
              {EXPORT_MARKETS.map(({ flag, name }) => (
                <div
                  key={name}
                  className="flex items-center gap-2 bg-[#0f162d]/60 border border-neutral-800/50 rounded-lg px-3 py-2.5 hover:border-[#0E8ACF]/40 hover:bg-[#0f162d] transition-all duration-200 group/market"
                >
                  <span className="text-base leading-none">{flag}</span>
                  <span className="text-[11px] font-semibold text-neutral-400 group-hover/market:text-white transition-colors">
                    {name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-1">
              <span className="font-mono text-[9px] text-neutral-600 uppercase tracking-wider">
                FOB Port · Nhava Sheva, Mumbai
              </span>
            </div>
          </div>

          {/* ── Column 4 – Contact ── */}
          <div className="flex flex-col gap-5">
            <h3 className="font-mono text-[10px] text-[#FF7A1A] uppercase tracking-[0.25em] font-bold">
              Contact Us
            </h3>

            <div className="space-y-4">
              <a
                href="mailto:export@powervegexim.com"
                className="flex items-start gap-3 group/c"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0f162d] border border-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/c:border-[#FF7A1A]/50 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#FF7A1A]" />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-neutral-600 uppercase tracking-wider mb-0.5">Trading Email</p>
                  <p className="text-sm text-neutral-300 group-hover/c:text-white transition-colors break-all">
                    export@powervegexim.com
                  </p>
                </div>
              </a>

              <a
                href="tel:+919890761639"
                className="flex items-start gap-3 group/c"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0f162d] border border-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/c:border-[#0E8ACF]/50 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[#0E8ACF]" />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-neutral-600 uppercase tracking-wider mb-0.5">Corporate Line</p>
                  <p className="text-sm text-neutral-300 group-hover/c:text-white transition-colors">
                    +91 98907 61639
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0f162d] border border-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7A1A]" />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-neutral-600 uppercase tracking-wider mb-0.5">Sourcing Office</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Lasalgaon Road, Pimpalgaon Baswant,<br />Nashik, Maharashtra — 422209
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => scrollToSection("contact")}
              className="mt-2 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#003F7F] to-[#0E8ACF] hover:from-[#FF7A1A] hover:to-orange-500 text-white text-xs font-mono uppercase tracking-widest py-3.5 rounded-xl transition-all duration-400 shadow-[0_0_20px_rgba(14,138,207,0.2)] hover:shadow-[0_0_28px_rgba(255,122,26,0.3)] cursor-pointer font-bold"
            >
              Request Export Quote
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mt-16 mb-8 relative h-px bg-neutral-800/60">
          <div
            ref={lineRef}
            className="absolute inset-0 bg-gradient-to-r from-[#003F7F] via-[#FF7A1A] to-transparent origin-left transition-transform duration-1000 ease-out"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* ── Bottom Bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">
            © {new Date().getFullYear()} Power Veg Exim. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-neutral-700 uppercase tracking-wider">
              Phytosanitary &amp; Trade Compliance Registered
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-500 uppercase tracking-wider">
                Year-Round Supply
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
