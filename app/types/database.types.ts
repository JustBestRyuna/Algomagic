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
      difficulties: {
        Row: {
          id: string
          name: string
          short_description: string
          long_description: string
          color_bg: string
          color_bg_light: string
          color_hover: string
          color_text: string
          color_border: string
          color_accent: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          short_description: string
          long_description: string
          color_bg: string
          color_bg_light: string
          color_hover: string
          color_text: string
          color_border: string
          color_accent: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_description?: string
          long_description?: string
          color_bg?: string
          color_bg_light?: string
          color_hover?: string
          color_text?: string
          color_border?: string
          color_accent?: string
          created_at?: string
          updated_at?: string
        }
      }
      icons: {
        Row: {
          id: string
          name: string
          svg_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          svg_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          svg_path?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          title: string
          description: string
          difficulty_id: string
          icon_id: string
          order_num: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          description: string
          difficulty_id: string
          icon_id: string
          order_num: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          difficulty_id?: string
          icon_id?: string
          order_num?: number
          created_at?: string
          updated_at?: string
        }
      }
      problems: {
        Row: {
          id: string
          category_id: string
          difficulty_id: string
          title: string
          description: string
          order_num: number
          content: string
          solution_idea: string
          python_code: string | null
          cpp_code: string | null
          notes: string | null
          is_required: boolean
          module_order: number | null
          module_description: string | null
          oj_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          category_id: string
          difficulty_id: string
          title: string
          description: string
          order_num: number
          content: string
          solution_idea: string
          python_code?: string | null
          cpp_code?: string | null
          notes?: string | null
          is_required?: boolean
          module_order?: number | null
          module_description?: string | null
          oj_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          difficulty_id?: string
          title?: string
          description?: string
          order_num?: number
          content?: string
          solution_idea?: string
          python_code?: string | null
          cpp_code?: string | null
          notes?: string | null
          is_required?: boolean
          module_order?: number | null
          module_description?: string | null
          oj_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      examples: {
        Row: {
          id: number
          problem_id: string
          category_id: string
          difficulty_id: string
          input_example: string
          output_example: string
          explanation: string | null
          order_num: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          problem_id: string
          category_id: string
          difficulty_id: string
          input_example: string
          output_example: string
          explanation?: string | null
          order_num: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          problem_id?: string
          category_id?: string
          difficulty_id?: string
          input_example?: string
          output_example?: string
          explanation?: string | null
          order_num?: number
          created_at?: string
          updated_at?: string
        }
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