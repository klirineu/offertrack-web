export type OfferStatus = "waiting" | "testing" | "approved" | "invalid";

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
    plan: "free" | "pro" | "enterprise";
    status: "active" | "inactive";
    validUntil: Date;
  };
  settings: {
    theme: "light" | "dark";
    emailNotifications: boolean;
    language: string;
  };
}

export interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status:
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "unpaid"
    | null;
  subscription_id: string | null;
  subscription_plan_id: string | null;
  subscription_customer_id: string | null;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean | null;
  subscription_renewed_at: string | null;
  role: "user" | "admin";
}
