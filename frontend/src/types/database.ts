// Database types for HinganAI platform
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  farm_location?: string;
  farm_size?: number;
  primary_crops?: string[];
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CropRecommendationInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph_level: number;
  rainfall: number;
  location_coordinates?: [number, number]; // [longitude, latitude]
  season?: string;
  notes?: string;
}

export interface CropRecommendation {
  id: string;
  user_id: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph_level: number;
  rainfall: number;
  recommended_crop: string;
  confidence_score?: number;
  alternative_crops?: {
    crop: string;
    confidence: number;
  }[];
  location_coordinates?: [number, number];
  season?: string;
  notes?: string;
  created_at: string;
}

export interface FertilizerRecommendationInput {
  temperature: number;
  humidity: number;
  moisture: number;
  soil_type: 'Sandy' | 'Loamy' | 'Black' | 'Red' | 'Clayey';
  crop_type: string;
  nitrogen: number;
  potassium: number;
  phosphorous: number;
  farm_area?: number;
  notes?: string;
}

export interface FertilizerRecommendation {
  id: string;
  user_id: string;
  temperature: number;
  humidity: number;
  moisture: number;
  soil_type: 'Sandy' | 'Loamy' | 'Black' | 'Red' | 'Clayey';
  crop_type: string;
  nitrogen: number;
  potassium: number;
  phosphorous: number;
  recommended_fertilizer: string;
  confidence_score?: number;
  dosage_recommendation?: string;
  application_method?: string;
  farm_area?: number;
  notes?: string;
  created_at: string;
}

export interface YieldPredictionInput {
  area: string; // Country/region
  crop_item: string;
  year: number;
  average_rainfall: number;
  pesticides_usage?: number;
  average_temperature: number;
  notes?: string;
}

export interface YieldPrediction {
  id: string;
  user_id: string;
  area: string;
  crop_item: string;
  year: number;
  average_rainfall: number;
  pesticides_usage?: number;
  average_temperature: number;
  predicted_yield: number; // in hg/ha
  confidence_score?: number;
  yield_category?: 'Low' | 'Medium' | 'High';
  factors_analysis?: {
    factor: string;
    impact: string;
    percentage: number;
  }[];
  improvement_suggestions?: string[];
  prediction_date: string;
  notes?: string;
  created_at: string;
}

export interface DiseaseDetectionInput {
  image_file: File;
  crop_type?: string;
  location_coordinates?: [number, number];
  weather_conditions?: {
    temperature: number;
    humidity: number;
  };
  notes?: string;
}

export interface DiseaseDetection {
  id: string;
  user_id: string;
  image_url: string;
  image_filename?: string;
  detected_disease: string;
  confidence_score: number;
  affected_part?: string;
  severity_level?: 'Low' | 'Medium' | 'High' | 'Critical';
  treatment_advice?: string;
  recommended_products?: {
    name: string;
    type: string;
    application: string;
  }[];
  prevention_tips?: string[];
  crop_type?: string;
  location_coordinates?: [number, number];
  weather_conditions?: {
    temperature: number;
    humidity: number;
  };
  detection_date: string;
  notes?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response?: string;
  message_type: 'general' | 'crop_advice' | 'weather' | 'disease_help' | 'fertilizer_help';
  context_data?: {
    crop_type?: string;
    location?: string;
    season?: string;
    [key: string]: any;
  };
  session_id?: string;
  created_at: string;
}

export interface WeatherData {
  id: string;
  location_coordinates: [number, number];
  location_name?: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  wind_speed?: number;
  rainfall?: number;
  weather_description?: string;
  forecast_data?: {
    date: string;
    temperature_max: number;
    temperature_min: number;
    humidity: number;
    rainfall: number;
    weather_description: string;
  }[];
  data_source: string;
  fetched_at: string;
  expires_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  loading: boolean;
  errors: ValidationError[];
}

// Dashboard summary types
export interface DashboardStats {
  total_recommendations: number;
  total_detections: number;
  total_predictions: number;
  total_messages: number;
  recent_activity: {
    type: 'crop' | 'fertilizer' | 'yield' | 'disease' | 'chat';
    title: string;
    description: string;
    date: string;
    id: string;
  }[];
}

// Export all types for easier importing
export type {
  UserProfile,
  CropRecommendation,
  CropRecommendationInput,
  FertilizerRecommendation,
  FertilizerRecommendationInput,
  YieldPrediction,
  YieldPredictionInput,
  DiseaseDetection,
  DiseaseDetectionInput,
  ChatMessage,
  WeatherData,
  ApiResponse,
  PaginatedResponse,
  ValidationError,
  FormState,
  DashboardStats,
};