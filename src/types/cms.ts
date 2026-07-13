export interface CmsHeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
  overlayColor: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsTestimonial {
  id: string;
  customerName: string;
  location: string | null;
  content: string;
  rating: number;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSiteContent {
  id: string;
  sectionKey: string;
  title: string | null;
  body: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CmsBrand {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSiteSetting {
  id: string;
  settingKey: string;
  settingValue: string | null;
  settingType: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
