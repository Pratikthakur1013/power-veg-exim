import React from "react";

interface LogoProps {
  className?: string;
  logoUrl?: string;
  showText?: boolean;
  light?: boolean;
}

export default function Logo({ className = "h-12", logoUrl, showText = true, light = false }: LogoProps) {
  if (logoUrl) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={logoUrl}
          alt="Power Veg Exim Logo"
          className={`${className} object-contain`}
          referrerPolicy="no-referrer"
        />
        {showText && (
          <span className={`font-display font-bold text-lg md:text-xl tracking-wide ${light ? "text-white" : "text-primary"}`}>
            POWER VEG EXIM
          </span>
        )}
      </div>
    );
  }

  // Exquisite custom vector inline SVG logo (Ship sailing at sunset towards global markets)
  return (
    <div className="flex items-center gap-3">
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft background outer circular border */}
        <circle cx="50" cy="50" r="46" fill={light ? "#001D33" : "#f7f9fb"} stroke={light ? "#00639C" : "#003667"} strokeWidth="1.5" />
        
        {/* Sunset Sun */}
        <circle cx="50" cy="42" r="22" fill="#7F3700" opacity="0.1" />
        <circle cx="50" cy="42" r="18" fill="#FF8A3D" />
        
        {/* Floating Cargo Container stacks on ship */}
        <rect x="36" y="44" width="8" height="20" fill="#00639C" rx="0.5" />
        <line x1="40" y1="44" x2="40" y2="64" stroke="#ffffff" strokeWidth="0.5" />
        
        <rect x="46" y="39" width="10" height="25" fill="#003667" rx="0.5" />
        <line x1="51" y1="40" x2="51" y2="64" stroke="#ffffff" strokeWidth="0.5" />
        
        <rect x="58" y="45" width="8" height="19" fill="#00639C" rx="0.5" />
        <line x1="62" y1="46" x2="62" y2="64" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="1 1" />
        
        {/* Cargo Shipping Ship */}
        <path
          d="M22,62 L32,62 C34,55 42,50 60,50 L78,50 L81,53 L81,59 L78,61 L22,61 Z"
          fill={light ? "#00639C" : "#003667"}
        />
        
        {/* Circular windows */}
        <circle cx="50" cy="56" r="1.2" fill="#ffffff" />
        <circle cx="57" cy="56" r="1.2" fill="#ffffff" />
        <circle cx="64" cy="56" r="1.2" fill="#ffffff" />
        
        {/* Ocean Waves */}
        <path
          d="M10,61 Q25,59 40,61 Q55,63 70,61 Q85,59 90,61 L90,82 Q80,84 50,82 Q20,80 10,82 Z"
          fill="#00639C"
          opacity="0.8"
        />
        <path
          d="M10,68 Q30,66 50,68 Q70,70 90,68 L90,90 L10,90 Z"
          fill={light ? "#002C4C" : "#003667"}
        />
      </svg>
      {showText && (
        <div className="flex flex-col select-none">
          <span className={`font-display font-extrabold text-lg md:text-xl tracking-tight leading-none ${light ? "text-white" : "text-primary"}`}>
            POWER VEG EXIM
          </span>
          <span className={`font-sans text-[9px] md:text-[10px] font-bold tracking-widest uppercase mt-0.5 ${light ? "text-slate-300" : "text-secondary"}`}>
            Delivering Freshness
          </span>
        </div>
      )}
    </div>
  );
}
