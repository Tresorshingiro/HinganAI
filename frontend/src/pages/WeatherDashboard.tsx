import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Eye, 
  Thermometer,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Sunrise,
  Sunset
} from 'lucide-react';
import { weatherService, locationService, WeatherData, WeatherForecast } from '../lib/weather-service';

export default function WeatherDashboard() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('Kigali');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadWeatherData = async (city?: string) => {
    try {
      setLoading(true);
      setError(null);

      let weatherData: WeatherData;
      let lat: number, lon: number;

      if (city) {
        // Get weather by city name
        weatherData = await weatherService.getCurrentWeatherByCity(city);
        const coords = locationService.getLocationCoordinates(city);
        if (coords) {
          lat = coords.lat;
          lon = coords.lon;
        } else {
          // Use Kigali as fallback
          lat = -1.9441;
          lon = 30.0619;
        }
      } else {
        // Try to get user's current location
        try {
          const coords = await locationService.getCurrentLocation();
          lat = coords.lat;
          lon = coords.lon;
          weatherData = await weatherService.getCurrentWeather(lat, lon);
        } catch (geoError) {
          console.log('Geolocation failed, using Kigali as default');
          weatherData = await weatherService.getCurrentWeatherByCity('Kigali');
          lat = -1.9441;
          lon = 30.0619;
        }
      }

      const forecastData = await weatherService.getWeatherForecast(lat, lon);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load weather data. Please try again.');
      console.error('Weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData(location);
  }, [location]);

  const handleRefresh = () => {
    loadWeatherData(location);
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    loadWeatherData(newLocation);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Weather Dashboard</h1>
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="animate-pulse">Loading weather data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Weather Dashboard</h1>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const farmingSuitability = currentWeather 
    ? weatherService.isSuitableForFarming(currentWeather)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Weather Dashboard</h1>
        <div className="flex items-center gap-2">
          <select 
            value={location} 
            onChange={(e) => handleLocationChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="Kigali">Kigali</option>
            <option value="Butare">Butare</option>
            <option value="Gitarama">Gitarama</option>
            <option value="Ruhengeri">Ruhengeri</option>
            <option value="Gisenyi">Gisenyi</option>
            <option value="Byumba">Byumba</option>
            <option value="Cyangugu">Cyangugu</option>
            <option value="Kibungo">Kibungo</option>
          </select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {currentWeather && (
        <>
          {/* Current Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Weather Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {currentWeather.location}
                </CardTitle>
                {lastUpdated && (
                  <p className="text-sm text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getWeatherIcon(currentWeather.weather_condition)}
                    <div>
                      <div className="text-4xl font-bold">{currentWeather.temperature}°C</div>
                      <div className="text-gray-500 capitalize">
                        {currentWeather.weather_description}
                      </div>
                      <div className="text-sm text-gray-400">
                        Feels like {currentWeather.feels_like}°C
                      </div>
                    </div>
                  </div>
                  <img 
                    src={weatherService.getWeatherIconUrl(currentWeather.weather_icon)}
                    alt={currentWeather.weather_description}
                    className="h-20 w-20"
                  />
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">Humidity</div>
                    <div className="font-semibold">{currentWeather.humidity}%</div>
                  </div>
                  <div className="text-center">
                    <Wind className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">Wind</div>
                    <div className="font-semibold">
                      {currentWeather.wind_speed} m/s {weatherService.getWindDirection(currentWeather.wind_direction)}
                    </div>
                  </div>
                  <div className="text-center">
                    <Eye className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">Visibility</div>
                    <div className="font-semibold">{currentWeather.visibility} km</div>
                  </div>
                  <div className="text-center">
                    <Thermometer className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">Pressure</div>
                    <div className="font-semibold">{currentWeather.pressure} hPa</div>
                  </div>
                </div>

                {/* Sun Times */}
                <div className="flex justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Sunrise: {formatTime(currentWeather.sunrise)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Sunset: {formatTime(currentWeather.sunset)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Farming Suitability */}
            {farmingSuitability && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {farmingSuitability.suitable ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    Farming Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant={farmingSuitability.suitable ? "default" : "secondary"}
                    className={farmingSuitability.suitable ? "bg-green-500" : "bg-yellow-500"}
                  >
                    {farmingSuitability.suitable ? "Good for Farming" : "Caution Advised"}
                  </Badge>
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">Current Conditions:</div>
                    {farmingSuitability.reasons.map((reason, index) => (
                      <div key={index} className="text-sm text-gray-600">• {reason}</div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">Recommendations:</div>
                    {farmingSuitability.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm text-blue-600">• {rec}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 5-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                5-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
                    <div className="font-medium text-sm mb-2">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <img 
                      src={weatherService.getWeatherIconUrl(day.weather_icon)}
                      alt={day.weather_description}
                      className="h-12 w-12 mx-auto mb-2"
                    />
                    <div className="text-lg font-semibold">
                      {day.temperature_max}°/{day.temperature_min}°
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {day.weather_description}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-xs">{Math.round(day.rain_probability)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}