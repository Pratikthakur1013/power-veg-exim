export interface Product {
  id: string;
  name: string;
  sizeRange: string;
  packaging: string;
  shelfLife: string;
  availability: string;
  imageUrl: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
}

export interface Inquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  quantity: string;
  message: string;
  createdAt: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
}

export interface CountryCard {
  id: string;
  name: string;
  flag: string;
  description: string;
}

export interface WebsiteSettings {
  logoUrl: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  bannerTitle: string;
  bannerSubtitle: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

export interface CompanyProfile {
  pdfUrl: string;
  fileName: string;
  updatedAt: string;
}

export interface PublicDataResponse {
  products: Product[];
  gallery: GalleryItem[];
  certifications: Certification[];
  countries: CountryCard[];
  company_profile: CompanyProfile;
  website_settings: WebsiteSettings;
}
