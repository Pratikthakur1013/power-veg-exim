import React from "react";
import { Anchor, Clock, CheckCircle } from "lucide-react";

interface MarketItem {
  name: string;
  regionCode: string;
  accentColor: string;
  pref: string;
  transit: string;
  ports: string;
}

const marketsList: MarketItem[] = [
  {
    name: "UAE & Middle East",
    regionCode: "ME",
    accentColor: "#FF7A1A",
    pref: "Jumbo Selected Onions (60mm - 90mm), Fruits & Vegetables in retail cartons.",
    transit: "4 - 7 Days (FOB Nhava Sheva to Jebel Ali Port)",
    ports: "Jebel Ali, Abu Dhabi, Dammam, Jeddah, Shuwaikh",
  },
  {
    name: "Southeast Asia",
    regionCode: "SEA",
    accentColor: "#0E8ACF",
    pref: "Medium Size Red Onions (35mm - 50mm), Fresh Okra & Grapes in punnets.",
    transit: "8 - 12 Days (FOB Nhava Sheva to Port Klang / Singapore)",
    ports: "Port Klang, Penang, Singapore, Tanjung Priok",
  },
  {
    name: "Europe & UK",
    regionCode: "EU",
    accentColor: "#0E8ACF",
    pref: "Premium Bhagwa Pomegranates, White Seedless Grapes in 5kg carry bags.",
    transit: "18 - 25 Days (Reefer Cargo to Rotterdam / Felixstowe)",
    ports: "Rotterdam, Antwerp, Hamburg, Felixstowe",
  },
];

export default function Markets() {
  return (
    <section id="markets" className="py-16 md:py-32 px-4 md:px-24 bg-[#0B1020] relative border-t border-neutral-900 z-20 scroll-mt-24 overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#FF7A1A]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="mb-10 md:mb-20 text-center">
          <span className="font-mono text-xs text-[#FF7A1A] uppercase tracking-[0.25em] block mb-3 font-bold">
            03 / EXPORT DESTINATIONS
          </span>
          <h2 className="font-display font-black text-3xl md:text-6xl tracking-tight text-white">
            GLOBAL MARKETS WE SERVE.
          </h2>
          <p className="font-sans text-neutral-400 text-xs md:text-base font-light max-w-xl mx-auto mt-3 md:mt-4 leading-relaxed">
            Connecting major agricultural sourcing hubs in India to terminal wholesale ports across the Middle East, Southeast Asia, and Europe.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Markets Specifications List (Left) */}
          <div className="lg:col-span-6 space-y-6">
            {marketsList.map((m, idx) => (
              <div
                key={idx}
                className="bg-[#0f162d]/50 border border-neutral-800/80 p-4 md:p-6 rounded-xl md:rounded-2xl hover:border-[#0E8ACF]/35 transition-all duration-300"
              >
                {/* Header row: code badge + name */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg font-mono font-black text-xs text-white shrink-0"
                    style={{ backgroundColor: m.accentColor + "22", border: `1px solid ${m.accentColor}44`, color: m.accentColor }}
                  >
                    {m.regionCode}
                  </span>
                  <h4 className="font-display font-bold text-lg text-white leading-tight">{m.name}</h4>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-[#FF7A1A] shrink-0 mt-0.5" />
                    <p className="text-neutral-300">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider text-[9px] mr-1.5">PREFERENCES:</span>
                      {m.pref}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Clock className="w-4 h-4 text-[#0E8ACF] shrink-0 mt-0.5" />
                    <p className="text-neutral-300">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider text-[9px] mr-1.5">TRANSIT TIME:</span>
                      {m.transit}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Anchor className="w-4 h-4 text-[#FF7A1A] shrink-0 mt-0.5" />
                    <p className="text-neutral-300">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider text-[9px] mr-1.5">PORTS:</span>
                      {m.ports}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* World Map Image — hidden on mobile, shown on lg */}
          <div className="hidden lg:flex lg:col-span-6 items-center justify-center bg-white border border-neutral-200 rounded-3xl overflow-hidden aspect-[4/3] w-full relative shadow-[0_0_40px_rgba(255,255,255,0.08)]">
            <img
              src="/worldmap.png"
              alt="Exporting Excellence — Power Veg Exim trade routes from India to the world"
              className="w-full h-full object-contain"
            />
          </div>

        </div>

      </div>

    </section>
  );
}
