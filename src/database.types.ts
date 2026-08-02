export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15'
  }
  public: {
    Tables: {
      checkup_notes: {
        Row: {
          body: string
          child_id: string
          created_at: string
          created_by: string
          id: string
          is_done: boolean
          updated_at: string
        }
        Insert: {
          body: string
          child_id: string
          created_at?: string
          created_by: string
          id?: string
          is_done?: boolean
          updated_at?: string
        }
        Update: {
          body?: string
          child_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_done?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'checkup_notes_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          },
        ]
      }
      child_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          child_id: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          child_id: string
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          child_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: 'child_invites_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          },
        ]
      }
      child_members: {
        Row: {
          child_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'child_members_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          },
        ]
      }
      children: {
        Row: {
          birth_date: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_records: {
        Row: {
          bedtime: string | null
          body_contact: string | null
          calm: string | null
          child_id: string
          created_at: string
          dose: string
          duration_hours: string | null
          effect_minutes: string | null
          eye_contact: string | null
          focus: string | null
          id: string
          impulse: string | null
          meals: Json
          medicine_taken: boolean | null
          medicine_time: string | null
          meltdowns: number
          moods: string[]
          notes: string
          record_date: string
          sensory: string[]
          side_effects: string[]
          sleep_quality: string | null
          social_distance: string | null
          updated_at: string
          updated_by: string | null
          wake_time: string | null
          water: number
        }
        Insert: {
          bedtime?: string | null
          body_contact?: string | null
          calm?: string | null
          child_id: string
          created_at?: string
          dose?: string
          duration_hours?: string | null
          effect_minutes?: string | null
          eye_contact?: string | null
          focus?: string | null
          id?: string
          impulse?: string | null
          meals?: Json
          medicine_taken?: boolean | null
          medicine_time?: string | null
          meltdowns?: number
          moods?: string[]
          notes?: string
          record_date: string
          sensory?: string[]
          side_effects?: string[]
          sleep_quality?: string | null
          social_distance?: string | null
          updated_at?: string
          updated_by?: string | null
          wake_time?: string | null
          water?: number
        }
        Update: {
          bedtime?: string | null
          body_contact?: string | null
          calm?: string | null
          child_id?: string
          created_at?: string
          dose?: string
          duration_hours?: string | null
          effect_minutes?: string | null
          eye_contact?: string | null
          focus?: string | null
          id?: string
          impulse?: string | null
          meals?: Json
          medicine_taken?: boolean | null
          medicine_time?: string | null
          meltdowns?: number
          moods?: string[]
          notes?: string
          record_date?: string
          sensory?: string[]
          side_effects?: string[]
          sleep_quality?: string | null
          social_distance?: string | null
          updated_at?: string
          updated_by?: string | null
          wake_time?: string | null
          water?: number
        }
        Relationships: [
          {
            foreignKeyName: 'daily_records_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_child_invite: {
        Args: { p_token: string }
        Returns: string
      }
      create_child_invite: {
        Args: { p_child_id: string }
        Returns: string
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
