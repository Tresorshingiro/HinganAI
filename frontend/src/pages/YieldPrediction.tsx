import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Loader2, 
  TrendingUp,
  Calendar,
  CloudRain,
  Droplets,
  Thermometer,
  MapPin,
  Wheat,
  History
} from 'lucide-react';

const COUNTRIES = [
  'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Belgium', 'Botswana', 'Brazil', 
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cameroon', 'Canada', 'Chile', 'Colombia', 
  'Croatia', 'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 
  'Eritrea', 'Estonia', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Guatemala', 
  'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'India', 'Indonesia', 'Iraq', 
  'Ireland', 'Italy', 'Jamaica', 'Japan', 'Kazakhstan', 'Kenya', 'Latvia', 'Lebanon', 
  'Lesotho', 'Libya', 'Lithuania', 'Madagascar', 'Malawi', 'Malaysia', 'Mali', 
  'Mauritania', 'Mauritius', 'Mexico', 'Montenegro', 'Morocco', 'Mozambique', 'Namibia', 
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Norway', 'Pakistan', 
  'Papua New Guinea', 'Peru', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Rwanda', 
  'Saudi Arabia', 'Senegal', 'Slovenia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 
  'Suriname', 'Sweden', 'Switzerland', 'Tajikistan', 'Thailand', 'Tunisia', 'Turkey', 
  'Uganda', 'Ukraine', 'United Kingdom', 'Uruguay', 'Zambia', 'Zimbabwe'
];

const CROPS = [
  'Maize', 'Potatoes', 'Rice, paddy', 'Sorghum', 'Soybeans', 'Wheat', 
  'Cassava', 'Sweet potatoes', 'Plantains and others', 'Yams'
];

interface YieldResult {
  success: boolean;
  predicted_yield: number;
  yield_per_hectare: number;
  crop_type: string;
  factors: {
    year: number;
    rainfall: number;
    pesticides: number;
    temperature: number;
    area: string;
  };
}

interface YieldPredictionRecord {
  id: string;
  predicted_yield: number;
  crop_item: string;
  area: string;
  year: number;
  average_rainfall: number;
  average_temperature: number;
  created_at: string;
}

export default function YieldPrediction() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldResult | null>(null);
  const [history, setHistory] = useState<YieldPredictionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    rainfall: '',
    pesticides: '',
    temperature: '',
    area: '',
    item: ''
  });

  const loadHistory = useCallback(async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('yield_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const requestData = {
        'Year': parseInt(formData.year),
        'average_rain_fall_mm_per_year': parseFloat(formData.rainfall),
        'pesticides_tonnes': parseFloat(formData.pesticides),
        'avg_temp': parseFloat(formData.temperature),
        'Area': formData.area,
        'Item': formData.item,
        'user_id': user.id
      };

      const response = await fetch(`${backendUrl}/api/crop-yield-prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to get yield prediction');
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
        // Reload history after successful prediction
        loadHistory();
      } else {
        throw new Error(data.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('Error getting yield prediction:', error);
      alert('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crop Yield Prediction
        </h1>
        <p className="text-gray-600">
          Predict your crop yield based on environmental factors and farming practices
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Prediction Parameters</h2>
              <p className="text-sm text-gray-600">Enter your farming conditions</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location & Crop */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location & Crop
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Country/Area</Label>
                  <select
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item">Crop Type</Label>
                  <select
                    id="item"
                    name="item"
                    value={formData.item}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select crop</option>
                    {CROPS.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Year
              </Label>
              <Input
                id="year"
                name="year"
                type="number"
                min="1900"
                max="2100"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="e.g., 2024"
                required
              />
            </div>

            {/* Environmental Factors */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 flex items-center gap-2">
                <CloudRain className="h-4 w-4" />
                Environmental Conditions
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rainfall" className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4" />
                    Average Rainfall (mm per year)
                  </Label>
                  <Input
                    id="rainfall"
                    name="rainfall"
                    type="number"
                    step="0.1"
                    value={formData.rainfall}
                    onChange={handleInputChange}
                    placeholder="e.g., 1200.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature" className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Average Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="e.g., 25.8"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Farming Practices */}
            <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900 flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Farming Practices
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="pesticides">Pesticides Usage (tonnes)</Label>
                <Input
                  id="pesticides"
                  name="pesticides"
                  type="number"
                  step="0.01"
                  value={formData.pesticides}
                  onChange={handleInputChange}
                  placeholder="e.g., 125.5"
                  required
                />
                <p className="text-xs text-yellow-700">
                  Total pesticides used in the area (in tonnes)
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Predict Yield
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Prediction Results</h2>
              <p className="text-sm text-gray-600">AI-powered yield forecast</p>
            </div>
          </div>

          {result ? (
            <div className="space-y-6">
              {/* Predicted Yield */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Predicted Yield
                  </h3>
                  <Wheat className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Predicted Yield</p>
                    <p className="text-3xl font-bold text-green-900">
                      {result.predicted_yield?.toLocaleString() || '0'} <span className="text-lg">hg/ha</span>
                    </p>
                  </div>
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Country</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {result.area || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Crop Info */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <Wheat className="h-4 w-4" />
                  Crop Information
                </h4>
                <p className="text-lg font-medium text-gray-800">
                  {result.crop_type}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  in {result.factors.area}
                </p>
              </div>

              {/* Factors Analysis */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3">Contributing Factors</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Year
                    </span>
                    <span className="font-semibold">{result.factors.year}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <CloudRain className="h-4 w-4" />
                      Rainfall
                    </span>
                    <span className="font-semibold">{result.factors.rainfall} mm/year</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature
                    </span>
                    <span className="font-semibold">{result.factors.temperature}°C</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Pesticides
                    </span>
                    <span className="font-semibold">{result.factors.pesticides} tonnes</span>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> This prediction is based on historical data and machine learning models. 
                  Actual yields may vary depending on additional factors such as soil quality, 
                  irrigation practices, and pest management.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter your farming parameters to predict crop yield</p>
              <p className="text-sm mt-2">
                Get insights based on historical data and AI analysis
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Predictions */}
      <Card className="shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Predictions</h2>
              <p className="text-sm text-gray-600">Your previous yield analyses</p>
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wheat className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900">{item.crop_item}</h4>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {item.predicted_yield?.toLocaleString() || '0'} hg/ha
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Country:
                      </span>
                      <span className="text-gray-800">{item.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="text-gray-800">{item.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <CloudRain className="h-3 w-3" />
                        Rainfall:
                      </span>
                      <span className="text-gray-800">{item.average_rainfall} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        Temp:
                      </span>
                      <span className="text-gray-800">{item.average_temperature}°C</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No predictions yet</h3>
              <p className="text-sm">Start predicting crop yields above</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
