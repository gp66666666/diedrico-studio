export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          id: number
          name: string
          path: string | null
          props: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          path?: string | null
          props?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          path?: string | null
          props?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      class_code_uses: {
        Row: {
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_code_uses_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "class_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      class_codes: {
        Row: {
          code: string
          created_at: string
          credits_per_student: number
          expires_at: string
          max_uses: number
          order_ref: string | null
          owner_id: string
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          credits_per_student: number
          expires_at: string
          max_uses: number
          order_ref?: string | null
          owner_id: string
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          credits_per_student?: number
          expires_at?: string
          max_uses?: number
          order_ref?: string | null
          owner_id?: string
          uses?: number
        }
        Relationships: []
      }
      credit_movements: {
        Row: {
          balance_after: number
          created_at: string
          delta: number
          id: number
          reason: string
          ref: string | null
          user_id: string
        }
        Insert: {
          balance_after: number
          created_at?: string
          delta: number
          id?: number
          reason: string
          ref?: string | null
          user_id: string
        }
        Update: {
          balance_after?: number
          created_at?: string
          delta?: number
          id?: number
          reason?: string
          ref?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kofi_events: {
        Row: {
          amount: string | null
          created_at: string
          currency: string | null
          email: string | null
          event_type: string | null
          id: string
          matched_profile: string | null
          message_id: string | null
          months_added: number | null
          payload: Json | null
          status: string
          tier_name: string | null
          transaction_id: string | null
        }
        Insert: {
          amount?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          event_type?: string | null
          id?: string
          matched_profile?: string | null
          message_id?: string | null
          months_added?: number | null
          payload?: Json | null
          status?: string
          tier_name?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          event_type?: string | null
          id?: string
          matched_profile?: string | null
          message_id?: string | null
          months_added?: number | null
          payload?: Json | null
          status?: string
          tier_name?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kofi_events_matched_profile_fkey"
            columns: ["matched_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      laminas_docs: {
        Row: {
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          completed_exercises: string[]
          completed_topics: string[]
          created_at: string
          credits: number
          email: string | null
          full_name: string | null
          id: string
          is_premium: boolean | null
          premium_until: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          completed_exercises?: string[]
          completed_topics?: string[]
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          premium_until?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          completed_exercises?: string[]
          completed_topics?: string[]
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          premium_until?: string | null
          role?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          data: Json
          description: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_reason?: string
          p_ref?: string
          p_user: string
        }
        Returns: number
      }
      check_ai_rate_limit: {
        Args: { p_key: string; p_limit?: number; p_window_seconds?: number }
        Returns: number
      }
      credit_snapshot: {
        Args: { p_cost_per_credit?: number; p_price_per_credit?: number }
        Returns: {
          credits_balance: number
          credits_sold: number
          credits_spent: number
          gross_eur: number
          margin_eur: number
          reserve_eur: number
          users_with_credits: number
        }[]
      }
      redeem_class_code: { Args: { p_code: string }; Returns: Json }
      release_ai_quota: { Args: { p_key: string }; Returns: undefined }
      spend_credit: {
        Args: { p_reason?: string; p_ref?: string; p_user: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
