// Weather Service for OpenWeather API
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  location: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  visibility: number;
  wind_speed: number;
  wind_direction: number;
  weather_condition: string;
  weather_description: string;
  weather_icon: string;
  sunrise: number;
  sunset: number;
  timezone: number;
}

export interface WeatherForecast {
  date: string;
  temperature_max: number;
  temperature_min: number;
  humidity: number;
  weather_condition: string;
  weather_description: string;
  weather_icon: string;
  rain_probability: number;
  wind_speed: number;
}

export interface WeatherAlerts {
  event: string;
  description: string;
  start: number;
  end: number;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
}

export class WeatherService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = WEATHER_API_KEY;
    if (!this.apiKey) {
      console.error('❌ Weather API key not found. Please add VITE_WEATHER_API_KEY to your .env file');
      throw new Error('Weather API key not configured');
    }
    console.log('🌤️ Weather Service initialized with API key');
  }

  // Test API key validity
  async testApiKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      // Test with a simple current weather call for London
      const response = await fetch(
        `${WEATHER_BASE_URL}/weather?q=London&appid=${this.apiKey}&units=metric`
      );
      
      if (response.ok) {
        const data = await response.json();
        return { 
          valid: true,
          error: `API key working! Test location: ${data.name}, temp: ${data.main.temp}°C`
        };
      } else if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      } else {
        return { valid: false, error: `API error: ${response.status}` };
      }
    } catch (error) {
      return { valid: false, error: `Network error: ${error}` };
    }
  }

  // Get current weather by coordinates
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      location: `${data.name}, ${data.sys.country}`,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // Convert to km
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      weather_condition: data.weather[0].main,
      weather_description: data.weather[0].description,
      weather_icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timezone: data.timezone
    };
  }

  // Get current weather by city name
  async getCurrentWeatherByCity(city: string): Promise<WeatherData> {
    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?q=${city}&appid=${this.apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      location: `${data.name}, ${data.sys.country}`,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      weather_condition: data.weather[0].main,
      weather_description: data.weather[0].description,
      weather_icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timezone: data.timezone
    };
  }

  // Get 5-day weather forecast
  async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    const response = await fetch(
      `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Group by day and get daily forecasts
    const dailyForecasts: WeatherForecast[] = [];
    const processedDates = new Set();

    for (const item of data.list) {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!processedDates.has(date)) {
        processedDates.add(date);
        
        dailyForecasts.push({
          date,
          temperature_max: Math.round(item.main.temp_max),
          temperature_min: Math.round(item.main.temp_min),
          humidity: item.main.humidity,
          weather_condition: item.weather[0].main,
          weather_description: item.weather[0].description,
          weather_icon: item.weather[0].icon,
          rain_probability: item.pop * 100, // Convert to percentage
          wind_speed: item.wind.speed
        });
      }
    }

    return dailyForecasts.slice(0, 5); // Return 5 days
  }

  // Get weather alerts (requires One Call API - paid tier)
  async getWeatherAlerts(lat: number, lon: number): Promise<WeatherAlerts[]> {
    // Note: Weather alerts require the One Call API which is paid
    // For the free tier, we'll return an empty array
    // You can upgrade to paid tier if you need alerts
    console.log('Weather alerts require paid One Call API subscription');
    return [];
  }

  // Get weather icon URL
  getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }

  // Get wind direction as text
  getWindDirection(degrees: number): string {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  // Check if weather is suitable for farming activities
  isSuitableForFarming(weather: WeatherData): {
    suitable: boolean;
    reasons: string[];
    recommendations: string[];
  } {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let suitable = true;

    // Check temperature
    if (weather.temperature < 5) {
      suitable = false;
      reasons.push('Temperature too low for most crops');
      recommendations.push('Consider greenhouse or cold-resistant varieties');
    } else if (weather.temperature > 40) {
      suitable = false;
      reasons.push('Temperature too high, risk of heat stress');
      recommendations.push('Provide shade, increase irrigation');
    }

    // Check wind
    if (weather.wind_speed > 15) {
      suitable = false;
      reasons.push('Strong winds may damage crops');
      recommendations.push('Postpone spraying, secure loose materials');
    }

    // Check weather conditions
    if (weather.weather_condition === 'Rain') {
      reasons.push('Rainy conditions');
      recommendations.push('Good for irrigation, avoid soil work');
    } else if (weather.weather_condition === 'Thunderstorm') {
      suitable = false;
      reasons.push('Thunderstorm conditions');
      recommendations.push('Avoid outdoor farming activities');
    }

    if (suitable && reasons.length === 0) {
      reasons.push('Good conditions for farming activities');
      recommendations.push('Ideal time for planting, weeding, or harvesting');
    }

    return { suitable, reasons, recommendations };
  }
}

// Export service instance
export const weatherService = new WeatherService();

// Location service for Rwanda/East Africa
export class LocationService {
  // Get coordinates for major Rwandan cities
  static getLocationCoordinates(city: string): { lat: number; lon: number } | null {
    const locations: Record<string, { lat: number; lon: number }> = {
      'Kigali': { lat: -1.9441, lon: 30.0619 },
      'Butare': { lat: -2.5967, lon: 29.7398 },
      'Gitarama': { lat: -2.0742, lon: 29.7564 },
      'Ruhengeri': { lat: -1.4999, lon: 29.6333 },
      'Gisenyi': { lat: -1.7028, lon: 29.2564 },
      'Byumba': { lat: -1.5764, lon: 30.0669 },
      'Cyangugu': { lat: -2.4842, lon: 28.9072 },
      'Kibungo': { lat: -2.1833, lon: 30.5500 },
      'Gikongoro': { lat: -2.4167, lon: 29.5667 },
      'Umutara': { lat: -1.3833, lon: 30.4167 }
    };

    return locations[city] || null;
  }

  // Get user's current location using browser geolocation
  static async getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
}

export const locationService = LocationService;