import React, { useState } from "react";
import { Send, Mail, MapPin, Phone, Sparkles } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    product: "Onion",
    quantity: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.company || !form.email || !form.phone || !form.country || !form.quantity) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSubmitted(true);
        setForm({
          name: "",
          company: "",
          email: "",
          phone: "",
          country: "",
          product: "Onion",
          quantity: "",
          message: "",
        });
      } else {
        setError(data.error || "Failed to submit inquiry.");
      }
    } catch (err) {
      setError("Could not connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-32 px-4 md:px-24 bg-[#0B1020] relative border-t border-neutral-900 z-20 scroll-mt-24 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#003F7F]/3 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        
        {/* Left Info Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-12">
          <div>
            <span className="font-mono text-xs text-[#FF7A1A] uppercase tracking-[0.25em] block mb-3 font-bold">
              04 / CONTRACTING INQUIRIES
            </span>
            <h2 className="font-display font-black text-3xl md:text-6xl tracking-tight leading-none mb-4 md:mb-6 text-white">
              REQUEST AN <br />
              <span className="bg-gradient-to-r from-[#0E8ACF] to-orange-400 bg-clip-text text-transparent">
                EXPORT QUOTE.
              </span>
            </h2>
            <p className="font-sans text-neutral-300 text-sm md:text-base font-light leading-relaxed">
              Initiate commercial contracts, custom packing requests, shipping calculations, and phytosanitary verification sheets. Submit your requirements and our export directors will reply within 12 hours.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-neutral-300">
              <div className="p-3 bg-[#0f162d] border border-neutral-800 rounded-xl">
                <Mail className="w-5 h-5 text-[#FF7A1A]" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider">Trading Email</p>
                <p className="text-sm font-semibold">export@powervegexim.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-neutral-300">
              <div className="p-3 bg-[#0f162d] border border-neutral-800 rounded-xl">
                <Phone className="w-5 h-5 text-[#0E8ACF]" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider">Corporate Line</p>
                <p className="text-sm font-semibold">+91 98907 61639</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-neutral-300">
              <div className="p-3 bg-[#0f162d] border border-neutral-800 rounded-xl">
                <MapPin className="w-5 h-5 text-[#FF7A1A]" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider">Sourcing Office</p>
                <p className="text-xs leading-relaxed text-neutral-400">Lasalgaon Road, Pimpalgaon Baswant, Nashik, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-[#0f162d]/50 backdrop-blur-md border border-neutral-800/80 p-5 md:p-12 rounded-2xl md:rounded-3xl">
            {submitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 rounded-full flex items-center justify-center mx-auto text-[#FF7A1A]">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-display font-bold text-xl text-white">Inquiry Received!</h3>
                <p className="font-sans text-neutral-400 text-sm font-light max-w-sm mx-auto leading-relaxed">
                  Thank you for your inquiry. Our agricultural logistics desk is verifying container slot availability and FOB/CIF rates for your target port.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-xs font-mono text-[#FF7A1A] hover:underline uppercase tracking-wider cursor-pointer border-none bg-transparent"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#0B1020] border border-neutral-800 focus:border-[#FF7A1A]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      placeholder="Enter contact name"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                      Company Name *
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full bg-[#0B1020] border border-neutral-800 focus:border-[#FF7A1A]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#0B1020] border border-neutral-800 focus:border-[#FF7A1A]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-[#0B1020] border border-neutral-800 focus:border-[#FF7A1A]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      placeholder="e.g. +1 234 567 8900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                      Destination Country *
                    </label>
                    <input
                      id="country"
                      type="text"
                      required
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full bg-[#0B1020] border border-neutral-800 focus:border-[#FF7A1A]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      placeholder="e.g. UAE, Malaysia, Singapore"
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                      Quantity Required (MT) *
                    </label>
                    <input
                      id="quantity"
                      type="text"
                      required
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className="w-full bg-[#0B1020] border border-neutral-800 focus:border-[#FF7A1A]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      placeholder="e.g. 25 Metric Tons"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="product" className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                      Product Interested In *
                    </label>
                    <select
                      id="product"
                      value={form.product}
                      onChange={(e) => setForm({ ...form, product: e.target.value })}
                      className="w-full bg-[#0B1020] border border-neutral-800 focus:border-[#FF7A1A]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                    >
                      <option value="Onion">Onion</option>
                      <option value="Okra">Okra</option>
                      <option value="Pomegranate">Pomegranate</option>
                      <option value="Grapes">Grapes</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                    Additional Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-[#0B1020] border border-neutral-800 focus:border-[#FF7A1A]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none"
                    placeholder="Enter specs like size preferred, packing type, shipping terms (FOB/CIF)..."
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs font-mono">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#003F7F] via-[#0E8ACF] to-[#FF7A1A] text-white text-xs font-mono uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 font-bold"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
