import React from "react";
import { CheckCircle2, ShieldCheck, Scale, ThermometerSun, Container, Award } from "lucide-react";

export default function SpecificationsTable() {
  const specs = [
    {
      p: "Available Size (Diameter in mm)",
      s: "25mm - 35mm (Golta/Small), 35mm - 45mm (Medium Golti), 45mm - 60mm (Regular Medium), 55mm - 80mm+ (Jumbo Large)",
      icon: <Scale className="w-4 h-4 text-[#FF8A3D]" />
    },
    {
      p: "Skin Quality & Outer Color",
      s: "Dense double-skin outer layers, vibrant rich deep purple-red hue with highly protective uniform outer dry leaf wraps.",
      icon: <ShieldCheck className="w-4 h-4 text-[#FF8A3D]" />
    },
    {
      p: "Pungency / Flavor Profile",
      s: "Strong sharp pungency (highly robust volatile red organic sulfur aroma and solid taste profile desired by food processors worldwide).",
      icon: <Award className="w-4 h-4 text-[#FF8A3D]" />
    },
    {
      p: "Water / Moisture Content",
      s: "Favorable dry season harvest results in naturally balanced moisture levels, assuring minimum transit moisture loss.",
      icon: <ThermometerSun className="w-4 h-4 text-[#FF8A3D]" />
    },
    {
      p: "Optimal Sea Transport Shelf Life",
      s: "Up to 5 to 6 months when maintained in fully ventilated dry dark cargo holds or ambient temperature logistics chambers.",
      icon: <CheckCircle2 className="w-4 h-4 text-[#FF8A3D]" />
    },
    {
      p: "B2B Customized Packing Solutions",
      s: "Standard Red Mesh Bags: 5kg, 10kg, 20kg, 40kg. Custom printed logo wraps & corrugated dry cartons available on request.",
      icon: <Container className="w-4 h-4 text-[#FF8A3D]" />
    },
    {
      p: "Total Container Shipping Capacity",
      s: "20ft Reefer/Dry Cargo Container: ~12-14 Metric Tons. 40ft High-Cube Reefers: ~26-28 Metric Tons loaded loose or on pallets.",
      icon: <Container className="w-4 h-4 text-[#FF8A3D]" />
    },
    {
      p: "Geographical Ground Origin",
      s: "100% Certified Agricultural belts of Nashik, Lasalgaon, Pimpalgaon, and neighboring regions of Maharashtra, India.",
      icon: <CheckCircle2 className="w-4 h-4 text-[#FF8A3D]" />
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#003667]/95 text-white border-b border-gray-100">
              <th className="py-4.5 px-6 font-display font-bold text-xs uppercase tracking-widest text-[#FF8A3D] w-1/3">Technical Parameter</th>
              <th className="py-4.5 px-6 font-display font-semibold text-xs uppercase tracking-widest text-white/90 w-2/3">International Export Specification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white font-sans text-xs md:text-sm text-slate-700">
            {specs.map((item, idx) => (
              <tr 
                key={idx} 
                className={`transition-colors hover:bg-slate-50/50 ${
                  idx % 2 === 1 ? "bg-[#F7F9FB]/50" : "bg-white"
                }`}
              >
                <td className="py-5 px-6 font-semibold text-[#003667] flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#FF8A3D]/10 shrink-0">
                    {item.icon}
                  </div>
                  {item.p}
                </td>
                <td className="py-5 px-6 leading-relaxed text-slate-500 font-medium">{item.s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 p-4 border-t border-gray-100 text-center text-[10px] font-mono text-slate-400">
        *Full chemical lab residue, phytosanitary analysis, and customs clearance reports are completed on every maritime dispatch.
      </div>
    </div>
  );
}
