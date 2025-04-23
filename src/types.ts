export type OfferStatus = 'waiting' | 'testing' | 'approved' | 'invalid';

export interface AdMetrics {
  date: string;
  activeAds: number;
  spend?: number;
  impressions?: number;
}

export interface Offer {
  id: string;
  title: string;
  offerUrl: string;
  landingPageUrl: string;
  description?: string;
  tags: string[];
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
  metrics: AdMetrics[];
}

export interface Column {
  id: OfferStatus;
  title: string;
  color: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive';
    validUntil: Date;
  };
  settings: {
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    language: string;
  };
}

export interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}