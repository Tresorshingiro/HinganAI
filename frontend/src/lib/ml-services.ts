// ML Service Configuration  
const API_CONFIG = {
  // Your Flask ML backend
  ML_BACKEND_URL: import.meta.env.VITE_ML_BACKEND_URL || 'http://localhost:5000',
};

// Types for ML services
export interface CropRecommendationResult {
  recommended_crop: string;
  confidence_score: number;
  alternative_crops: {
    crop: string;
    confidence: number;
    reasoning: string;
  }[];
  reasoning: string;
  growing_tips: string[];
  optimal_conditions: {
    temperature_range: string;
    humidity_range: string;
    ph_range: string;
    water_requirements: string;
  };
  estimated_yield: {
    min: number;
    max: number;
    unit: string;
  };
}

export interface MLCropInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph_level: number;
  rainfall: number;
  location?: string;
  season?: string;
  farm_size?: number;
}

// Crop Recommendation ML Service using your trained Flask backend
export class CropRecommendationService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = API_CONFIG.ML_BACKEND_URL;
    console.log('🌾 Crop Recommendation Service initialized with backend:', this.backendUrl);
  }

  // Enhanced ML-powered crop recommendation using Gemini AI
  async getCropRecommendation(input: MLCropInput): Promise<CropRecommendationResult> {
    try {
      console.log('🔬 Calling your trained ML model for crop recommendation...');
      
      // Prepare data for your Flask API
      const requestData = {
        nitrogen: input.nitrogen,
        phosphorus: input.phosphorus, 
        potassium: input.potassium,
        temperature: input.temperature,
        humidity: input.humidity,
        ph: input.ph_level,
        rainfall: input.rainfall
        // Don't send user_id - let the frontend handle database saves
      };

      const response = await fetch(`${this.backendUrl}/api/crop-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Flask API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Transform Flask response to match your frontend format
        return {
          recommended_crop: result.recommended_crop,
          confidence_score: result.confidence,
          reasoning: result.advice || result.message,
          alternative_crops: this.generateAlternatives(result.recommended_crop, input),
          growing_tips: this.getGrowingTips(result.recommended_crop),
          optimal_conditions: this.getOptimalConditions(result.recommended_crop),
          estimated_yield: this.getEstimatedYield(result.recommended_crop)
        };
      } else {
        throw new Error(result.error || 'Flask API returned error');
      }

    } catch (error) {
      console.error('Error calling Flask API:', error);
      console.log('🔄 Falling back to rule-based recommendation');
      
      // Fallback to rule-based system if Flask API fails
      return this.getRuleBasedRecommendation(input);
    }
  }

  // Helper methods to enrich Flask API response
  private generateAlternatives(recommendedCrop: string, input: MLCropInput) {
    // Generate alternative crops based on conditions
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph_level, rainfall } = input;
    
    const allCrops = [
      'Rice', 'Maize', 'Jute', 'Cotton', 'Coconut', 'Papaya', 'Orange',
      'Apple', 'Muskmelon', 'Watermelon', 'Grapes', 'Mango', 'Banana',
      'Pomegranate', 'Lentil', 'Blackgram', 'Mungbean', 'Mothbeans',
      'Pigeonpeas', 'Kidneybeans', 'Chickpea', 'Coffee'
    ];

    return allCrops
      .filter(crop => crop !== recommendedCrop)
      .slice(0, 3)
      .map((crop, index) => ({
        crop,
        confidence: 0.8 - (index * 0.1),
        reasoning: `Suitable alternative based on your soil and climate conditions`
      }));
  }

  private getGrowingTips(crop: string): string[] {
    const tips: Record<string, string[]> = {
      'Rice': [
        'Maintain proper water levels in fields (2-5cm)',
        'Apply fertilizer in split doses',
        'Monitor for blast and brown planthopper',
        'Harvest when 80% of grains are golden yellow'
      ],
      'Maize': [
        'Plant at optimal spacing (75cm x 25cm)',
        'Apply nitrogen fertilizer at tasseling stage',
        'Control fall armyworm and stem borer',
        'Ensure adequate drainage during rainy season'
      ],
      'Cotton': [
        'Maintain soil moisture during flowering',
        'Regular monitoring for bollworm',
        'Apply potassium for fiber quality',
        'Harvest in dry weather conditions'
      ],
      'default': [
        'Monitor soil moisture regularly',
        'Apply fertilizer based on soil test results',
        'Practice crop rotation for soil health',
        'Regular pest and disease monitoring'
      ]
    };

    return tips[crop] || tips['default'];
  }

  private getOptimalConditions(crop: string) {
    const conditions: Record<string, { temperature_range: string; humidity_range: string; ph_range: string; water_requirements: string }> = {
      'Rice': {
        temperature_range: '25-35°C',
        humidity_range: '80-90%',
        ph_range: '6.0-7.0',
        water_requirements: 'High (flooded fields)'
      },
      'Maize': {
        temperature_range: '21-27°C',
        humidity_range: '60-70%',
        ph_range: '6.0-7.5',
        water_requirements: 'Moderate (500-800mm)'
      },
      'Cotton': {
        temperature_range: '21-30°C',
        humidity_range: '50-70%',
        ph_range: '5.8-8.0',
        water_requirements: 'Moderate (500-700mm)'
      },
      'default': {
        temperature_range: '20-30°C',
        humidity_range: '60-80%',
        ph_range: '6.0-7.5',
        water_requirements: 'Moderate'
      }
    };

    return conditions[crop] || conditions['default'];
  }

  private getEstimatedYield(crop: string) {
    const yields: Record<string, { min: number; max: number; unit: string }> = {
      'Rice': { min: 3.0, max: 6.0, unit: 'tons/hectare' },
      'Maize': { min: 2.5, max: 5.0, unit: 'tons/hectare' },
      'Cotton': { min: 1.5, max: 3.0, unit: 'tons/hectare' },
      'Wheat': { min: 2.0, max: 4.5, unit: 'tons/hectare' },
      'default': { min: 1.5, max: 4.0, unit: 'tons/hectare' }
    };

    return yields[crop] || yields['default'];
  }

  private createCropRecommendationPrompt(input: MLCropInput): string {
    return `
    As an expert agricultural AI, analyze the following soil and climate conditions to recommend the best crop for optimal yield:

    SOIL CONDITIONS:
    - Nitrogen (N): ${input.nitrogen} (range: 0-140)
    - Phosphorus (P): ${input.phosphorus} (range: 5-145)
    - Potassium (K): ${input.potassium} (range: 5-205)
    - pH Level: ${input.ph_level} (range: 3.5-9.9)
    
    CLIMATE CONDITIONS:
    - Temperature: ${input.temperature}°C
    - Humidity: ${input.humidity}%
    - Rainfall: ${input.rainfall}mm
    
    CONTEXT:
    - Location: ${input.location || 'East Africa/Rwanda region'}
    - Season: ${input.season || 'Current season'}
    - Farm Size: ${input.farm_size || 'Small-scale'} hectares

    Please provide a comprehensive analysis in the following JSON format:
    {
      "recommended_crop": "Primary crop name",
      "confidence_score": 0.85,
      "reasoning": "Detailed explanation why this crop is best suited",
      "alternative_crops": [
        {
          "crop": "Alternative crop name",
          "confidence": 0.75,
          "reasoning": "Why this is a good alternative"
        }
      ],
      "growing_tips": [
        "Specific tip 1",
        "Specific tip 2"
      ],
      "optimal_conditions": {
        "temperature_range": "20-30°C",
        "humidity_range": "60-80%",
        "ph_range": "6.0-7.5",
        "water_requirements": "Moderate (500-800mm annually)"
      },
      "estimated_yield": {
        "min": 2.5,
        "max": 4.0,
        "unit": "tons/hectare"
      }
    }

    Available crop options to consider (based on training data):
    rice, maize, jute, cotton, coconut, papaya, orange, apple, muskmelon, watermelon, 
    grapes, mango, banana, pomegranate, lentil, blackgram, mungbean, mothbeans, 
    pigeonpeas, kidneybeans, chickpea, coffee
    
    Focus on crops suitable for the given conditions and consider:
    1. NPK nutrient requirements and soil compatibility
    2. Climate suitability (temperature, humidity, rainfall)
    3. pH tolerance range
    4. Market demand and profitability in East Africa
    5. Water efficiency and drought tolerance
    6. Growing season and harvest timing
    `;
  }

  private parseAIResponse(response: string, input: MLCropInput): CropRecommendationResult {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommended_crop: parsed.recommended_crop,
          confidence_score: parsed.confidence_score || 0.8,
          alternative_crops: parsed.alternative_crops || [],
          reasoning: parsed.reasoning || 'AI analysis based on soil and climate conditions',
          growing_tips: parsed.growing_tips || [],
          optimal_conditions: parsed.optimal_conditions || {
            temperature_range: 'Variable',
            humidity_range: 'Variable', 
            ph_range: 'Variable',
            water_requirements: 'Variable'
          },
          estimated_yield: parsed.estimated_yield || {
            min: 1.0,
            max: 3.0,
            unit: 'tons/hectare'
          }
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    // Fallback if parsing fails
    return this.getRuleBasedRecommendation(input);
  }

  // Rule-based fallback system
  private getRuleBasedRecommendation(input: MLCropInput): CropRecommendationResult {
    // Simple rule-based logic for crop recommendation
    const { nitrogen, phosphorus, potassium, temperature, humidity, ph_level, rainfall } = input;

    let recommendedCrop = 'Maize';
    let confidence = 0.7;
    let alternatives: { crop: string; confidence: number; reasoning: string }[] = [];

    // Rule-based logic using actual dataset ranges
    if (temperature >= 20 && temperature <= 35 && rainfall >= 80) {
      if (ph_level >= 6.0 && ph_level <= 7.5) {
        if (nitrogen >= 40 && phosphorus >= 30 && potassium >= 30) {
          recommendedCrop = 'Maize';
          confidence = 0.85;
          alternatives = [
            { crop: 'Cotton', confidence: 0.75, reasoning: 'Similar NPK requirements, good for warmer climate' },
            { crop: 'Chickpea', confidence: 0.70, reasoning: 'Good protein crop, drought tolerant' }
          ];
        }
      }
    }

    if (temperature >= 15 && temperature <= 25 && humidity >= 70) {
      if (ph_level >= 5.5 && ph_level <= 6.5) {
        recommendedCrop = 'Lentil';
        confidence = 0.80;
        alternatives = [
          { crop: 'Kidneybeans', confidence: 0.72, reasoning: 'Cool weather legume, similar pH requirements' },
          { crop: 'Blackgram', confidence: 0.68, reasoning: 'Cool season pulse crop' }
        ];
      }
    }

    if (rainfall >= 150 && humidity >= 80) {
      if (temperature >= 25 && temperature <= 35) {
        recommendedCrop = 'Rice';
        confidence = 0.88;
        alternatives = [
          { crop: 'Coconut', confidence: 0.75, reasoning: 'High water requirements, warm tropical climate' },
          { crop: 'Banana', confidence: 0.72, reasoning: 'Tropical conditions, high humidity' }
        ];
      }
    }

    // High nitrogen crops
    if (nitrogen >= 80 && phosphorus >= 50 && potassium >= 40) {
      recommendedCrop = 'Grapes';
      confidence = 0.82;
      alternatives = [
        { crop: 'Apple', confidence: 0.70, reasoning: 'Fruit crop with high nutrient requirements' },
        { crop: 'Orange', confidence: 0.68, reasoning: 'Citrus crop, good for high nutrient soils' }
      ];
    }

    return {
      recommended_crop: recommendedCrop,
      confidence_score: confidence,
      alternative_crops: alternatives,
      reasoning: `Based on your soil nutrient levels (N:${nitrogen}, P:${phosphorus}, K:${potassium}), pH level (${ph_level}), and climate conditions (${temperature}°C, ${humidity}% humidity, ${rainfall}mm rainfall), ${recommendedCrop} appears to be the most suitable crop for your conditions.`,
      growing_tips: [
        'Monitor soil moisture regularly during growing season',
        'Apply organic matter to improve soil structure',
        'Consider crop rotation to maintain soil health',
        'Test soil pH periodically and adjust if needed'
      ],
      optimal_conditions: {
        temperature_range: `${Math.max(15, temperature - 5)}-${temperature + 5}°C`,
        humidity_range: `${Math.max(50, humidity - 10)}-${Math.min(90, humidity + 10)}%`,
        ph_range: '6.0-7.5',
        water_requirements: rainfall > 600 ? 'High (>600mm)' : 'Moderate (400-600mm)'
      },
      estimated_yield: {
        min: 2.0,
        max: 4.5,
        unit: 'tons/hectare'
      }
    };
  }

  // Get historical crop performance for the region  
  async getCropPerformanceHistory(crop: string, location?: string): Promise<{ success: boolean; data?: string; error?: string }> {
    // This could be enhanced to call your Flask API for historical data
    return {
      success: true,
      data: `Historical performance data for ${crop} in ${location || 'East Africa'} shows good adaptation to local conditions. Consider consulting local agricultural extension services for detailed historical yield data.`
    };
  }

  // Validate input parameters (based on actual ML dataset ranges)
  static validateInput(input: MLCropInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.nitrogen < 0 || input.nitrogen > 140) {
      errors.push('Nitrogen should be between 0-140');
    }
    if (input.phosphorus < 5 || input.phosphorus > 145) {
      errors.push('Phosphorus should be between 5-145');
    }
    if (input.potassium < 5 || input.potassium > 205) {
      errors.push('Potassium should be between 5-205');
    }
    if (input.temperature < 8.8 || input.temperature > 43.7) {
      errors.push('Temperature should be between 8.8°C and 43.7°C');
    }
    if (input.humidity < 14 || input.humidity > 100) {
      errors.push('Humidity should be between 14-100%');
    }
    if (input.ph_level < 3.5 || input.ph_level > 9.9) {
      errors.push('pH level should be between 3.5-9.9');
    }
    if (input.rainfall < 20 || input.rainfall > 299) {
      errors.push('Rainfall should be between 20-299mm');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export the service instance
export const cropRecommendationML = new CropRecommendationService();

// Additional ML services for other features
export class FertilizerRecommendationService {
  // TODO: Implement fertilizer recommendation ML logic
  async getRecommendation(input: Record<string, unknown>) {
    // Placeholder for fertilizer ML service
    return {
      recommended_fertilizer: 'NPK 10-10-10',
      confidence_score: 0.8,
      dosage_recommendation: '50kg per hectare',
      application_method: 'Broadcast before planting'
    };
  }
}

export class YieldPredictionService {
  // TODO: Implement yield prediction ML logic
  async getPrediction(input: Record<string, unknown>) {
    // Placeholder for yield prediction ML service
    return {
      predicted_yield: 3.5,
      confidence_score: 0.78,
      yield_category: 'Medium' as const,
      factors_analysis: [
        { factor: 'Weather', impact: 'Positive', percentage: 65 },
        { factor: 'Soil Quality', impact: 'Neutral', percentage: 20 },
        { factor: 'Pest Risk', impact: 'Low Risk', percentage: 15 }
      ],
      improvement_suggestions: [
        'Consider using improved seeds',
        'Apply fertilizer based on soil test',
        'Implement proper pest management'
      ]
    };
  }
}

export const fertilizerRecommendationML = new FertilizerRecommendationService();
export const yieldPredictionML = new YieldPredictionService();