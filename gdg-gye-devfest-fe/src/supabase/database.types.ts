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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attendances: {
        Row: {
          checked_in_at: string
          checked_in_by: string | null
          event_id: number
          method: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          checked_in_by?: string | null
          event_id: number
          method: string
          user_id: string
        }
        Update: {
          checked_in_at?: string
          checked_in_by?: string | null
          event_id?: number
          method?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          code: string
          event_id: number
          id: string
          issued_at: string
          kind: string
          user_id: string
        }
        Insert: {
          code?: string
          event_id: number
          id?: string
          issued_at?: string
          kind?: string
          user_id: string
        }
        Update: {
          code?: string
          event_id?: number
          id?: string
          issued_at?: string
          kind?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          created_at: string
          granted: boolean
          id: number
          policy_version: string
          purpose: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          granted: boolean
          id?: never
          policy_version: string
          purpose: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          id?: never
          policy_version?: string
          purpose?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_purpose_fkey"
            columns: ["purpose"]
            isOneToOne: false
            referencedRelation: "purposes"
            referencedColumns: ["key"]
          },
        ]
      }
      events: {
        Row: {
          certificates_open: boolean
          created_at: string
          date: string
          id: number
          name: string
          slug: string
        }
        Insert: {
          certificates_open?: boolean
          created_at?: string
          date: string
          id?: never
          name: string
          slug: string
        }
        Update: {
          certificates_open?: boolean
          created_at?: string
          date?: string
          id?: never
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_confirmed_at: string
          checkin_code: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          last_seen_at: string
          updated_at: string
        }
        Insert: {
          age_confirmed_at: string
          checkin_code?: string
          created_at?: string
          first_name: string
          id: string
          last_name: string
          last_seen_at?: string
          updated_at?: string
        }
        Update: {
          age_confirmed_at?: string
          checkin_code?: string
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          last_seen_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      purposes: {
        Row: {
          active: boolean
          created_at: string
          key: string
          required: boolean
        }
        Insert: {
          active?: boolean
          created_at?: string
          key: string
          required?: boolean
        }
        Update: {
          active?: boolean
          created_at?: string
          key?: string
          required?: boolean
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      current_consents: {
        Row: {
          created_at: string | null
          granted: boolean | null
          policy_version: string | null
          purpose: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_purpose_fkey"
            columns: ["purpose"]
            isOneToOne: false
            referencedRelation: "purposes"
            referencedColumns: ["key"]
          },
        ]
      }
    }
    Functions: {
      check_in: { Args: { p_code: string; p_event: string }; Returns: Json }
      check_in_by_email: {
        Args: { p_email: string; p_event: string }
        Returns: Json
      }
      delete_my_account: { Args: never; Returns: undefined }
      export_my_data: { Args: never; Returns: Json }
      import_attendance: {
        Args: { p_emails: string[]; p_event: string }
        Returns: Json
      }
      register: {
        Args: {
          p_age_confirmed: boolean
          p_consents: Json
          p_first_name: string
          p_last_name: string
          p_policy_version: string
          p_user_agent?: string
        }
        Returns: {
          age_confirmed_at: string
          checkin_code: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          last_seen_at: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_consent: {
        Args: {
          p_granted: boolean
          p_policy_version: string
          p_purpose: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      touch_last_seen: { Args: never; Returns: undefined }
      verify_certificate: { Args: { p_code: string }; Returns: Json }
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
