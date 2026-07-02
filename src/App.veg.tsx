import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Mail, MapPin, Award, CheckCircle2, Globe, ArrowRight, Download, 
  MessageSquare, Layers, ShieldCheck, ChevronLeft, ChevronRight, X, 
  Settings, Loader, Star, Send, Menu, Users, Ship, CheckCircle
} from "lucide-react";
import Logo from "./components/Logo";
import SpecificationsTable from "./components/SpecificationsTable";
import StrategicSourcingHubs from "./components/StrategicSourcingHubs";
import ExportTimeline from "./components/ExportTimeline";
import AdminPanel from "./components/AdminPanel";
import { Product, GalleryItem, Certification, CountryCard, Inquiry, WebsiteSettings, CompanyProfile, PublicDataResponse } from "./types";

export default function App() {
  // Mobile navigation trigger
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Data State Synchronized with Backend
  const [data, setData] = useState<{
    products: Product[];
    gallery: GalleryItem[];
    certifications: Certification[];
    countries: CountryCard[];
    company_profile: CompanyProfile;
    website_settings: WebsiteSettings;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refetchCounter, setRefetchCounter] = useState<number>(0);

  // Interactive Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>("All");

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    quantity: "25 Metric Tons (1 Container)",
    message: ""
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState<boolean>(false);
  const [inquirySuccess, setInquirySuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Control Admin Panel overlay in SPA
  const [showAdminConsole, setShowAdminConsole] = useState<boolean>(false);

  // Statistics counters
  const [exportYears, setExportYears] = useState<number>(0);
  const [tonsExported, setTonsExported] = useState<number>(0);
  const [countriesCount, setCountriesCount] = useState<number>(0);

  // Form references for scrolling
  const contactFormRef = useRef<HTMLDivElement>(null);

  // Load public metrics and lists
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/public/data");
        if (res.ok) {
          const resData: PublicDataResponse = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Endpoint connect failed, running in memory-mode:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [refetchCounter]);

  // Statistics counter scroll animation
  useEffect(() => {
    if (data) {
      let tonsTimer = setInterval(() => {
        setTonsExported(prev => {
          if (prev >= 45000) {
            clearInterval(tonsTimer);
            return 45000;
          }
          return prev + 1500;
        });
      }, 30);

      let yearsTimer = setInterval(() => {
        setExportYears(prev => {
          if (prev >= 12) {
            clearInterval(yearsTimer);
            return 12;
          }
          return prev + 1;
        });
      }, 80);

      let countriesTimer = setInterval(() => {
        setCountriesCount(prev => {
          if (prev >= 18) {
            clearInterval(countriesTimer);
            return 18;
          }
          return prev + 1;
        });
      }, 100);

      return () => {
        clearInterval(tonsTimer);
        clearInterval(yearsTimer);
        clearInterval(countriesTimer);
      };
    }
  }, [data]);

  const handleRefreshData = () => {
    setRefetchCounter(c => c + 1);
  };

  // Preset Quote request clicked on dynamic product grid
  const handleInitiateQuote = (productName: string) => {
    setInquiryForm({
      ...inquiryForm,
      message: `Hello Power Veg Exim team,\n\nI am interested in requesting an export price quote and FOB custom packaging specifications for "${productName}". Please let me know the pricing models, shipping timelines, and document requirements for delivery to our target destination.`
    });
    
    // Smooth scroll to Inquiry section
    const target = document.getElementById("contact");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Submit buyer inquiry to backend Express database
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmittingInquiry(true);

    // Validation
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.phone || !inquiryForm.country || !inquiryForm.quantity) {
      setFormError("Please fill in all mandatory marked fields (*)");
      setIsSubmittingInquiry(false);
      return;
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryForm)
      });
      if (res.ok) {
        setInquirySuccess(true);
        setInquiryForm({
          name: "",
          company: "",
          email: "",
          phone: "",
          country: "",
          quantity: "25 Metric Tons (1 Container)",
          message: ""
        });
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to submit inquiry.");
      }
    } catch (err) {
      setFormError("Network communication latency. Check if the backend is online.");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Smooth scroll handler
  const handleScrollTo = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      // Offset for sticky navbar
      const navbarOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Gallery filters categorizer
  const filteredGallery = data?.gallery.filter(item => 
    galleryFilter === "All" || item.category === galleryFilter
  ) || [];

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader className="w-10 h-10 text-primary animate-spin" />
        <span className="font-display font-bold text-slate-800 text-sm tracking-wide">
          Booting Power Veg Exim platform...
        </span>
      </div>
    );
  }

  const settings: WebsiteSettings = data.website_settings;
  const companyProfile: CompanyProfile = data.company_profile;

  return (
    <div className="relative min-h-screen bg-[#F7F9FB] text-slate-700 selection:bg-secondary/15 selection:text-primary">
      
      {/* Dynamic Overlay admin panel */}
      {showAdminConsole && (
        <AdminPanel 
          onClose={() => setShowAdminConsole(false)} 
          publicData={data}
          onRefreshData={handleRefreshData}
        />
      )}

      {/* LIGHTBOX FOR GALLERY */}
      {lightboxIndex !== null && filteredGallery[lightboxIndex] && (
        <div className="fixed inset-0 bg-[#001D33]/95 z-55 flex items-center justify-center p-4 backdrop-blur-md">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setLightboxIndex(prev => prev! > 0 ? prev! - 1 : filteredGallery.length - 1)}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center select-none space-y-4">
            <img 
              src={filteredGallery[lightboxIndex].imageUrl} 
              alt={filteredGallery[lightboxIndex].title}
              className="max-h-[75vh] max-w-full rounded-md object-contain shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="text-center font-sans">
              <h4 className="text-white font-display font-bold text-base md:text-lg">{filteredGallery[lightboxIndex].title}</h4>
              <p className="text-[#FF8A3D] font-bold text-xs uppercase tracking-widest mt-1">{filteredGallery[lightboxIndex].category}</p>
            </div>
          </div>

          <button 
            onClick={() => setLightboxIndex(prev => prev! < filteredGallery.length - 1 ? prev! + 1 : 0)}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* FLOAT CONTACT WIDGETS */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {/* Admin Login shortcut */}
        <button 
          onClick={() => setShowAdminConsole(true)}
          className="bg-[#003667] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer hover:bg-[#00639C]"
          title="Open Admin Console Panel"
        >
          <Settings className="w-5 h-5 animate-spin-slow" />
        </button>

        {/* Floating WhatsApp indicator */}
        <a 
          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Power Veg Exim,\nI am interested in importing Nashik onions.")}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-emerald-600 text-white p-4 rounded-full shadow-lg animate-pulse-slow transition-transform hover:scale-110 flex items-center justify-center relative group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute right-14 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            WhatsApp Inquiry
          </span>
        </a>
      </div>

      {/* GLASSMORPHIC STICKY NAVBAR */}
      <header className="sticky top-0 left-0 w-full z-45 bg-[#003667]/95 backdrop-blur-md border-b border-white/10 select-none shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          
          {/* Logo element */}
          <a href="#home" onClick={(e) => { e.preventDefault(); handleScrollTo("home"); }} className="hover:opacity-90 transition-opacity">
            <Logo logoUrl={settings.logoUrl} light={true} />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            <button onClick={() => handleScrollTo("home")} className="text-white hover:text-white/90 text-xs font-bold transition-all uppercase tracking-widest cursor-pointer border-b-2 border-[#7F3700] pb-1">Home</button>
            <button onClick={() => handleScrollTo("about")} className="text-white/80 hover:text-white text-xs font-bold transition-all uppercase tracking-widest cursor-pointer pb-1">About Us</button>
            <button onClick={() => handleScrollTo("products")} className="text-white/80 hover:text-white text-xs font-bold transition-all uppercase tracking-widest cursor-pointer pb-1">Onions</button>
            <button onClick={() => handleScrollTo("specifications")} className="text-white/80 hover:text-white text-xs font-bold transition-all uppercase tracking-widest cursor-pointer pb-1">Specifications</button>
            <button onClick={() => handleScrollTo("markets")} className="text-white/80 hover:text-white text-xs font-bold transition-all uppercase tracking-widest cursor-pointer pb-1">Markets</button>
            <button onClick={() => handleScrollTo("gallery")} className="text-white/80 hover:text-white text-xs font-bold transition-all uppercase tracking-widest cursor-pointer pb-1">Gallery</button>
            <button onClick={() => handleScrollTo("contact")} className="text-white/80 hover:text-white text-xs font-bold transition-all uppercase tracking-widest cursor-pointer pb-1">Contact</button>
          </nav>

          {/* Nav CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={() => handleScrollTo("contact")}
              className="bg-[#7F3700] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#a14600] transition-all shadow-lg shadow-orange-900/20 cursor-pointer"
            >
              Request Quote
            </button>
          </div>

          {/* Mobile Hamburguer trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 focus:outline-none"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>

        {/* Mobile menu drop panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#003667] border-b border-white/10 shadow-xl p-6 flex flex-col space-y-4">
            <button onClick={() => handleScrollTo("home")} className="text-left py-2 font-bold text-white text-xs uppercase tracking-widest">Home</button>
            <button onClick={() => handleScrollTo("about")} className="text-left py-2 font-bold text-white/80 hover:text-white text-xs uppercase tracking-widest">About Us</button>
            <button onClick={() => handleScrollTo("products")} className="text-left py-2 font-bold text-white/80 hover:text-white text-xs uppercase tracking-widest">Our Export Products</button>
            <button onClick={() => handleScrollTo("specifications")} className="text-left py-2 font-bold text-white/80 hover:text-white text-xs uppercase tracking-widest">Specifications Table</button>
            <button onClick={() => handleScrollTo("markets")} className="text-left py-2 font-bold text-white/80 hover:text-white text-xs uppercase tracking-widest">Serving Markets</button>
            <button onClick={() => handleScrollTo("gallery")} className="text-left py-2 font-bold text-white/80 hover:text-white text-xs uppercase tracking-widest">Stock Gallery</button>
            <button onClick={() => handleScrollTo("contact")} className="text-left py-2 font-bold text-white/80 hover:text-white text-xs uppercase tracking-widest">Contact Us</button>
            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              <button 
                onClick={() => handleScrollTo("contact")}
                className="w-full text-center bg-[#7F3700] hover:bg-[#a14600] text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-900/20"
              >
                Inquire Quote
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); setShowAdminConsole(true); }}
                className="w-full text-center bg-white/10 hover:bg-white/20 text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel Security
              </button>
            </div>
          </div>
        )}
      </header>

      {/* SECTION 1: HERO HOME */}
      <section id="home" className="relative bg-[#003667] text-white pt-20 pb-28 md:pt-28 md:pb-40 overflow-hidden select-none">
        {/* Absolute brand gradient backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#003667] to-[#00639C]"></div>
        <div className="absolute right-[-10%] top-0 bottom-0 w-[60%] opacity-20 skew-x-[-12deg] bg-gradient-to-l from-[#FF8A3D] to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 animate-fade-in animate-duration-500">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white font-bold text-[10px] md:text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              GLOBAL LOGISTICS ACTIVE
            </div>
            
            <h1 className="font-display font-black text-[38px] md:text-[56px] leading-[1.05] tracking-tight">
              {settings.bannerTitle.split("WORLDWIDE")[0]}
              <span className="text-[#FF8A3D] block drop-shadow-sm">EXPORTED WORLDWIDE</span>
            </h1>
            
            <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed max-w-xl font-light">
              {settings.bannerSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={() => handleScrollTo("contact")}
                className="w-full sm:w-auto bg-[#7F3700] hover:bg-[#a14600] text-white text-xs md:text-sm font-bold px-8 py-4 rounded-full shadow-lg shadow-orange-900/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                Request Quote
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              
              <a 
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Power Veg Exim,\nI am interested in importing Nashik onions.")}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-white text-white text-xs md:text-sm font-bold px-8 py-4 rounded-full transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4.5 h-4.5 text-[#FF8A3D]" />
                WhatsApp Inquiry
              </a>
            </div>
          </div>

          {/* Right side Image frame & bento quality cards */}
          <div className="relative justify-self-center lg:justify-self-end w-full max-w-lg flex flex-col gap-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative select-none bg-slate-900 group">
              <img 
                src="https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&w=800&q=80" 
                alt="Farms at Nashik crop supply"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white p-2">
                <p className="font-display font-bold text-sm tracking-wide text-white">Elite Crop Inspection in Lasalgaon Field</p>
                <p className="text-[10px] text-white/70 font-serif italic mt-0.5">Sourcing maximum nutrients and high dry skin counts</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-stretch">
              {/* Float details circle badge mock */}
              <div className="flex-1 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 flex items-center gap-3 select-none text-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Phytosanitary Approved</p>
                  <p className="font-display font-extrabold text-[#003667] text-xs mt-1">100% Pest-Free Guarantee</p>
                </div>
              </div>

              {/* Bento cards */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center w-24">
                  <span className="text-white text-xl font-bold">100%</span>
                  <span className="text-white/60 text-[8px] uppercase font-bold text-center mt-0.5">Pure Origin</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center w-24">
                  <span className="text-[#FF8A3D] text-xl font-bold">IEC</span>
                  <span className="text-white/60 text-[8px] uppercase font-bold text-center mt-0.5">Verified</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: THE POWER VEG ADVANTAGE */}
      <section id="about" className="py-20 md:py-28 bg-[#F7F9FB] border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Core Strengths</span>
            <h2 className="font-display font-black text-[#003667] text-2xl md:text-4xl">The Power Veg Advantage</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed font-light">
              We bridge the geographical corridor between India's finest growers and elite global distribution channels, securing freshness at volume.
            </p>
          </div>

          {/* 4 Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 hover:shadow-lg transition-all hover:scale-[1.01] duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#003667]/10 text-[#003667] flex items-center justify-center font-bold text-lg">
                🌱
              </div>
              <h3 className="font-display font-bold text-[#003667] text-base group-hover:text-[#00639C] transition-colors">Direct Farm Sourcing</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
                Our staff monitors partner fields daily. We procure stocks straight from Lasalgaon and Pimpalgaon farmers, eliminating speculative market intermediaries.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 hover:shadow-lg transition-all hover:scale-[1.01] duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#003667]/10 text-[#003667] flex items-center justify-center font-bold text-lg">
                ★
              </div>
              <h3 className="font-display font-bold text-[#003667] text-base group-hover:text-[#00639C] transition-colors">Export Grading Choice</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
                Onions pass through double-skin and diameter size caliber sorting. We secure perfect dry leaves, structural integrity, and long cargo life.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 hover:shadow-lg transition-all hover:scale-[1.01] duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#003667]/10 text-[#003667] flex items-center justify-center font-bold text-lg">
                ⚓
              </div>
              <h3 className="font-display font-bold text-[#003667] text-base group-hover:text-[#00639C] transition-colors">Global Logistics</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
                From Nhava Sheva sea port customs documentation to multi-destination refrigerated reefers, our freight network guarantees on-time ocean transit.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 hover:shadow-lg transition-all hover:scale-[1.01] duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#003667]/10 text-[#003667] flex items-center justify-center font-bold text-lg">
                ₹
              </div>
              <h3 className="font-display font-bold text-[#003667] text-base group-hover:text-[#00639C] transition-colors">Competitive Pricing</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
                Volume contracting and processing scale authorize us to offer highly reliable, stable FOB or CIF rates throughout fluctuating crop cycles.
              </p>
            </div>

          </div>

          {/* Statistics counter block */}
          <div className="bg-[#003667] text-white rounded-2xl p-8 md:p-12 shadow-xl select-none relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center relative z-10 font-sans">
              
              <div className="space-y-1">
                <span className="block text-4xl md:text-5xl font-black text-white font-mono leading-none drop-shadow-sm">
                  {tonsExported.toLocaleString()}+ MT
                </span>
                <span className="text-xs md:text-sm font-semibold tracking-wide text-white/70 uppercase block mt-2">Onions Exported Globally</span>
              </div>

              <div className="space-y-1">
                <span className="block text-4xl md:text-5xl font-black text-[#FF8A3D] font-mono leading-none drop-shadow-sm">
                  {exportYears}+ Years
                </span>
                <span className="text-xs md:text-sm font-semibold tracking-wide text-white/70 uppercase block mt-2">Collective B2B Trade Expertise</span>
              </div>

              <div className="space-y-1">
                <span className="block text-4xl md:text-5xl font-black text-white font-mono leading-none drop-shadow-sm">
                  {countriesCount}+ Nations
                </span>
                <span className="text-xs md:text-sm font-semibold tracking-wide text-white/70 uppercase block mt-2">Active Target Port Lines</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: PRODUCTS */}
      <section id="products" className="py-20 md:py-28 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Our Inventory Catalog</span>
            <h2 className="font-display font-black text-[#003667] text-2xl md:text-4xl">Export Grade Onion Varieties</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed font-light">
              Carefully processed red crops sorted according to international market caliber specifications. Select a segment to request custom specifications pricing.
            </p>
          </div>

          {/* Dynamic grid loaded from server JSON DB */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.products.map(prod => (
              <div 
                key={prod.id} 
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.01] duration-300 transition-all group flex flex-col h-full"
              >
                {/* Product Image */}
                <div className="relative h-56 bg-slate-50 overflow-hidden shrink-0 select-none">
                  <img 
                    src={prod.imageUrl} 
                    alt={prod.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-[#003667] text-white font-mono text-[9px] font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-md">
                    CALIBER: {prod.sizeRange}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-display font-bold text-[#003667] text-base md:text-lg leading-tight group-hover:text-[#00639C] transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-slate-500 font-medium text-xs mt-1.5 leading-relaxed font-sans">
                        {prod.description}
                      </p>
                    </div>

                    {/* Metadata chips list */}
                    <div className="bg-[#F7F9FB] rounded-xl border border-slate-100 p-4 space-y-2 font-sans text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider">DIAMETER RANGE:</span>
                        <span className="font-bold text-slate-800">{prod.sizeRange}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider">PACKAGING TYPE:</span>
                        <span className="font-medium text-slate-700 text-right text-[11px]">{prod.packaging}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider">EXPECTED BULB LIFE:</span>
                        <span className="font-medium text-slate-700 text-[11px]">{prod.shelfLife}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider">SEASON PEAKS:</span>
                        <span className="font-bold text-[#FF8A3D]">{prod.availability}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 shrink-0">
                    <button 
                      onClick={() => handleInitiateQuote(prod.name)}
                      className="w-full bg-[#7F3700] hover:bg-[#a14600] text-white text-xs font-bold py-3 rounded-full shadow-lg shadow-orange-950/10 transition-all uppercase tracking-widest cursor-pointer border-none"
                    >
                      Request Price Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 4: WHY NASHIK ONIONS */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Large image left */}
          <div className="lg:col-span-5 relative justify-self-center w-full max-w-md">
            <div className="aspect-[4/3] sm:aspect-[1/1] rounded-lg overflow-hidden border border-slate-200 shadow-xl group select-none">
              <img 
                src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80" 
                alt="Finest onions from the source" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#001D33] text-white p-5 rounded-md border border-[#003667] shadow-lg max-w-[200px] text-center select-none animate-pulse-slow">
              <span className="text-[#FF8A3D] font-mono text-3xl font-extrabold leading-none block">100%</span>
              <span className="text-[10px] tracking-widest font-bold uppercase block mt-1">Authentic Nashik Origin</span>
            </div>
          </div>

          {/* Benefits right */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Geographical Indication GI</span>
            <h2 className="font-display font-extrabold text-[#003667] text-2xl md:text-4xl leading-tight">Why are Nashik Onions Preferred Worldwide?</h2>
            <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">
              Cultivated in warm volcanic alluvial silt and optimized microclimates of Maharashtra, Nashik onions achieve legendary pungent ratings, skin hardness, and transit endurance.
            </p>

            <div className="space-y-4 pt-2">
              
              <div className="flex items-start gap-3">
                <div className="p-1 px-1.5 bg-secondary/15 rounded-full shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-primary text-sm">Rich Deep Purple-Red Color</h4>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-sans font-medium">Naturally dark saturated anthocyanin pigments, giving retail displays exceptional consumer appeal.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 px-1.5 bg-secondary/15 rounded-full shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-primary text-sm">Outstanding Ambient Shelf Life</h4>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-sans font-medium">Sturdy concentric structural leaf layers assure lower dehydration rates during long sea voyages.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 px-1.5 bg-secondary/15 rounded-full shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-primary text-sm">Extreme Intrinsic Pungency</h4>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-sans font-medium">Concentrated sulfur-rich dry oils provide robust zest coveted by commercial culinary extract processing industries.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: CERTIFICATIONS */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Import Compliance</span>
            <h2 className="font-display font-extrabold text-[#003667] text-2xl md:text-3xl">Certifications & Compliance Accreditation</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Our packing sheds operate in full adherence to international phytosanitary, safety, and export rules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.certifications.map(cert => (
              <div 
                key={cert.id} 
                className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-4 hover:border-secondary/30 hover:shadow transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="font-display font-extrabold text-primary text-base uppercase leading-tight">{cert.name}</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">{cert.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 6: SPECIFICATIONS TABLE */}
      <section id="specifications" className="py-20 md:py-28 bg-[#001D33] text-white overflow-hidden relative border-b border-[#003667]">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-12 relative z-10">
          
          <div className="text-center space-y-3">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Technical Sheet</span>
            <h2 className="font-display font-extrabold text-white text-2xl md:text-4xl">Agricultural Export Specifications</h2>
            <p className="text-slate-300 text-xs md:text-sm font-medium">Standard contract and trade parameters for our commercial global importers.</p>
          </div>

          {/* Table container */}
          <SpecificationsTable />

        </div>
      </section>

      {/* SECTION 7: GLOBAL MARKETS */}
      <section id="markets" className="py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Worldwide Logistics Destination</span>
            <h2 className="font-display font-extrabold text-[#003667] text-2xl md:text-4xl">Global Import Markets We Serve</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium">We satisfy the exact custom quarantine checks, sizes, and logistic delivery pipelines of multiple nations.</p>
          </div>

          {/* Structured country list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.countries.map(c => (
              <div 
                key={c.id} 
                className="bg-[#F7F9FB] rounded-lg p-5 border border-slate-200 flex items-start gap-4 hover:border-secondary/40 hover:bg-white transition-all group"
              >
                <div className="text-4.5xl leading-none select-none shrink-0 border border-slate-150 p-2 rounded bg-white font-mono group-hover:scale-110 transition-transform">
                  {c.flag}
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-primary text-base">{c.name}</h4>
                  <p className="text-slate-500 font-medium text-xs leading-relaxed font-sans">{c.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 8: STRATEGIC SOURCING HUBS */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Quality Sourcing Origins</span>
            <h2 className="font-display font-extrabold text-[#003667] text-2xl md:text-3xl">Strategic Agricultural Sourcing Hubs</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium">We operate packing units at key market nodes to obtain prompt pricing rates and robust crops.</p>
          </div>

          <StrategicSourcingHubs />

        </div>
      </section>

      {/* SECTION 9: EXPORT JOURNEY TIMELINE */}
      <section className="py-20 bg-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Audit Trails & Logistics</span>
            <h2 className="font-display font-extrabold text-[#003667] text-2xl md:text-4xl">Our Rigorous Export Journey</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Traceability, grading precision, and temperature surveillance at every stage of trade.</p>
          </div>

          <ExportTimeline />

        </div>
      </section>

      {/* SECTION 10: GALLERY */}
      <section id="gallery" className="py-20 md:py-28 bg-[#F7F9FB] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">Media Assets Showroom</span>
            <h2 className="font-display font-extrabold text-[#003667] text-2xl md:text-4xl">Agricultural Export Gallery</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Visual proof of our commitment to packing, loading consistency, and farm relationships.</p>
          </div>

          {/* Filtering buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["All", "Onions", "Farms", "Logistics"].map((cat) => (
              <button 
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full cursor-pointer transition-colors ${
                  galleryFilter === cat 
                    ? "bg-[#003667] text-white shadow-sm" 
                    : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200"
                }`}
              >
                {cat === "Onions" ? "Red Onions" : cat === "Farms" ? "Nashik Farms" : cat === "Logistics" ? "Maritime Log." : "View All"}
              </button>
            ))}
          </div>

          {/* Gallery dynamic catalog masonry representation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGallery.map((item, index) => (
              <div 
                key={item.id} 
                onClick={() => setLightboxIndex(index)}
                className="group relative rounded-md overflow-hidden border border-slate-200 shadow-xs cursor-pointer select-none bg-slate-200 aspect-square"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Floating look icon state overlay */}
                <span className="absolute inset-0 bg-[#001D33]/60 flex flex-col justify-end p-4 transition-opacity opacity-0 group-hover:opacity-100 font-sans z-10">
                  <span className="text-white font-bold text-xs md:text-sm">{item.title}</span>
                  <span className="text-[#FF8A3D] text-[10px] font-bold tracking-widest uppercase mt-1">{item.category}</span>
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 11: COMPANY PROFILE DOWNLOAD SECTION */}
      <section className="py-16 bg-[#003667] text-white relative select-none">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center space-y-6 relative z-10 font-sans">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-[#FF8A3D] mx-auto">
            <Download className="w-8 h-8" />
          </div>
          
          <h2 className="font-display font-extrabold text-2xl md:text-3.5xl tracking-tight uppercase">Download Our Corporate Export Profile</h2>
          <p className="text-slate-200 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-semibold">
            Obtain immediate offline access to our phytosanitary registration numbers, logistic port routes, crop tables, and standard trade contracts.
          </p>

          <div className="pt-2">
            <a 
              href={companyProfile.pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
              download={companyProfile.fileName}
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2.5 bg-[#FF8A3D] hover:bg-amber-600 text-white font-bold text-xs md:text-sm px-8 py-3.5 rounded shadow-lg transition-transform hover:scale-105 focus:outline-none uppercase tracking-wide cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              Download Free B2B PDF Brochure
            </a>
            <span className="block text-[10px] text-slate-300 font-mono mt-3">
              *Latest update: {companyProfile.pdfUrl ? new Date(companyProfile.updatedAt).toLocaleDateString() : "June 2026"} (PDF) • Compatible with phone and desktop readers
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 12: INQUIRY CORE FORM */}
      <section id="contact" className="py-20 md:py-28 bg-[#F7F9FB] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left company details list */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
            
            <div className="space-y-3">
              <span className="text-[#FF8A3D] font-mono text-xs font-extrabold uppercase tracking-widest block">B2B Trade Communication</span>
              <h2 className="font-display font-extrabold text-[#003667] text-2xl md:text-4xl leading-none">Partner With Us</h2>
              <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">
                Looking for a dependable, high-volume B2B supplier of Nashik red onions? Submit your custom packing, quantity criteria, and target disembark port.
              </p>
            </div>

            <div className="space-y-4 pt-4 font-sans text-xs md:text-sm text-slate-700">
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <strong className="block text-primary text-xs font-bold uppercase tracking-wider">Corporate Headquarters</strong>
                  <p className="text-slate-500 font-medium mt-1 leading-snug">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <strong className="block text-primary text-xs font-bold uppercase tracking-wider">Global Hotline Support</strong>
                  <p className="text-slate-500 font-semibold mt-1">{settings.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <strong className="block text-primary text-xs font-bold uppercase tracking-wider">Secure Trade Email</strong>
                  <p className="text-slate-500 font-semibold mt-1">{settings.email}</p>
                </div>
              </div>

            </div>

            <div className="bg-white rounded border border-slate-200/80 p-5 mt-4 space-y-1 text-slate-600 font-sans">
              <p className="text-xs font-bold text-[#FF8A3D] uppercase tracking-wider leading-none">Instant Chat response</p>
              <p className="text-[11px] leading-relaxed text-slate-500 mt-1">
                You can message our dispatching desk directly on WhatsApp at any time. Click the floating widget or call our hotlines for 1-on-1 assistance.
              </p>
            </div>

          </div>

          {/* Right inquiry submission Form */}
          <div ref={contactFormRef} className="lg:col-span-7 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-slate-200 relative">
            
            {inquirySuccess ? (
              <div className="text-center py-12 px-6 flex flex-col items-center justify-center space-y-4 font-sans">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-display font-extrabold text-primary text-xl md:text-2xl uppercase">Inquiry Received Successfully!</h3>
                <p className="text-slate-500 text-xs md:text-sm max-w-md leading-relaxed font-semibold">
                  Thank you for contacting Power Veg Exim. Our agricultural trade desk has received your request and will contact you via email with FOB/CIF quotes under 24 business hours.
                </p>
                <button 
                  onClick={() => setInquirySuccess(false)}
                  className="bg-primary hover:bg-secondary text-white font-bold text-xs px-6 py-2 rounded uppercase mt-4 cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-display font-extrabold text-primary text-lg md:text-xl uppercase">Submit Export Trade Inquiry</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Please provide valid commercial details to receive priority price responses.</p>
                </div>

                {formError && (
                  <div className="bg-red-50 text-red-700 text-xs px-4 py-2.5 rounded border border-red-200 font-medium">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">YOUR FULL NAME *</label>
                    <input 
                      type="text" 
                      required
                      value={inquiryForm.name}
                      onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      placeholder="e.g., Ah San Tan" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 rounded px-3 py-2.5 focus:ring-1 focus:ring-secondary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">COMPANY NAME / FIRM</label>
                    <input 
                      type="text" 
                      value={inquiryForm.company}
                      onChange={e => setInquiryForm({ ...inquiryForm, company: e.target.value })}
                      placeholder="e.g., Global Agro Food Wholesalers" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 rounded px-3 py-2.5 focus:ring-1 focus:ring-secondary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">EMAIL ADDRESS *</label>
                    <input 
                      type="email" 
                      required
                      value={inquiryForm.email}
                      onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      placeholder="e.g., buyer@company.com" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 rounded px-3 py-2.5 focus:ring-1 focus:ring-secondary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">TELEPHONE / PHONE NUMBER *</label>
                    <input 
                      type="text" 
                      required
                      value={inquiryForm.phone}
                      onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      placeholder="e.g., +60 12-345 6789" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 rounded px-3 py-2.5 focus:ring-1 focus:ring-secondary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">TARGET DELIVERY COUNTRY *</label>
                    <input 
                      type="text" 
                      required
                      value={inquiryForm.country}
                      onChange={e => setInquiryForm({ ...inquiryForm, country: e.target.value })}
                      placeholder="e.g., Malaysia, Singapore, UAE" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 rounded px-3 py-2.5 focus:ring-1 focus:ring-secondary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">ESTIMATED QUANTITY REQUIRED *</label>
                    <select 
                      value={inquiryForm.quantity}
                      onChange={e => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                      className="w-full text-xs border border-slate-200 bg-slate-50 rounded px-3 py-2.5 focus:outline-none"
                    >
                      <option value="12.5 Metric Tons (1x20ft Container)">12.5 Metric Tons (1x20ft Container)</option>
                      <option value="25 Metric Tons (1x40ft Container)">25 Metric Tons (1x40ft Container)</option>
                      <option value="50 Metric Tons (2x40ft Containers)">50 Metric Tons (2x40ft Containers)</option>
                      <option value="100+ Metric Tons (Weekly / Contract)">100+ Metric Tons (Weekly / Contract Allocation)</option>
                      <option value="Less than 1 Container (LCL / Truck load)">Less than 1 Container (LCL / Truck load)</option>
                    </select>
                  </div>
                </div>

                <div className="font-sans">
                  <label className="text-xs font-bold text-slate-600 block mb-1">SPECIFICATION DETAILS & MESSAGE</label>
                  <textarea 
                    rows={4}
                    value={inquiryForm.message}
                    onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    placeholder="Describe custom size diameters (e.g. 55mm+), specific packaging weights (e.g. 10kg mesh bags), disembark ports, or custom labeling protocols..." 
                    className="w-full text-xs border border-slate-200 bg-slate-50 rounded p-3 focus:ring-1 focus:ring-secondary focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button 
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="w-full sm:w-auto bg-primary hover:bg-secondary text-white text-xs md:text-sm font-extrabold px-8 py-3.5 rounded shadow-sm flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider transition-all"
                  >
                    {isSubmittingInquiry ? "Sending Securely..." : "Send Export Inquiry"}
                    <Send className="w-4 h-4 shrink-0 text-[#FF8A3D]" />
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* SECTION 13: BRAND FOOTER */}
      <footer className="bg-[#001D33] text-white pt-16 pb-12 overflow-hidden border-t-2 border-[#003667]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start select-none">
          
          {/* Brand left */}
          <div className="col-span-1 md:col-span-4 space-y-4">
            <Logo logoUrl={settings.logoUrl} light={true} />
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm mt-3 font-medium">
              Sourcing the highest-caliber, double-skin Nashik red onions from Indian fertile fields, delivering freshness and logistics trust worldwide.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-sans mt-4">
              <span>★ Registered APEDA Member Exporter</span>
              <span>•</span>
              <span>IEC Compliant</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1 md:col-span-2 space-y-3 font-sans">
            <h4 className="font-display font-bold text-[#FF8A3D] text-[10px] md:text-xs tracking-widest uppercase">Quick Links</h4>
            <div className="flex flex-col space-y-2 text-xs text-slate-350">
              <button onClick={() => handleScrollTo("home")} className="text-left hover:text-white transition-colors cursor-pointer">Back to Home</button>
              <button onClick={() => handleScrollTo("about")} className="text-left hover:text-white transition-colors cursor-pointer">Our Strengths</button>
              <button onClick={() => handleScrollTo("products")} className="text-left hover:text-white transition-colors cursor-pointer">Product Calibers</button>
              <button onClick={() => handleScrollTo("specifications")} className="text-left hover:text-white transition-colors cursor-pointer">Specification Sheet</button>
            </div>
          </div>

          {/* Contact details */}
          <div className="col-span-1 md:col-span-3 space-y-3 font-sans">
            <h4 className="font-display font-bold text-[#FF8A3D] text-[10px] md:text-xs tracking-widest uppercase">Trade Communication</h4>
            <div className="space-y-2 text-xs text-slate-350">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-secondary shrink-0" />{settings.address}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-secondary shrink-0" />{settings.phone}</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-secondary shrink-0" />{settings.email}</p>
            </div>
          </div>

          {/* Admin gateway */}
          <div className="col-span-1 md:col-span-3 space-y-3 font-sans">
            <h4 className="font-display font-bold text-[#FF8A3D] text-[10px] md:text-xs tracking-widest uppercase">Platform Authority</h4>
            <p className="text-slate-400 text-xs">Verify inquiries, manage grading inventory, and modify coordinates on-the-fly.</p>
            <button 
              onClick={() => setShowAdminConsole(true)}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold px-4 py-2 rounded flex items-center justify-center gap-2 transition-transform cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Administrative Login
            </button>
          </div>

        </div>

        {/* copyright row */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-4 select-none">
          <span>&copy; {new Date().getFullYear()} Power Veg Exim. All rights reserved. Global Agricultural Exporters.</span>
          <div className="flex gap-4">
            <span>Server Version: v1.2.0 (Express CJS)</span>
            <span>•</span>
            <button 
              onClick={() => { setShowAdminConsole(true); }}
              className="hover:text-[#FF8A3D] underline cursor-pointer"
            >
              Admin Gateway Console
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
