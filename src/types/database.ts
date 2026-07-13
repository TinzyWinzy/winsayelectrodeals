interface SolarFinderLeadRow {
  id: string;
  lead_id: string | null;
  timestamp: string;
  full_name: string;
  whatsapp_number: string;
  email: string;
  city: string;
  suburb: string;
  appliances: string;
  property_type: string | null;
  backup_duration: string | null;
  usage_pattern: string | null;
  budget: string | null;
  installation_timeline: string;
  recommended_package_id: string;
  recommended_package_name: string;
  upgrade_package_id: string | null;
  upgrade_package_name: string | null;
  estimated_continuous_load: number;
  estimated_surge_load: number;
  expert_review_required: boolean;
  lead_source: string;
  status: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamMemberRow {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: "SUPER_ADMIN" | "MANAGER" | "SALES_AGENT" | "MARKETING" | "TECHNICIAN" | "VIEWER";
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface LeadRow {
  id: string;
  customer_id: string | null;
  full_name: string;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  city: string | null;
  suburb: string | null;
  source: string;
  campaign: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  landing_page: string | null;
  selected_appliances: unknown[];
  property_type: string | null;
  backup_duration: string | null;
  usage_pattern: string | null;
  budget: string | null;
  recommended_package_id: string | null;
  recommended_package_name: string | null;
  alternative_package_id: string | null;
  alternative_package_name: string | null;
  estimated_continuous_load: number;
  estimated_surge_load: number;
  confidence_score: number | null;
  expert_review_required: boolean;
  assigned_to: string | null;
  pipeline_status: string;
  lead_score: number;
  lead_temperature: "hot" | "warm" | "cold";
  installation_urgency: string | null;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  lost_reason: string | null;
  notes: string | null;
  duplicate_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      packages: {
        Row: {
          id: string;
          name: string;
          kva_rating: number;
          panel_count: number;
          battery_spec: string;
          inverter_brand: string;
          base_price_usd: number;
          zig_price: number | null;
          free_gift: string | null;
          tv_bundle_eligible: boolean;
          pay_after_install_eligible: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
          badge: string | null;
          specs: string[] | null;
          brands: string | null;
          wifi_enabled: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["packages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          province: string | null;
          city: string | null;
          suburb: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      quotes: {
        Row: {
          id: string;
          customer_id: string;
          package_id: string;
          roof_type: string | null;
          location: string | null;
          meter_photo_url: string | null;
          total_usd: number;
          total_zig: number | null;
          deposit_usd: number;
          deposit_zig: number | null;
          payment_method: string | null;
          status: string;
          quote_id: string;
          pay_after_install: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quotes"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          quote_id: string;
          amount_usd: number;
          amount_zig: number | null;
          method: string;
          transaction_ref: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      install_schedules: {
        Row: {
          id: string;
          quote_id: string;
          install_date: string | null;
          installer_name: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["install_schedules"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["install_schedules"]["Insert"]>;
      };
      team_members: {
        Row: TeamMemberRow;
        Insert: Omit<TeamMemberRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TeamMemberRow, "id" | "created_at" | "updated_at">>;
      };
      leads: {
        Row: LeadRow;
        Insert: Partial<Omit<LeadRow, "id" | "created_at" | "updated_at">> & Pick<LeadRow, "full_name">;
        Update: Partial<Omit<LeadRow, "id" | "created_at" | "updated_at">>;
      };
      solar_finder_leads: {
        Row: SolarFinderLeadRow;
        Insert: Partial<Omit<SolarFinderLeadRow, "created_at" | "updated_at">> & Pick<SolarFinderLeadRow, "id" | "full_name" | "whatsapp_number" | "recommended_package_id" | "recommended_package_name">;
        Update: Partial<Omit<SolarFinderLeadRow, "id" | "created_at" | "updated_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
