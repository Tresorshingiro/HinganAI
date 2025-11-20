import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (we'll expand these as we create tables)
export interface Profile {
  id: string
  user_id: string
  full_name: string
  location: string
  farm_size?: number
  phone?: string
  created_at: string
  updated_at: string
}

export interface CropRecommendation {
  id: string
  user_id: string
  nitrogen: number
  phosphorus: number
  potassium: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
  recommended_crop: string
  confidence: number
  created_at: string
}

export interface DiseaseDetection {
  id: string
  user_id: string
  image_url: string
  detected_disease: string
  confidence: number
  treatment_advice: string
  created_at: string
}

export interface FertilizerRecommendation {
  id: string
  user_id: string
  crop: string
  nitrogen: number
  phosphorus: number
  potassium: number
  recommended_fertilizer: string
  dosage: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  message: string
  response: string
  created_at: string
}