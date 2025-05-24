export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          subscription_tier: "free" | "pro" | "enterprise" | null;
          subscription_id: string | null;
          customer_id: string | null;
          plan_id: string | null;
          trial_started_at: string | null;
          trial_expires_at: string | null;
          subscription_renewed_at: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_status?:
            | "active"
            | "trialing"
            | "past_due"
            | "canceled"
            | "unpaid"
            | null;
          subscription_tier?: "free" | "pro" | "enterprise" | null;
          subscription_id?: string | null;
          customer_id?: string | null;
          plan_id?: string | null;
          trial_started_at?: string | null;
          trial_expires_at?: string | null;
          subscription_renewed_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_status?:
            | "active"
            | "trialing"
            | "past_due"
            | "canceled"
            | "unpaid"
            | null;
          subscription_tier?: "free" | "pro" | "enterprise" | null;
          subscription_id?: string | null;
          customer_id?: string | null;
          plan_id?: string | null;
          trial_started_at?: string | null;
          trial_expires_at?: string | null;
          subscription_renewed_at?: string | null;
        };
      };
      offers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          offer_url: string;
          landing_page_url: string;
          description: string | null;
          tags: string[];
          status: "waiting" | "testing" | "approved" | "invalid";
          metrics: Json[];
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          offer_url: string;
          landing_page_url: string;
          description?: string | null;
          tags?: string[];
          status?: "waiting" | "testing" | "approved" | "invalid";
          metrics?: Json[];
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          offer_url?: string;
          landing_page_url?: string;
          description?: string | null;
          tags?: string[];
          status?: "waiting" | "testing" | "approved" | "invalid";
          metrics?: Json[];
        };
      };
      anticlone_sites: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          original_url: string;
          original_host: string;
          action_type: "redirect"; // expandir conforme necessário
          action_data: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          original_url: string;
          original_host: string;
          action_type: "redirect";
          action_data: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          original_url?: string;
          original_host?: string;
          action_type?: "redirect";
          action_data?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          max_libraries: number;
          max_clones: number;
          max_anticlone: number;
          max_cloaker_requests: number | null;
          features: string[];
          checkout_url: string;
          max_quizzes: number | null;
          quiz_extra_price: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          max_libraries: number;
          max_clones: number;
          max_anticlone: number;
          max_cloaker_requests?: number | null;
          features?: string[];
          checkout_url?: string;
          max_quizzes?: number | null;
          quiz_extra_price?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          max_libraries?: number;
          max_clones?: number;
          max_anticlone?: number;
          max_cloaker_requests?: number | null;
          features?: string[];
          checkout_url?: string;
          max_quizzes?: number | null;
          quiz_extra_price?: number | null;
        };
      };
      cloned_quiz: {
        Row: {
          id: string;
          user_id: string;
          original_url: string;
          checkout_url: string;
          subdomain: string | null;
          url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_url: string;
          checkout_url: string;
          subdomain?: string | null;
          url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_url?: string;
          checkout_url?: string;
          subdomain?: string | null;
          url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
