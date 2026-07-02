import React from "react";
import { Ship, ShoppingBag, Globe, Sparkles } from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  category: string;
  grade: string;
  packaging: string;
  markets: string[];
  imageUrl: string;
  description: string;
  glowColor: string;
}

const products: ProductItem[] = [
  {
    id: "prod-onion",
    name: "Fresh Red Onion",
    category: "Nashik Sourced",
    grade: "Grade A Selected (Diameter: 45mm - 90mm)",
    packaging: "10kg, 20kg, 40kg Ventilated Mesh Bags",
    markets: ["UAE", "Saudi Arabia", "Malaysia", "Singapore", "Oman"],
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
    description: "Premium double-skin red onions prized for their intense pungency, hard shells, and exceptional shelf life. Sourced directly from local Nashik hubs.",
    glowColor: "hover:border-[#FF7A1A]/30 hover:shadow-[0_0_35px_rgba(255,122,26,0.12)]",
  },
  {
    id: "prod-okra",
    name: "Premium Fresh Okra",
    category: "Fresh Vegetables",
    grade: "Export Grade Premium (Size: 7cm - 10cm)",
    packaging: "5kg & 7kg Corrugated Fiber Boxes (CFB)",
    markets: ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman"],
    imageUrl: "https://images.unsplash.com/photo-1627485501819-44b209e99298?auto=format&fit=crop&w=800&q=80",
    description: "Freshly harvested green okra pods selected for uniform color, tenderness, and damage-free structures. Packed immediately to retain crispness.",
    glowColor: "hover:border-emerald-500/30 hover:shadow-[0_0_35px_rgba(16,185,129,0.12)]",
  },
  {
    id: "prod-pomegranate",
    name: "Bhagwa Pomegranate",
    category: "Fresh Fruits",
    grade: "Grade A selected red (Size: 200g - 350g+)",
    packaging: "3kg & 4kg Open Trays / Carton Boxes",
    markets: ["Europe", "UAE", "Singapore", "Saudi Arabia"],
    imageUrl: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80",
    description: "Selected deep-red aril Bhagwa pomegranates known for soft seeds and sweet taste profile. Subjected to direct agricultural audit.",
    glowColor: "hover:border-red-500/30 hover:shadow-[0_0_35px_rgba(239,68,68,0.12)]",
  },
  {
    id: "prod-grapes",
    name: "Thompson Seedless Grapes",
    category: "Fresh Fruits",
    grade: "Premium Export Grade (White & Black Seedless)",
    packaging: "5kg Punnets in Carry Bags / Cartons",
    markets: ["Europe", "UAE", "Malaysia", "Singapore"],
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80",
    description: "Pristine sweet seedless table grapes harvested from solar-monitored vineyards. Cooled immediately in pre-cooling chambers for shipping.",
    glowColor: "hover:border-[#0E8ACF]/30 hover:shadow-[0_0_35px_rgba(14,138,207,0.12)]",
  },
];

export default function Products() {
  const scrollToContact = (productName: string) => {
    const element = document.getElementById("contact");
    if (element) {
      // Pre-fill dropdown if possible or just scroll
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="products" className="py-16 md:py-32 px-4 md:px-24 bg-[#0B1020] relative border-t border-neutral-900 z-20 scroll-mt-24 overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#003F7F]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#FF7A1A]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-10 md:mb-20 text-center md:text-left">
          <span className="font-mono text-xs text-[#FF7A1A] uppercase tracking-[0.25em] block mb-3 font-bold">
            Export Catalog
          </span>
          <h2 className="font-display font-black text-3xl md:text-6xl tracking-tight text-white">
            OUR CROPS & PRODUCE.
          </h2>
          <p className="font-sans text-neutral-400 text-xs md:text-base font-light max-w-2xl mt-3 md:mt-4 leading-relaxed">
            Strictly inspected agricultural supplies sourced from certified Indian farms, processed in clean packaging houses, and loaded into temperature-monitored cargo units.
          </p>
        </div>

        {/* Products Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((prod) => (
            <div
              key={prod.id}
              className={`group flex flex-col bg-[#0f162d]/45 backdrop-blur-md border border-neutral-800/60 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 ${prod.glowColor}`}
            >
              {/* Product Image Frame */}
              <div className="relative h-48 md:h-64 overflow-hidden shrink-0">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f162d] via-[#0f162d]/15 to-transparent" />
                <div className="absolute bottom-4 left-6 bg-[#003F7F] text-white font-mono text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/5">
                  {prod.category}
                </div>
              </div>

              {/* Product Info content */}
              <div className="p-5 md:p-8 flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-white group-hover:text-[#FF7A1A] transition-colors">
                      {prod.name}
                    </h3>
                    <p className="font-sans text-neutral-400 text-xs md:text-sm font-light leading-relaxed mt-2.5">
                      {prod.description}
                    </p>
                  </div>

                  {/* Compliance Specs Grid */}
                  <div className="bg-[#0b1020]/60 rounded-2xl border border-white/5 p-5 space-y-3 font-sans text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500 uppercase text-[9px] font-bold tracking-wider">EXPORT GRADE</span>
                      <span className="text-white font-semibold text-right">{prod.grade}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-white/5 pt-2.5">
                      <span className="text-neutral-500 uppercase text-[9px] font-bold tracking-wider">PACKAGING</span>
                      <span className="text-neutral-300 text-right">{prod.packaging}</span>
                    </div>
                  </div>

                  {/* Market destinations */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[9px] font-bold uppercase tracking-wider">
                      <Globe className="w-3.5 h-3.5 text-[#0E8ACF]" />
                      <span>Active Markets</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.markets.map((m, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[9px] bg-[#0b1020] border border-neutral-800 text-neutral-400 px-2.5 py-1 rounded"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => scrollToContact(prod.name)}
                    className="w-full bg-[#003F7F] hover:bg-[#003F7F]/80 border border-[#0E8ACF]/20 hover:border-[#FF7A1A]/40 text-white text-xs font-mono uppercase tracking-widest py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Inquire Specifications</span>
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
