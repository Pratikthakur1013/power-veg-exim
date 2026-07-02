import React from "react";
import { Check, ShieldAlert, Package, Ship, Landmark } from "lucide-react";

export default function ExportTimeline() {
  const steps = [
    {
      num: "01",
      title: "Contract & Farm Selection",
      desc: "Our agronomists visit partnering farm fields in Lasalgaon to assess skin health, skin layer count, and natural soil drying ratios, scheduling harvest dates when maturity peaks.",
      icon: <Check className="w-5 h-5 text-white" />,
      colorClass: "bg-[#003667]"
    },
    {
      num: "02",
      title: "Scientific Sort & Grading",
      desc: "Raw onions enter our clean processing sheds, passing through air-blowers to remove dry top soils. They are size-sorted (e.g. 55mm+) to secure structural dimension uniformity.",
      icon: <ShieldAlert className="w-5 h-5 text-white" />,
      colorClass: "bg-[#FF8A3D]"
    },
    {
      num: "03",
      title: "Breathable Mesh Packing",
      desc: "Staff stack sorted onions into premium quality ventilated red mesh bags of 5kg, 10kg, 20kg, or 40kg, or corrugated box cartons to optimize air movement during container transit.",
      icon: <Package className="w-5 h-5 text-white" />,
      colorClass: "bg-[#00639C]"
    },
    {
      num: "04",
      title: "Container Dry Stuffing",
      desc: "Onions are loaded into either dry ventilated sea cargo containers or custom refrigerated holds, monitored under exact ambient relative humidity to prevent mold or moisture decay.",
      icon: <Landmark className="w-5 h-5 text-white" />,
      colorClass: "bg-[#7F3700]"
    },
    {
      num: "05",
      title: "Port Clearance & Sea Transit",
      desc: "Cargo travels from Nashik yards to Nhava Sheva Port, completing phytosanitary certifications and custom approvals before commencing cargo vessel transport to world targets.",
      icon: <Ship className="w-5 h-5 text-white" />,
      colorClass: "bg-[#003667]"
    }
  ];

  return (
    <div className="relative border-l-2 border-gray-100 ml-4 md:ml-8 md:grid md:grid-cols-5 md:border-l-0 md:border-t-2 md:pt-10 md:ml-0 md:gap-6 space-y-8 md:space-y-0">
      {steps.map((step, idx) => (
        <div key={idx} className="relative pl-8 md:pl-0 animate-fade-in">
          
          {/* Animated node dot */}
          <div className="absolute -left-11.5 top-1.5 md:left-1/2 md:-top-16.5 md:-translate-x-1/2 transition-transform duration-300 hover:scale-110 z-10">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md ${step.colorClass}`}>
              {step.icon}
            </div>
          </div>

          {/* Timeline text info block */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="font-mono font-extrabold text-[#FF8A3D] text-base select-none">
                {step.num}
              </span>
              <h4 className="font-display font-bold text-[#003667] text-xs md:text-[13px] leading-tight tracking-tight">
                {step.title}
              </h4>
            </div>
            <p className="text-slate-500 font-light text-[11px] leading-relaxed font-sans">
              {step.desc}
            </p>
          </div>

        </div>
      ))}
    </div>
  );
}
