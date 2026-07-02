import React, { useState, useEffect } from "react";
import { 
  Lock, LayoutDashboard, ShoppingBag, Image as ImageIcon, Award, Globe, 
  Settings, Mail, LogOut, Plus, Trash2, Edit3, Download, Search, Check, 
  FileText, Upload, RefreshCw, X, Eye, ArrowLeft
} from "lucide-react";
import { Product, GalleryItem, Certification, CountryCard, Inquiry, WebsiteSettings, CompanyProfile } from "../types";

import { useAuth } from "../context/AuthContext";

interface AdminPanelProps {
  onClose: () => void;
  publicData: {
    products: Product[];
    gallery: GalleryItem[];
    certifications: Certification[];
    countries: CountryCard[];
    company_profile: CompanyProfile;
    website_settings: WebsiteSettings;
  };
  onRefreshData: () => void;
}

export default function AdminPanel({ onClose, publicData, onRefreshData }: AdminPanelProps) {
  const { logout } = useAuth();
  const isAuthenticated = true; // Governed by AuthGuard at router level

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "gallery" | "certifications" | "countries" | "settings" | "inquiries">("dashboard");

  // Shared Admin Lists (synchronised with backend)
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState<boolean>(false);

  // Search & Filters inside Inquiries
  const [inquirySearch, setInquirySearch] = useState<string>("");
  const [inquiryCountryFilter, setInquiryCountryFilter] = useState<string>("all");

  // Notifications/TOAST state
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editing state variables
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCert, setEditingCert] = useState<Partial<Certification> | null>(null);
  const [editingCountry, setEditingCountry] = useState<Partial<CountryCard> | null>(null);

  // Form inputs for additions
  const [newProduct, setNewProduct] = useState({
    name: "", sizeRange: "", packaging: "", shelfLife: "", availability: "", description: ""
  });
  const [productFile, setProductFile] = useState<File | null>(null);

  const [newGallery, setNewGallery] = useState({ title: "", category: "Onions" });
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const [newCert, setNewCert] = useState({ name: "", description: "" });
  const [newCountry, setNewCountry] = useState({ name: "", flag: "", description: "" });

  // Settings form
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>({
    logoUrl: "", whatsappNumber: "", email: "", phone: "", address: "", bannerTitle: "", bannerSubtitle: "", facebookUrl: "", instagramUrl: "", linkedinUrl: "", twitterUrl: ""
  });

  // Fetch inquiries when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
      setSettingsForm(publicData.website_settings);
    }
  }, [isAuthenticated, publicData.website_settings]);

  // Show Toast Auto-dismiss
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInquiries = async () => {
    setIsLoadingInquiries(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out successfully.");
    } catch (err) {
      showToast("Logout failed.", "error");
    }
  };

  // --- CRUD: Products ---
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name) return showToast("Product Name is required", "error");

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("sizeRange", newProduct.sizeRange);
    formData.append("packaging", newProduct.packaging);
    formData.append("shelfLife", newProduct.shelfLife);
    formData.append("availability", newProduct.availability);
    formData.append("description", newProduct.description);
    if (productFile) {
      formData.append("productImage", productFile);
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        showToast("Product added successfully!");
        setNewProduct({ name: "", sizeRange: "", packaging: "", shelfLife: "", availability: "", description: "" });
        setProductFile(null);
        onRefreshData();
      } else {
        showToast("Failed to create product", "error");
      }
    } catch (err) {
      showToast("Server connection failure", "error");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.id) return;

    const formData = new FormData();
    formData.append("name", editingProduct.name || "");
    formData.append("sizeRange", editingProduct.sizeRange || "");
    formData.append("packaging", editingProduct.packaging || "");
    formData.append("shelfLife", editingProduct.shelfLife || "");
    formData.append("availability", editingProduct.availability || "");
    formData.append("description", editingProduct.description || "");
    if (productFile) {
      formData.append("productImage", productFile);
    }

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        body: formData
      });
      if (res.ok) {
        showToast("Product updated successfully!");
        setEditingProduct(null);
        setProductFile(null);
        onRefreshData();
      } else {
        showToast("Failed to update product", "error");
      }
    } catch (err) {
      showToast("Server connection failure", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Product removed.");
        onRefreshData();
      }
    } catch (err) {
      showToast("Could not delete product.", "error");
    }
  };

  // --- CRUD: Gallery ---
  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newGallery.title || "Gallery Item");
    formData.append("category", newGallery.category);
    if (galleryFile) {
      formData.append("galleryImage", galleryFile);
    } else {
      return showToast("Please select an image file to upload", "error");
    }

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        showToast("Gallery image uploaded successfully!");
        setNewGallery({ title: "", category: "Onions" });
        setGalleryFile(null);
        onRefreshData();
      } else {
        showToast("Failed to upload image", "error");
      }
    } catch (err) {
      showToast("File upload connection failure", "error");
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Remove this image from gallery?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Gallery image deleted.");
        onRefreshData();
      }
    } catch (err) {
      showToast("Could not remove gallery item.", "error");
    }
  };

  // --- CRUD: Certifications ---
  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name) return showToast("Certificate name required", "error");

    try {
      const res = await fetch("/api/admin/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCert)
      });
      if (res.ok) {
        showToast("Acredited certification added.");
        setNewCert({ name: "", description: "" });
        onRefreshData();
      }
    } catch (err) {
      showToast("Server communication error", "error");
    }
  };

  const handleUpdateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert || !editingCert.id) return;

    try {
      const res = await fetch(`/api/admin/certifications/${editingCert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCert)
      });
      if (res.ok) {
        showToast("Certificate updated.");
        setEditingCert(null);
        onRefreshData();
      }
    } catch (err) {
      showToast("Network failure", "error");
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/certifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Certification deleted.");
        onRefreshData();
      }
    } catch (err) {
      showToast("Failure deleting certificate", "error");
    }
  };

  // --- CRUD: Countries ---
  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.name) return showToast("Country name required", "error");
    try {
      const res = await fetch("/api/admin/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCountry)
      });
      if (res.ok) {
        showToast("Global Market added.");
        setNewCountry({ name: "", flag: "", description: "" });
        onRefreshData();
      }
    } catch (err) {
      showToast("Server connection error", "error");
    }
  };

  const handleUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountry || !editingCountry.id) return;
    try {
      const res = await fetch(`/api/admin/countries/${editingCountry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCountry)
      });
      if (res.ok) {
        showToast("Market country updated.");
        setEditingCountry(null);
        onRefreshData();
      }
    } catch (err) {
      showToast("Update error", "error");
    }
  };

  const handleDeleteCountry = async (id: string) => {
    if (!confirm("Delete this market?")) return;
    try {
      const res = await fetch(`/api/admin/countries/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Market deleted.");
        onRefreshData();
      }
    } catch (err) {
      showToast("Delete failure", "error");
    }
  };

  // --- Website settings & logo/pdf uploads ---
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/website-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        showToast("Settings saved successfully!");
        onRefreshData();
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch (err) {
      showToast("Server connection key error", "error");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("logo", file);

    showToast("Processing Logo upload...", "success");

    try {
      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setSettingsForm({ ...settingsForm, logoUrl: data.fileUrl });
        showToast("Logo updated. Click Save Settings to persist.");
        onRefreshData();
      } else {
        showToast("Logo upload failed.", "error");
      }
    } catch (err) {
      showToast("Logo uploading endpoint failed.", "error");
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("pdf", file);

    showToast("Uploading Company Profile PDF...", "success");

    try {
      const res = await fetch("/api/admin/upload-pdf", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        showToast("Company profile PDF successfully uploaded on server!");
        onRefreshData();
      } else {
        showToast("PDF Upload failed.", "error");
      }
    } catch (err) {
      showToast("Server error during PDF uploading.", "error");
    }
  };

  // --- CRUD: Inquiries (Download CSV + deletables) ---
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Delete this buyer inquiry record?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Inquiry item deleted.");
        fetchInquiries();
      }
    } catch (err) {
      showToast("Failed to delete inquiry.", "error");
    }
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      return showToast("No inquiries available to export", "error");
    }

    const headers = ["ID", "Buyer Name", "Company/Firm", "Email Address", "Phone Number", "Country Location", "Required Qty (MT)", "Specifications Message", "Submission Date"];
    
    const rows = inquiries.map(inq => {
      // Escape commas & quotes
      const clean = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
      return [
        inq.id,
        clean(inq.name),
        clean(inq.company),
        clean(inq.email),
        clean(inq.phone),
        clean(inq.country),
        clean(inq.quantity),
        clean(inq.message),
        inq.createdAt
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PowerVegExim_Buyer_Inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("CSV file generated and downloaded!");
  };

  // Filtered inquiries selector
  const filteredInquiries = inquiries.filter(inq => {
    const textSearch = (inq.name + " " + inq.company + " " + inq.message + " " + inq.email + " " + inq.country).toLowerCase();
    const matchesSearch = textSearch.includes(inquirySearch.toLowerCase());
    const matchesCountry = inquiryCountryFilter === "all" || inq.country.toLowerCase() === inquiryCountryFilter.toLowerCase();
    return matchesSearch && matchesCountry;
  });

  // Extract unique countries in inquiries list
  const uniqueInquiryCountries = Array.from(new Set(inquiries.map(i => i.country).filter(Boolean)));

  // authenticated layout
  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg border text-sm font-semibold flex items-center gap-3 transition-transform animate-bounce ${
          toastMessage.type === "success" 
            ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
            : "bg-red-50 border-red-300 text-red-800"
        }`}>
          <Check className="w-5 h-5 rounded-full bg-emerald-500 text-white p-0.5" />
          {toastMessage.text}
        </div>
      )}

      {/* Sidebar navigation */}
      <div className="w-full md:w-64 bg-[#001D33] text-white flex flex-col shrink-0 border-r border-[#003667]">
        <div className="p-6 border-b border-[#003667] flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-[#FF8A3D] text-lg">Power Veg Exim</h1>
            <p className="text-[10px] text-slate-300 tracking-wider">Control Panel console</p>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden text-slate-300 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-3 ${activeTab === "dashboard" ? "bg-[#003667] text-white" : "text-slate-300 hover:bg-[#003667]/40"}`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard
          </button>

          <button 
            onClick={() => { setActiveTab("products"); setEditingProduct(null); }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-3 ${activeTab === "products" ? "bg-[#003667] text-white" : "text-slate-300 hover:bg-[#003667]/40"}`}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            Export Products
          </button>

          <button 
            onClick={() => setActiveTab("gallery")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-3 ${activeTab === "gallery" ? "bg-[#003667] text-white" : "text-slate-300 hover:bg-[#003667]/40"}`}
          >
            <ImageIcon className="w-4.5 h-4.5" />
            Stock Gallery
          </button>

          <button 
            onClick={() => { setActiveTab("certifications"); setEditingCert(null); }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-3 ${activeTab === "certifications" ? "bg-[#003667] text-white" : "text-slate-300 hover:bg-[#003667]/40"}`}
          >
            <Award className="w-4.5 h-4.5" />
            Certifications
          </button>

          <button 
            onClick={() => { setActiveTab("countries"); setEditingCountry(null); }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-3 ${activeTab === "countries" ? "bg-[#003667] text-white" : "text-slate-300 hover:bg-[#003667]/40"}`}
          >
            <Globe className="w-4.5 h-4.5" />
            Global Markets
          </button>

          <button 
            onClick={() => setActiveTab("inquiries")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center justify-between ${activeTab === "inquiries" ? "bg-[#003667] text-white" : "text-slate-300 hover:bg-[#003667]/40"}`}
          >
            <span className="flex items-center gap-3">
              <Mail className="w-4.5 h-4.5" />
              Buyer Inquiries
            </span>
            {inquiries.length > 0 && (
              <span className="bg-[#7F3700] text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                {inquiries.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-3 ${activeTab === "settings" ? "bg-[#003667] text-white" : "text-slate-300 hover:bg-[#003667]/40"}`}
          >
            <Settings className="w-4.5 h-4.5" />
            Website Settings
          </button>
        </nav>

        <div className="p-4 border-t border-[#003667] space-y-3">
          <button 
            onClick={onClose}
            className="w-full bg-[#00639C] hover:bg-[#003667] text-white text-xs font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go to Website
          </button>

          <button 
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs font-semibold text-rose-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out Console
          </button>
        </div>
      </div>

      {/* Main Console window area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        
        {/* Main top header */}
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-extrabold text-slate-800 text-lg md:text-xl uppercase tracking-tight">
              {activeTab === "dashboard" && "Console Dashboard Overview"}
              {activeTab === "products" && "Export Onion Lists & Packaging"}
              {activeTab === "gallery" && "Stock Photos / Media Files"}
              {activeTab === "certifications" && "Export Credentials & Compliance"}
              {activeTab === "countries" && "Serve Global Markets"}
              {activeTab === "inquiries" && "Active Buyers & Trade Inquiries"}
              {activeTab === "settings" && "Custom Branding & Variables"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Exit Admin
          </button>
        </header>

        {/* Dynamic Inner Tab body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* TAB: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Top KPI Cards row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#003667]/10 text-[#003667] rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#003667] font-mono">{publicData.products.length}</h3>
                    <p className="text-xs text-slate-500 font-medium">Export Products Available</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-emerald-700 font-mono">{inquiries.length}</h3>
                    <p className="text-xs text-slate-500 font-medium">Recorded Inquiries</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-amber-700 font-mono">{publicData.certifications.length}</h3>
                    <p className="text-xs text-slate-500 font-medium">Compliant Certificates</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00639C]/10 text-[#00639C] rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#00639C] font-mono">{publicData.countries.length}</h3>
                    <p className="text-xs text-slate-500 font-medium">International Markets</p>
                  </div>
                </div>
              </div>

              {/* Quick Profile / Logo Uploaders card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* PDF & LOGO replaces */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-display font-extrabold text-[#003667] text-md uppercase">Upload Logo & PDF Media Assets</h3>
                    <p className="text-xs text-slate-500">Instantly replace PDF brochure and organization logotypes without making code file edits.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Logo upload */}
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-700 uppercase">Interactive Company Logo</p>
                        <p className="text-[10px] text-slate-500 mt-1">Replaces Navy & Inline footer logo references.</p>
                        {settingsForm.logoUrl && (
                          <span className="inline-block bg-[#003667]/10 text-primary text-[10px] font-mono px-2 py-0.5 rounded mt-2">
                            Active Logo: {settingsForm.logoUrl}
                          </span>
                        )}
                      </div>
                      <label className="bg-[#003667] hover:bg-[#00639C] text-white text-xs font-bold px-4 py-2 rounded cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        Replace Logo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {/* PDF brochure upload */}
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-[#7F3700] uppercase">Company Profile PDF Brochure</p>
                        <p className="text-[10px] text-slate-500 mt-1">File downloaded by prospective global buyers.</p>
                        <span className="inline-block bg-[#7F3700]/10 text-[#7F3700] text-[10px] font-mono px-2 py-0.5 rounded mt-2">
                          {publicData.company_profile.pdfUrl ? `Active PDF File: ${publicData.company_profile.fileName}` : "Using Mock/Default PDF Link"}
                        </span>
                      </div>
                      <label className="bg-[#7F3700] hover:bg-amber-800 text-white text-xs font-bold px-4 py-2 rounded cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-sm">
                        <FileText className="w-3.5 h-3.5" />
                        Replace PDF
                        <input 
                          type="file" 
                          accept="application/pdf" 
                          onChange={handlePdfUpload}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Latest inquiry snippet card */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-extrabold text-[#003667] text-md uppercase">Latest Trade Inquiry</h3>
                      <p className="text-xs text-slate-500">Most recent logistics / pricing message from international importer.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("inquiries")}
                      className="text-[#00639C] hover:underline text-xs font-bold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex-1 mt-4">
                    {inquiries.length > 0 ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{inquiries[0].name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{inquiries[0].company} • {inquiries[0].country}</p>
                          </div>
                          <span className="bg-amber-50 text-amber-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                            Qty: {inquiries[0].quantity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-3 bg-white p-3 rounded border border-slate-100 font-serif italic">
                          "{inquiries[0].message}"
                        </p>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Submitted on {new Date(inquiries[0].createdAt).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                        No inquiries submitted yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS CRUD */}
          {activeTab === "products" && (
            <div className="space-y-8">
              
              {/* Product creator card */}
              {!editingProduct && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="font-display font-extrabold text-[#003667] text-md uppercase tracking-wide mb-4">Add New Export Onion Grade</h3>
                  
                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-bold text-slate-500">PRODUCT NAME</label>
                      <input 
                        type="text" 
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g., Premium Export Grade Onion" 
                        className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">SIZE DIAMETER RANGE</label>
                      <input 
                        type="text" 
                        value={newProduct.sizeRange}
                        onChange={e => setNewProduct({ ...newProduct, sizeRange: e.target.value })}
                        placeholder="e.g., 55mm - 80mm" 
                        className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">PACKAGING TYPES</label>
                      <input 
                        type="text" 
                        value={newProduct.packaging}
                        onChange={e => setNewProduct({ ...newProduct, packaging: e.target.value })}
                        placeholder="e.g., 20kg & 40kg Mesh Bags" 
                        className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">EXPECTED SHELF LIFE</label>
                      <input 
                        type="text" 
                        value={newProduct.shelfLife}
                        onChange={e => setNewProduct({ ...newProduct, shelfLife: e.target.value })}
                        placeholder="e.g., Up to 6 Months" 
                        className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">AVAILABILITY PEAK SEASONS</label>
                      <input 
                        type="text" 
                        value={newProduct.availability}
                        onChange={e => setNewProduct({ ...newProduct, availability: e.target.value })}
                        placeholder="e.g., Year-Round" 
                        className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">PRODUCT DISPLAY IMAGE</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => e.target.files && setProductFile(e.target.files[0])}
                        className="w-full text-xs border border-dashed border-slate-200 bg-slate-50 p-1.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-slate-500 font-display">GRADE DESCRIPTION / SOURCING CHARACTERISTICS</label>
                      <textarea 
                        rows={2}
                        value={newProduct.description}
                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Enter short details about sorting process, crisp flavor, or target shipping demographics..."
                        className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <button 
                        type="submit"
                        className="bg-[#003667] text-white text-xs font-bold px-6 py-2.5 rounded uppercase tracking-wider hover:bg-[#00639C] flex items-center gap-2 shadow cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Create Onion Grade
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Editing Product form */}
              {editingProduct && (
                <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display font-extrabold text-[#7F3700] text-md uppercase tracking-wide">Edit Onion Grade: {editingProduct.name}</h3>
                    <button 
                      onClick={() => setEditingProduct(null)}
                      className="p-1 hover:bg-amber-100 rounded text-slate-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-bold text-slate-600">PRODUCT NAME</label>
                      <input 
                        type="text" 
                        value={editingProduct.name || ""}
                        onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">SIZE DIAMETER RANGE</label>
                      <input 
                        type="text" 
                        value={editingProduct.sizeRange || ""}
                        onChange={e => setEditingProduct({ ...editingProduct, sizeRange: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">PACKAGING TYPES</label>
                      <input 
                        type="text" 
                        value={editingProduct.packaging || ""}
                        onChange={e => setEditingProduct({ ...editingProduct, packaging: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">EXPECTED SHELF LIFE</label>
                      <input 
                        type="text" 
                        value={editingProduct.shelfLife || ""}
                        onChange={e => setEditingProduct({ ...editingProduct, shelfLife: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">AVAILABILITY PEAK SEASONS</label>
                      <input 
                        type="text" 
                        value={editingProduct.availability || ""}
                        onChange={e => setEditingProduct({ ...editingProduct, availability: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">REPLACE DISPLAY IMAGE (OPTIONAL)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => e.target.files && setProductFile(e.target.files[0])}
                        className="w-full text-xs border border-dashed border-amber-200 bg-white p-1.5 rounded"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-slate-600 font-display">GRADE DESCRIPTION</label>
                      <textarea 
                        rows={3}
                        value={editingProduct.description || ""}
                        onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2.5 rounded uppercase"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-[#7F3700] text-white text-xs font-bold px-6 py-2.5 rounded uppercase hover:bg-amber-900"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products Grid list */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-bold text-slate-700 text-sm uppercase">Active Product Listings</h4>
                </div>
                <div className="divide-y divide-slate-150">
                  {publicData.products.map(prod => (
                    <div key={prod.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50">
                      <div className="flex gap-4 items-center">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          className="w-16 h-16 object-cover rounded border border-slate-200 shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h5 className="font-bold font-display text-slate-900 text-sm md:text-base">{prod.name}</h5>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs mt-1">
                            <span><strong className="text-slate-700">Size:</strong> {prod.sizeRange}</span>
                            <span><strong className="text-slate-700">Packing:</strong> {prod.packaging}</span>
                            <span><strong className="text-slate-700">Life:</strong> {prod.shelfLife}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 self-end sm:self-center">
                        <button 
                          onClick={() => { setEditingProduct(prod); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="p-2 text-[#00639C] hover:bg-[#00639C]/10 rounded border border-[#00639C]/20 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GALLERY CRUD */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              
              {/* Image upload card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="font-display font-extrabold text-[#003667] text-md uppercase mb-4">Upload Gallery Image</h3>
                
                <form onSubmit={handleCreateGallery} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="text-xs font-bold text-slate-500">IMAGE CAPTION/TITLE (OPTIONAL)</label>
                    <input 
                      type="text" 
                      value={newGallery.title}
                      onChange={e => setNewGallery({ ...newGallery, title: e.target.value })}
                      placeholder="e.g., Quality Onion Packing" 
                      className="w-full text-xs border border-slate-200 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">IMAGE CATEGORY</label>
                    <select 
                      value={newGallery.category}
                      onChange={e => setNewGallery({ ...newGallery, category: e.target.value })}
                      className="w-full text-xs border border-slate-200 p-2.5 bg-white rounded focus:ring-1 focus:ring-[#00639C]"
                    >
                      <option value="Onions">Red Onions</option>
                      <option value="Farms">Nashik Farms</option>
                      <option value="Logistics">Maritime Logistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">SELECT ATTACHMENT IMAGE</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => e.target.files && setGalleryFile(e.target.files[0])}
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-1.5 rounded"
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <button 
                      type="submit"
                      className="bg-[#003667] text-white text-xs font-bold px-6 py-2 rounded flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Stock Gallery
                    </button>
                  </div>
                </form>
              </div>

              {/* Gallery elements display */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h4 className="font-bold text-slate-700 text-sm uppercase mb-4">Stock Gallery Photos ({publicData.gallery.length})</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {publicData.gallery.map(item => (
                    <div key={item.id} className="group relative rounded-md overflow-hidden border border-slate-200 shadow-sm bg-slate-50 aspect-square">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 transition-opacity">
                        <p className="text-white font-bold text-xs">{item.title}</p>
                        <p className="text-[#FF8A3D] text-[10px] font-mono leading-none mt-1">{item.category}</p>
                        <button 
                          onClick={() => handleDeleteGallery(item.id)}
                          className="mt-3 bg-red-600 text-white rounded p-1 w-fit hover:bg-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CERTIFICATIONS */}
          {activeTab === "certifications" && (
            <div className="space-y-6">
              
              {/* Creator cert card */}
              {!editingCert && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="font-display font-extrabold text-[#003667] text-md uppercase mb-4">Add Compliance / Certificate</h3>
                  <form onSubmit={handleCreateCert} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500">CERTIFICATE TITLE / COMPLIANCE NAME</label>
                        <input 
                          type="text" 
                          value={newCert.name}
                          onChange={e => setNewCert({ ...newCert, name: e.target.value })}
                          placeholder="e.g., FSSAI Certified Packhouse" 
                          className="w-full text-xs border border-slate-200 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">COMPLIANCE SPECIFICATIONS / VALUE TO BUYERS</label>
                      <textarea 
                        rows={2}
                        value={newCert.description}
                        onChange={e => setNewCert({ ...newCert, description: e.target.value })}
                        placeholder="State what this certification standard represents for safety or ease of clearing customs..." 
                        className="w-full text-xs border border-slate-200 p-2 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="bg-[#003667] text-white text-xs font-bold px-6 py-2 rounded cursor-pointer"
                      >
                        Add Certificate Card
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Editing Cert form */}
              {editingCert && (
                <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-200">
                  <h3 className="font-display font-extrabold text-[#7F3700] text-md uppercase mb-4">Edit Certificate Card</h3>
                  <form onSubmit={handleUpdateCert} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600">CERTIFICATE NAME</label>
                      <input 
                        type="text" 
                        value={editingCert.name || ""}
                        onChange={e => setEditingCert({ ...editingCert, name: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">DESCRIPTION</label>
                      <textarea 
                        rows={2}
                        value={editingCert.description || ""}
                        onChange={e => setEditingCert({ ...editingCert, description: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2 rounded"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingCert(null)}
                        className="bg-slate-300 text-slate-800 text-xs px-4 py-2 rounded uppercase font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-[#7F3700] text-white text-xs px-5 py-2 rounded uppercase font-bold hover:bg-amber-900"
                      >
                        Save Certificate
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* List credentials */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-bold text-slate-700 text-xs uppercase">Compliance Credentials list</h4>
                </div>
                <div className="divide-y divide-slate-150">
                  {publicData.certifications.map(cert => (
                    <div key={cert.id} className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <h5 className="font-bold font-display text-[#003667] text-sm">{cert.name}</h5>
                        <p className="text-xs text-slate-500 mt-1 max-w-2xl">{cert.description}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => { setEditingCert(cert); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="p-1.5 text-slate-500 hover:text-[#00639C] border border-slate-200 rounded hover:bg-slate-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCert(cert.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 border border-slate-200 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GLOBAL MARKETS COUNTRY CRUD */}
          {activeTab === "countries" && (
            <div className="space-y-6">
              
              {/* Creator Country */}
              {!editingCountry && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="font-display font-extrabold text-[#003667] text-md uppercase mb-4">Add Global Export Market / Country</h3>
                  <form onSubmit={handleCreateCountry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500">COUNTRY NAME</label>
                      <input 
                        type="text" 
                        value={newCountry.name}
                        onChange={e => setNewCountry({ ...newCountry, name: e.target.value })}
                        placeholder="e.g., Vietnam" 
                        className="w-full text-xs border border-slate-200 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500">EMOJI FLAG CHARACTER</label>
                      <input 
                        type="text" 
                        value={newCountry.flag}
                        onChange={e => setNewCountry({ ...newCountry, flag: e.target.value })}
                        placeholder="e.g., 🇻🇳" 
                        className="w-full text-xs border border-slate-200 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500">MARKET DESCRIPTION (ONION SIZES/ROUTING SPECIFICATIONS)</label>
                      <input 
                        type="text" 
                        value={newCountry.description}
                        onChange={e => setNewCountry({ ...newCountry, description: e.target.value })}
                        placeholder="e.g., High-volume buyer of fresh 40-50mm onions shipped directly via dry ventilated sea cargo." 
                        className="w-full text-xs border border-slate-200 p-2.5 rounded focus:ring-1 focus:ring-[#00639C]"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button 
                        type="submit"
                        className="bg-[#003667] text-white text-xs font-bold px-6 py-2 rounded cursor-pointer"
                      >
                        Add Global Market
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Editing country form */}
              {editingCountry && (
                <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-200">
                  <h3 className="font-display font-extrabold text-[#7F3700] text-md uppercase mb-4">Edit Market Country</h3>
                  <form onSubmit={handleUpdateCountry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600">COUNTRY NAME</label>
                      <input 
                        type="text" 
                        value={editingCountry.name || ""}
                        onChange={e => setEditingCountry({ ...editingCountry, name: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">EMOJI FLAG</label>
                      <input 
                        type="text" 
                        value={editingCountry.flag || ""}
                        onChange={e => setEditingCountry({ ...editingCountry, flag: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">MARKET DESCRIPTION</label>
                      <input 
                        type="text" 
                        value={editingCountry.description || ""}
                        onChange={e => setEditingCountry({ ...editingCountry, description: e.target.value })}
                        className="w-full text-xs border border-amber-200 bg-white p-2.5 rounded"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingCountry(null)}
                        className="bg-slate-300 text-slate-800 text-xs px-4 py-2 rounded uppercase font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-[#7F3700] text-white text-xs px-5 py-2 rounded uppercase font-bold"
                      >
                        Save Market
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* List Countries */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-bold text-slate-700 text-xs uppercase">Active Target Countries</h4>
                </div>
                <div className="divide-y divide-slate-150">
                  {publicData.countries.map(c => (
                    <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl select-none leading-none">{c.flag}</span>
                        <div>
                          <h5 className="font-bold font-display text-slate-800 text-sm">{c.name}</h5>
                          <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => { setEditingCountry(c); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="p-1.5 text-slate-500 hover:text-[#00639C]"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCountry(c.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: INQUIRIES LOG */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              
              {/* Filter controls row */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search buyer catalog..."
                      value={inquirySearch}
                      onChange={e => setInquirySearch(e.target.value)}
                      className="w-full text-xs border border-slate-200 pl-9 pr-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#003667]"
                    />
                  </div>
                  
                  <select 
                    value={inquiryCountryFilter}
                    onChange={e => setInquiryCountryFilter(e.target.value)}
                    className="w-full sm:w-44 text-xs border border-slate-200 bg-white p-2.5 rounded focus:outline-none"
                  >
                    <option value="all">All Countries</option>
                    {uniqueInquiryCountries.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button 
                    onClick={fetchInquiries}
                    className="p-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded"
                    title="Refresh List"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 cursor-pointer shadow-sm uppercase tracking-wide"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV Spreadsheet
                  </button>
                </div>
              </div>

              {/* Inquiry list detailed cards */}
              <div className="space-y-4">
                {isLoadingInquiries ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-white rounded border border-slate-200 space-y-2">
                    <RefreshCw className="w-8 h-8 text-[#003667] animate-spin" />
                    <span className="text-xs font-semibold text-slate-500">Retrieving secure buyer logs...</span>
                  </div>
                ) : filteredInquiries.length > 0 ? (
                  filteredInquiries.map(inq => (
                    <div key={inq.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:border-[#00639C]/40 transition-colors p-6 space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-base font-display">{inq.name}</h4>
                            <span className="text-xs bg-[#003667]/10 text-primary font-mono px-2 py-0.5 rounded font-bold">
                              {inq.company}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-medium">
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" />{inq.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" />{inq.country}</span>
                            <span>•</span>
                            <span>Phone: {inq.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                          <span className="bg-[#7F3700]/10 text-[#7F3700] border border-[#7F3700]/25 font-bold px-3 py-1 text-xs rounded uppercase tracking-wide">
                            Qty Requested: {inq.quantity}
                          </span>
                          <button 
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded border border-rose-200 hover:bg-rose-100 cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="bg-slate-50 border border-slate-100 rounded p-4 font-serif italic text-slate-700 text-sm leading-relaxed">
                        "{inq.message}"
                      </div>

                      {/* Footer time */}
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>Database Reference Key ID: {inq.id}</span>
                        <span>Form Submitted: {new Date(inq.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-500 space-y-2 italic text-sm">
                    No inquiries match search metrics.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: GLOBAL SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                
                <h3 className="font-display font-bold text-[#003667] text-md uppercase border-b border-slate-100 pb-2">Primary Trade Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">GLOBAL HOTLINE / TELEPHONE</label>
                    <input 
                      type="text" 
                      value={settingsForm.phone}
                      onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="+91 98907 61639" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">WHATSAPP DIRECT INQUIRY NUMBER</label>
                    <input 
                      type="text" 
                      value={settingsForm.whatsappNumber}
                      onChange={e => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      placeholder="+919890761639" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">Input digits only starting with country code. Used for floating widget.</span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">PUBLIC EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      value={settingsForm.email}
                      onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="export@powervegexim.com" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">HEADQUARTERS ADDRESS</label>
                    <input 
                      type="text" 
                      value={settingsForm.address}
                      onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="Lasalgaon Road, Pimpalgaon Baswant, Nashik, India" 
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                  </div>
                </div>

                <h3 className="font-display font-bold text-[#003667] text-md uppercase border-b border-slate-100 pb-2 pt-4">Homepage Hero Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">MAIN LANDING HERO BANNER TITLE</label>
                    <input 
                      type="text" 
                      value={settingsForm.bannerTitle}
                      onChange={e => setSettingsForm({ ...settingsForm, bannerTitle: e.target.value })}
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">HERO SUBTITLE PROPAGANDA</label>
                    <textarea 
                      rows={3}
                      value={settingsForm.bannerSubtitle}
                      onChange={e => setSettingsForm({ ...settingsForm, bannerSubtitle: e.target.value })}
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2 rounded"
                    />
                  </div>
                </div>

                <h3 className="font-display font-bold text-[#003667] text-md uppercase border-b border-slate-100 pb-2 pt-4">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">FACEBOOK URL</label>
                    <input 
                      type="text" 
                      value={settingsForm.facebookUrl || ""}
                      onChange={e => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/powerveg"
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">INSTAGRAM URL</label>
                    <input 
                      type="text" 
                      value={settingsForm.instagramUrl || ""}
                      onChange={e => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/powerveg"
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">LINKEDIN URL</label>
                    <input 
                      type="text" 
                      value={settingsForm.linkedinUrl || ""}
                      onChange={e => setSettingsForm({ ...settingsForm, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/company/powerveg"
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">TWITTER/X URL</label>
                    <input 
                      type="text" 
                      value={settingsForm.twitterUrl || ""}
                      onChange={e => setSettingsForm({ ...settingsForm, twitterUrl: e.target.value })}
                      placeholder="https://twitter.com/powerveg"
                      className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="bg-[#003667] text-white text-xs font-bold px-8 py-3 rounded hover:bg-[#00639C] uppercase tracking-wider shadow cursor-pointer"
                  >
                    Save Settings Changes
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
