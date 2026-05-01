import { createClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      places: {
        Row: {
          id: number;
          external_id: string | null;
          name: string;
          area: string;
          category: string;
          address: string | null;
          lat: number;
          lng: number;
          manual_score: number;
          tags: string[];
          time_slots: string[];
          place_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: never;
          external_id?: string | null;
          name: string;
          area: string;
          category: string;
          address?: string | null;
          lat: number;
          lng: number;
          manual_score?: number;
          tags?: string[];
          time_slots?: string[];
          place_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: never;
          external_id?: string | null;
          name?: string;
          area?: string;
          category?: string;
          address?: string | null;
          lat?: number;
          lng?: number;
          manual_score?: number;
          tags?: string[];
          time_slots?: string[];
          place_url?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PlacesRow = Database["public"]["Tables"]["places"]["Row"];

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
