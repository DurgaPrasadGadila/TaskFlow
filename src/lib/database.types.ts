export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          text: string
          completed: boolean
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          category: 'short-term' | 'long-term'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          completed?: boolean
          priority: 'low' | 'medium' | 'high'
          due_date?: string | null
          category: 'short-term' | 'long-term'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          category?: 'short-term' | 'long-term'
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          pinned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          pinned?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          pinned?: boolean
          created_at?: string
        }
      }
    }
  }
}