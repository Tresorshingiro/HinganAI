import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Agriculture-focused system prompt
const AGRICULTURE_SYSTEM_PROMPT = `
You are HinganAI, an expert agricultural advisor and farming assistant. You help farmers in Rwanda and East Africa with:

🌱 CROP MANAGEMENT:
- Crop selection and rotation advice
- Planting schedules and timing
- Soil preparation and management
- Pest and disease identification/treatment
- Fertilizer and nutrient management

🌧️ CLIMATE & WEATHER:
- Seasonal farming advice
- Drought and flood management
- Climate-smart agriculture practices
- Water conservation techniques

🚜 FARMING PRACTICES:
- Sustainable farming methods
- Organic vs conventional approaches
- Farm equipment and tools guidance
- Post-harvest handling and storage

💰 FARM BUSINESS:
- Market analysis and pricing
- Cost optimization strategies
- Agricultural financing options
- Value addition opportunities

🔬 TECHNOLOGY:
- Modern farming techniques
- Agricultural innovations
- Mobile farming apps and tools

COMMUNICATION STYLE:
- Be practical and actionable
- Use simple, clear language
- Provide specific, measurable advice
- Consider local East African conditions
- Be encouraging and supportive
- Always prioritize farmer safety and sustainability

IMPORTANT: If asked about non-agriculture topics, politely redirect back to farming and agriculture.
`;

class AgricultureChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel | null = null;
  private chat: ChatSession | null = null;
  private modelInitialized = false;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async ensureModelInitialized() {
    if (this.modelInitialized && this.model) {
      return;
    }

    // Try different model names that might be available
    // Put more stable models first
    const modelNames = [
      'gemini-pro',
      'gemini-pro-latest',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest'
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        
        // Test the model with a simple query
        const testResult = await this.model.generateContent("Hi");
        console.log(`Successfully initialized model: ${modelName}`);
        this.modelInitialized = true;
        return;
      } catch (error) {
        console.log(`Model ${modelName} failed:`, error.message);
        // If it's just overloaded, we still consider it a valid model
        if (error.message && error.message.includes('overloaded')) {
          console.log(`Model ${modelName} is valid but overloaded, using it anyway`);
          this.modelInitialized = true;
          return;
        }
        continue;
      }
    }

    throw new Error('No available Gemini models found. Please check your API key and model availability.');
  }

  async startNewConversation() {
    await this.ensureModelInitialized();
    if (!this.model) {
      throw new Error('Failed to initialize Gemini model');
    }
    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello, I'm a farmer and need agricultural advice." }],
        },
        {
          role: "model",
          parts: [{ 
            text: "Hello! Welcome to HinganAI. I'm here to help you with all your farming needs. Whether you need advice on crops, soil management, pest control, or farming business strategies, I'm ready to assist. What farming challenge can I help you with today?" 
          }],
        },
      ],
    });
    return this.chat;
  }

  async sendMessage(message: string, userContext?: {
    location?: string;
    cropTypes?: string[];
    farmSize?: number;
    season?: string;
  }) {
    await this.ensureModelInitialized();
    if (!this.model) {
      throw new Error('Failed to initialize Gemini model');
    }

    if (!this.chat) {
      await this.startNewConversation();
    }

    // Retry logic for overloaded models
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Add context to the message if available
        let contextualMessage = message;
        if (userContext) {
          const contextInfo = [];
          if (userContext.location) contextInfo.push(`Location: ${userContext.location}`);
          if (userContext.cropTypes?.length) contextInfo.push(`Crops: ${userContext.cropTypes.join(', ')}`);
          if (userContext.farmSize) contextInfo.push(`Farm size: ${userContext.farmSize} hectares`);
          if (userContext.season) contextInfo.push(`Season: ${userContext.season}`);
          
          if (contextInfo.length > 0) {
            contextualMessage = `Context: ${contextInfo.join(', ')}.\n\nQuestion: ${message}`;
          }
        }

        const result = await this.chat.sendMessage(contextualMessage);
        const response = result.response.text();
        
        return {
          success: true,
          response: response,
          error: null
        };
      } catch (error) {
        console.error('Chatbot error:', error);
        
        // Check if it's an overload error
        if (error.message && error.message.includes('overloaded')) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`Model overloaded, retrying... (${retryCount}/${maxRetries})`);
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
            continue;
          } else {
            return {
              success: false,
              response: null,
              error: 'The AI service is currently busy. Please try again in a few moments.'
            };
          }
        }
        
        return {
          success: false,
          response: null,
          error: 'Sorry, I encountered an error. Please try again.'
        };
      }
    }

    return {
      success: false,
      response: null,
      error: 'Unable to process your request after multiple attempts. Please try again later.'
    };
  }

  // Quick farming tips
  async getQuickTip(category?: 'crops' | 'soil' | 'pest' | 'weather' | 'business') {
    await this.ensureModelInitialized();
    if (!this.model) {
      throw new Error('Failed to initialize Gemini model');
    }

    const tipPrompts = {
      crops: "Give me a quick, practical tip about crop management for East African farmers.",
      soil: "Share a simple soil health tip that farmers can implement easily.",
      pest: "Provide a natural pest control tip for small-scale farmers.",
      weather: "Give advice on how farmers can adapt to changing weather patterns.",
      business: "Share a tip to help farmers improve their farm profitability.",
    };

    const prompt = tipPrompts[category || 'crops'];
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return {
        success: true,
        tip: response,
        category: category || 'general'
      };
    } catch (error) {
      console.error('Quick tip error:', error);
      return {
        success: false,
        tip: 'Unable to generate tip at the moment.',
        category: category || 'general'
      };
    }
  }

  // Crop identification help
  async identifyCropIssue(description: string, cropType?: string) {
    await this.ensureModelInitialized();
    if (!this.model) {
      throw new Error('Failed to initialize Gemini model');
    }

    const prompt = `
    A farmer describes this issue with their ${cropType || 'crop'}: "${description}"
    
    Please provide:
    1. Possible diagnosis
    2. Immediate actions to take
    3. Long-term prevention measures
    4. When to seek additional help
    
    Keep your response practical and action-oriented.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return {
        success: true,
        diagnosis: response,
        error: null
      };
    } catch (error) {
      console.error('Crop issue identification error:', error);
      return {
        success: false,
        diagnosis: null,
        error: 'Unable to analyze the issue at the moment.'
      };
    }
  }

  // Seasonal advice
  async getSeasonalAdvice(season: string, location?: string) {
    await this.ensureModelInitialized();
    if (!this.model) {
      throw new Error('Failed to initialize Gemini model');
    }

    const prompt = `
    Provide comprehensive farming advice for ${season} season${location ? ` in ${location}` : ' in East Africa'}.
    
    Include:
    1. What crops to plant or harvest
    2. Important farming activities
    3. Weather preparations
    4. Common challenges and solutions
    5. Market opportunities
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return {
        success: true,
        advice: response,
        season: season
      };
    } catch (error) {
      console.error('Seasonal advice error:', error);
      return {
        success: false,
        advice: null,
        error: 'Unable to provide seasonal advice at the moment.'
      };
    }
  }
}

export const agricultureChatbot = new AgricultureChatbotService();