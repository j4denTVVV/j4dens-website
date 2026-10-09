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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_entries: {
        Row: {
          avg_viewers: number | null
          comments: number
          created_at: string
          followers_end: number | null
          followers_gained: number
          followers_start: number | null
          id: string
          likes: number
          period: string
          period_end: string | null
          period_start: string
          platform: string
          posts: number
          shares: number
          subs_gained: number | null
          updated_at: string
          user_id: string
          views: number
          watch_time: number | null
        }
        Insert: {
          avg_viewers?: number | null
          comments?: number
          created_at?: string
          followers_end?: number | null
          followers_gained?: number
          followers_start?: number | null
          id?: string
          likes?: number
          period?: string
          period_end?: string | null
          period_start: string
          platform: string
          posts?: number
          shares?: number
          subs_gained?: number | null
          updated_at?: string
          user_id: string
          views?: number
          watch_time?: number | null
        }
        Update: {
          avg_viewers?: number | null
          comments?: number
          created_at?: string
          followers_end?: number | null
          followers_gained?: number
          followers_start?: number | null
          id?: string
          likes?: number
          period?: string
          period_end?: string | null
          period_start?: string
          platform?: string
          posts?: number
          shares?: number
          subs_gained?: number | null
          updated_at?: string
          user_id?: string
          views?: number
          watch_time?: number | null
        }
        Relationships: []
      }
      collabs: {
        Row: {
          activity: string | null
          collab_date: string | null
          collab_time: string | null
          collab_type: string | null
          created_at: string
          creator_id: string | null
          duration: string | null
          id: string
          notes: string | null
          opportunities: string | null
          plan: string | null
          platform: string | null
          platforms: string[]
          segments: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity?: string | null
          collab_date?: string | null
          collab_time?: string | null
          collab_type?: string | null
          created_at?: string
          creator_id?: string | null
          duration?: string | null
          id?: string
          notes?: string | null
          opportunities?: string | null
          plan?: string | null
          platform?: string | null
          platforms?: string[]
          segments?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          activity?: string | null
          collab_date?: string | null
          collab_time?: string | null
          collab_type?: string | null
          created_at?: string
          creator_id?: string | null
          duration?: string | null
          id?: string
          notes?: string | null
          opportunities?: string | null
          plan?: string | null
          platform?: string | null
          platforms?: string[]
          segments?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collabs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          notes: string | null
          profiles: Json
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          notes?: string | null
          profiles?: Json
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          notes?: string | null
          profiles?: Json
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          current_value: number
          deadline: string | null
          id: string
          name: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          created_at?: string
          current_value?: number
          deadline?: string | null
          id?: string
          name: string
          target_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          current_value?: number
          deadline?: string | null
          id?: string
          name?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hub_items: {
        Row: {
          checklist: Json
          created_at: string
          details: Json
          end_date: string | null
          goal: string | null
          id: string
          kind: string
          location: string | null
          notes: string | null
          partner: string | null
          platform: string | null
          platforms: string[]
          start_date: string | null
          start_time: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist?: Json
          created_at?: string
          details?: Json
          end_date?: string | null
          goal?: string | null
          id?: string
          kind: string
          location?: string | null
          notes?: string | null
          partner?: string | null
          platform?: string | null
          platforms?: string[]
          start_date?: string | null
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          checklist?: Json
          created_at?: string
          details?: Json
          end_date?: string | null
          goal?: string | null
          id?: string
          kind?: string
          location?: string | null
          notes?: string | null
          partner?: string | null
          platform?: string | null
          platforms?: string[]
          start_date?: string | null
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          priority: string
          status: string
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[]
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          appearance: Json
          avatar_url: string | null
          bio: string | null
          created_at: string
          creator_name: string
          default_platform: string
          greeting_name: string
          preferences: Json
          socials: Json
          target_followers: number
          target_shorts: number
          target_streams: number
          target_videos: number
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appearance?: Json
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          creator_name?: string
          default_platform?: string
          greeting_name?: string
          preferences?: Json
          socials?: Json
          target_followers?: number
          target_shorts?: number
          target_streams?: number
          target_videos?: number
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appearance?: Json
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          creator_name?: string
          default_platform?: string
          greeting_name?: string
          preferences?: Json
          socials?: Json
          target_followers?: number
          target_shorts?: number
          target_streams?: number
          target_videos?: number
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      setup_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          price: number | null
          section: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          price?: number | null
          section?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          price?: number | null
          section?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stream_checklists: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          label: string
          position: number
          stream_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          label: string
          position?: number
          stream_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          label?: string
          position?: number
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_checklists_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_segments: {
        Row: {
          created_at: string
          id: string
          length_mins: number | null
          name: string
          notes: string | null
          position: number
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          length_mins?: number | null
          name: string
          notes?: string | null
          position?: number
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          length_mins?: number | null
          name?: string
          notes?: string | null
          position?: number
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_segments_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          category: string
          created_at: string
          details: Json
          id: string
          main_idea: string | null
          notes: string | null
          platform: string
          platforms: string[]
          status: string
          stream_date: string | null
          stream_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          details?: Json
          id?: string
          main_idea?: string | null
          notes?: string | null
          platform?: string
          platforms?: string[]
          status?: string
          stream_date?: string | null
          stream_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: Json
          id?: string
          main_idea?: string | null
          notes?: string | null
          platform?: string
          platforms?: string[]
          status?: string
          stream_date?: string | null
          stream_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_checklists: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          label: string
          position: number
          user_id: string
          video_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          label: string
          position?: number
          user_id: string
          video_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          label?: string
          position?: number
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_checklists_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_sections: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          name: string
          notes: string | null
          position: number
          user_id: string
          video_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          position?: number
          user_id: string
          video_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          position?: number
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_sections_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_videos: {
        Row: {
          actual_record_date: string | null
          actual_upload_date: string | null
          category: string
          comments: number | null
          concept: string | null
          created_at: string
          final_title: string | null
          hook: string | null
          id: string
          likes: number | null
          notes: string | null
          planned_record_date: string | null
          planned_upload_date: string | null
          priority: string
          status: string
          subs_gained: number | null
          thumbnail_done: boolean
          thumbnail_idea: string | null
          updated_at: string
          user_id: string
          views_24h: number | null
          views_30d: number | null
          views_7d: number | null
          working_title: string
        }
        Insert: {
          actual_record_date?: string | null
          actual_upload_date?: string | null
          category?: string
          comments?: number | null
          concept?: string | null
          created_at?: string
          final_title?: string | null
          hook?: string | null
          id?: string
          likes?: number | null
          notes?: string | null
          planned_record_date?: string | null
          planned_upload_date?: string | null
          priority?: string
          status?: string
          subs_gained?: number | null
          thumbnail_done?: boolean
          thumbnail_idea?: string | null
          updated_at?: string
          user_id: string
          views_24h?: number | null
          views_30d?: number | null
          views_7d?: number | null
          working_title: string
        }
        Update: {
          actual_record_date?: string | null
          actual_upload_date?: string | null
          category?: string
          comments?: number | null
          concept?: string | null
          created_at?: string
          final_title?: string | null
          hook?: string | null
          id?: string
          likes?: number | null
          notes?: string | null
          planned_record_date?: string | null
          planned_upload_date?: string | null
          priority?: string
          status?: string
          subs_gained?: number | null
          thumbnail_done?: boolean
          thumbnail_idea?: string | null
          updated_at?: string
          user_id?: string
          views_24h?: number | null
          views_30d?: number | null
          views_7d?: number | null
          working_title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
