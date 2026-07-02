import React from "react";
import { MapPin, Globe, Scale, Home } from "lucide-react";

export default function StrategicSourcingHubs() {
  const hubs = [
    {
      name: "Lasalgaon Hub",
      role: "Asia's Largest Onion Market",
      desc: "Our primary agricultural collection node. Sourcing massive daily crop volumes directly from Lasalgaon, giving us complete control over supply consistency and enabling immediate spot transaction rates.",
      imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80",
      icon: <Home className="w-4.5 h-4.5 text-[#FF8A3D]" />
    },
    {
      name: "Pimpalgaon Hub",
      role: "State-of-the-Art Sorting & Grading",
      desc: "Our automated packing node. Outfitted with calibrated shape grading and double-leaf skin sorting machinery, securing uncompromised outer quality specifications desired in Singapore and Malaysia retailing channels.",
      imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=600&q=80",
      icon: <Scale className="w-4.5 h-4.5 text-[#FF8A3D]" />
    },
    {
      name: "Niphad Belt",
      role: "Premium High-Yield Cultivation",
      desc: "Lying directly on fertile alluvial volcanic sand basins, Nipphad growers yield outstanding onion skin thickness and long storage life, providing optimal stability on 20+ day marine cargo transit routes.",
      imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80",
      icon: <Globe className="w-4.5 h-4.5 text-[#FF8A3D]" />
    },
    {
      name: "Yeola District",
      role: "Consolidated Packing Chambers",
      desc: "Consisting of shaded cold ventilated dry warehouses and staging rooms. Here, raw onions are carefully shade-cured before final packaging container stuffing to minimize decay percentages.",
      imageUrl: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?auto=format&fit=crop&w=600&q=80",
      icon: <MapPin className="w-4.5 h-4.5 text-[#FF8A3D]" />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {hubs.map((hub, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.01] duration-300 transition-all group flex flex-col h-full"
        >
          {/* Header Image box */}
          <div className="relative h-48 select-none overflow-hidden shrink-0">
            <img 
              src={hub.imageUrl} 
              alt={hub.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Dark tint gradient and floating Map badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-1.5 bg-[#003667] text-white text-[9px] font-mono tracking-widest uppercase font-bold px-3 py-1.5 rounded-full shadow-md z-10 backdrop-blur-md">
              <MapPin className="w-3 h-3 text-[#FF8A3D]" />
              NASHIK REGION
            </div>
          </div>

          {/* Sourcing Hub info */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FF8A3D]/10 rounded-lg shrink-0">
                  {hub.icon}
                </div>
                <h4 className="font-display font-bold text-[#003667] text-base leading-tight group-hover:text-[#00639C] transition-colors">
                  {hub.name}
                </h4>
              </div>
              <div>
                <p className="text-[#FF8A3D] font-mono text-[9px] tracking-wider font-extrabold uppercase">{hub.role}</p>
                <p className="text-slate-500 font-light text-xs leading-relaxed font-sans mt-1.5">{hub.desc}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
