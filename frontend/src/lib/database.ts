import { supabase } from './supabase';
import type {
  UserProfile,
  CropRecommendation,
  CropRecommendationInput,
  FertilizerRecommendation,
  FertilizerRecommendationInput,
  YieldPrediction,
  YieldPredictionInput,
  DiseaseDetection,
  ChatMessage,
  WeatherData,
  DashboardStats,
  PaginatedResponse,
  ApiResponse,
} from '../types/database';

// User Profile Services
export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },

  async createProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<ApiResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },
};

// Crop Recommendation Services
export const cropService = {
  async getRecommendations(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<CropRecommendation>> {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('crop_recommendations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching crop recommendations: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    };
  },

  async createRecommendation(
    userId: string,
    input: CropRecommendationInput,
    result: { recommended_crop: string; confidence_score?: number; alternative_crops?: any[] }
  ): Promise<ApiResponse<CropRecommendation>> {
    const { data, error } = await supabase
      .from('crop_recommendations')
      .insert({
        user_id: userId,
        ...input,
        ...result,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },

  async getRecommendation(id: string): Promise<CropRecommendation | null> {
    const { data, error } = await supabase
      .from('crop_recommendations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching crop recommendation:', error);
      return null;
    }

    return data;
  },
};

// Fertilizer Recommendation Services
export const fertilizerService = {
  async getRecommendations(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<FertilizerRecommendation>> {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('fertilizer_recommendations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching fertilizer recommendations: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    };
  },

  async createRecommendation(
    userId: string,
    input: FertilizerRecommendationInput,
    result: { 
      recommended_fertilizer: string; 
      confidence_score?: number; 
      dosage_recommendation?: string;
      application_method?: string;
    }
  ): Promise<ApiResponse<FertilizerRecommendation>> {
    const { data, error } = await supabase
      .from('fertilizer_recommendations')
      .insert({
        user_id: userId,
        ...input,
        ...result,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },
};

// Yield Prediction Services
export const yieldService = {
  async getPredictions(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<YieldPrediction>> {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('yield_predictions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching yield predictions: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    };
  },

  async createPrediction(
    userId: string,
    input: YieldPredictionInput,
    result: {
      predicted_yield: number;
      confidence_score?: number;
      yield_category?: string;
      factors_analysis?: any[];
      improvement_suggestions?: string[];
    }
  ): Promise<ApiResponse<YieldPrediction>> {
    const { data, error } = await supabase
      .from('yield_predictions')
      .insert({
        user_id: userId,
        ...input,
        ...result,
        prediction_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },
};

// Disease Detection Services
export const diseaseService = {
  async getDetections(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<DiseaseDetection>> {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('disease_detections')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching disease detections: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    };
  },

  async uploadImage(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('disease-images')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Error uploading image: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('disease-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  async createDetection(
    userId: string,
    imageUrl: string,
    imageFilename: string,
    result: {
      detected_disease: string;
      confidence_score: number;
      affected_part?: string;
      severity_level?: string;
      treatment_advice?: string;
      recommended_products?: any[];
      prevention_tips?: string[];
    },
    metadata?: {
      crop_type?: string;
      location_coordinates?: [number, number];
      weather_conditions?: any;
      notes?: string;
    }
  ): Promise<ApiResponse<DiseaseDetection>> {
    const { data, error } = await supabase
      .from('disease_detections')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        image_filename: imageFilename,
        detection_date: new Date().toISOString(),
        ...result,
        ...metadata,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },
};

// Chat Services
export const chatService = {
  async getMessages(userId: string, sessionId?: string, page = 1, limit = 50): Promise<PaginatedResponse<ChatMessage>> {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching chat messages: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    };
  },

  async createMessage(
    userId: string,
    message: string,
    messageType: ChatMessage['message_type'] = 'general',
    contextData?: any,
    sessionId?: string
  ): Promise<ApiResponse<ChatMessage>> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message,
        message_type: messageType,
        context_data: contextData,
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },

  async updateMessageResponse(messageId: string, response: string): Promise<ApiResponse<ChatMessage>> {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ response })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },
};

// Weather Services
export const weatherService = {
  async getWeatherData(coordinates: [number, number], locationName?: string): Promise<WeatherData | null> {
    // First, try to get cached data that hasn't expired
    const { data: cachedData, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('location_coordinates', `(${coordinates[0]},${coordinates[1]})`)
      .gt('expires_at', new Date().toISOString())
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching cached weather data:', error);
    }

    if (cachedData) {
      return cachedData;
    }

    // If no cached data or expired, you would fetch from external API
    // For now, return null and handle external API calls in the backend
    return null;
  },

  async cacheWeatherData(weatherData: Omit<WeatherData, 'id' | 'fetched_at' | 'expires_at'>): Promise<ApiResponse<WeatherData>> {
    const { data, error } = await supabase
      .from('weather_data')
      .insert({
        ...weatherData,
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },
};

// Dashboard Services
export const dashboardService = {
  async getStats(userId: string): Promise<DashboardStats> {
    try {
      // Get counts for each category
      const [
        { count: cropCount },
        { count: fertilizerCount },
        { count: yieldCount },
        { count: diseaseCount },
        { count: chatCount },
      ] = await Promise.all([
        supabase.from('crop_recommendations').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('fertilizer_recommendations').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('yield_predictions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('disease_detections').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

      // Get recent activity (last 10 items across all tables)
      const [cropRecent, fertilizerRecent, yieldRecent, diseaseRecent, chatRecent] = await Promise.all([
        supabase.from('crop_recommendations').select('id, recommended_crop, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
        supabase.from('fertilizer_recommendations').select('id, recommended_fertilizer, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
        supabase.from('yield_predictions').select('id, crop_item, predicted_yield, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
        supabase.from('disease_detections').select('id, detected_disease, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
        supabase.from('chat_messages').select('id, message, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(2),
      ]);

      // Format recent activity
      const recent_activity = [
        ...(cropRecent.data || []).map(item => ({
          type: 'crop' as const,
          title: `Crop Recommendation: ${item.recommended_crop}`,
          description: 'AI recommended crop based on soil conditions',
          date: item.created_at,
          id: item.id,
        })),
        ...(fertilizerRecent.data || []).map(item => ({
          type: 'fertilizer' as const,
          title: `Fertilizer: ${item.recommended_fertilizer}`,
          description: 'AI recommended fertilizer for your crop',
          date: item.created_at,
          id: item.id,
        })),
        ...(yieldRecent.data || []).map(item => ({
          type: 'yield' as const,
          title: `Yield Prediction: ${item.crop_item}`,
          description: `Predicted yield: ${item.predicted_yield} hg/ha`,
          date: item.created_at,
          id: item.id,
        })),
        ...(diseaseRecent.data || []).map(item => ({
          type: 'disease' as const,
          title: `Disease Detection: ${item.detected_disease}`,
          description: 'AI detected disease from plant image',
          date: item.created_at,
          id: item.id,
        })),
        ...(chatRecent.data || []).map(item => ({
          type: 'chat' as const,
          title: 'AI Chat Conversation',
          description: item.message.substring(0, 50) + '...',
          date: item.created_at,
          id: item.id,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      return {
        total_recommendations: (cropCount || 0) + (fertilizerCount || 0),
        total_detections: diseaseCount || 0,
        total_predictions: yieldCount || 0,
        total_messages: chatCount || 0,
        recent_activity,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        total_recommendations: 0,
        total_detections: 0,
        total_predictions: 0,
        total_messages: 0,
        recent_activity: [],
      };
    }
  },
};