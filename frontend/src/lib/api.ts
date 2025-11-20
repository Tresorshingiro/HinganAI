import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CropRecommendationRequest {
  nitrogen: number
  phosphorus: number
  potassium: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
  user_id?: string
}

export interface CropRecommendationResponse {
  success: boolean
  recommended_crop: string
  confidence: number
  message: string
}

export interface DiseaseDetectionResponse {
  success: boolean
  disease: string
  confidence: number
  treatment_advice: string
}

export interface FertilizerRecommendationRequest {
  crop: string
  nitrogen: number
  phosphorus: number
  potassium: number
  user_id?: string
}

export interface FertilizerRecommendationResponse {
  success: boolean
  recommended_fertilizer: string
  nitrogen_needed: number
  phosphorus_needed: number
  potassium_needed: number
  advice: string
}

export interface WeatherResponse {
  success: boolean
  location: string
  temperature: number
  humidity: number
  description: string
  wind_speed: number
}

export interface UserHistoryResponse {
  success: boolean
  crop_recommendations: any[]
  disease_detections: any[]
  fertilizer_recommendations: any[]
}

// API functions
export const cropApi = {
  // Get crop recommendation
  getCropRecommendation: async (data: CropRecommendationRequest): Promise<CropRecommendationResponse> => {
    const response = await api.post('/api/crop-recommendation', data)
    return response.data
  },

  // Detect plant disease
  detectDisease: async (file: File, userId?: string): Promise<DiseaseDetectionResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    if (userId) {
      formData.append('user_id', userId)
    }

    const response = await api.post('/api/disease-detection', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get fertilizer recommendation
  getFertilizerRecommendation: async (data: FertilizerRecommendationRequest): Promise<FertilizerRecommendationResponse> => {
    const response = await api.post('/api/fertilizer-recommendation', data)
    return response.data
  },

  // Get weather data
  getWeather: async (location: string): Promise<WeatherResponse> => {
    const response = await api.get(`/api/weather/${location}`)
    return response.data
  },

  // Get user history
  getUserHistory: async (userId: string): Promise<UserHistoryResponse> => {
    const response = await api.get(`/api/user/history/${userId}`)
    return response.data
  },
}

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api