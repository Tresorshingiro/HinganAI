import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Beaker, 
  Loader2, 
  CheckCircle, 
  Droplets,
  Thermometer,
  Sprout,
  TrendingUp,
  History,
  Calendar
} from 'lucide-react';

const SOIL_TYPES = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
const CROP_TYPES = ['Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 'Barley', 'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts'];

interface FertilizerResult {
  success: boolean;
  recommended_fertilizer: string;
  confidence: number;
  advice?: string;
  soil_analysis?: {
    nitrogen: number;
    phosphorous: number;
    potassium: number;
    soil_type: string;
    moisture: number;
  };
  conditions?: {
    temperature: number;
    humidity: number;
    crop_type: string;
  };
}

interface FertilizerRecommendation {
  id: string;
  recommended_fertilizer: string;
  confidence_score: number;
  soil_type: string;
  crop_type: string;
  nitrogen: number;
  phosphorous: number;
  potassium: number;
  created_at: string;
}

export default function FertilizerGuide() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FertilizerResult | null>(null);
  const [history, setHistory] = useState<FertilizerRecommendation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    moisture: '',
    soilType: '',
    cropType: '',
    nitrogen: '',
    potassium: '',
    phosphorous: ''
  });

  const loadHistory = useCallback(async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('fertilizer_recommendations')
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
        'Temparature': parseFloat(formData.temperature),
        'Humidity ': parseFloat(formData.humidity),  // Note the space after Humidity
        'Moisture': parseFloat(formData.moisture),
        'Soil Type': formData.soilType,
        'Crop Type': formData.cropType,
        'Nitrogen': parseFloat(formData.nitrogen),
        'Potassium': parseFloat(formData.potassium),
        'Phosphorous': parseFloat(formData.phosphorous),
        'user_id': user.id
      };

      const response = await fetch(`${backendUrl}/api/fertilizer-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to get fertilizer recommendation');
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
        // Reload history after successful recommendation
        loadHistory();
      } else {
        throw new Error(data.error || 'Recommendation failed');
      }
    } catch (error) {
      console.error('Error getting fertilizer recommendation:', error);
      alert('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getNPKStatus = (value: number, nutrient: string) => {
    // Basic thresholds (can be adjusted)
    const thresholds = {
      nitrogen: { low: 20, optimal: 40 },
      phosphorous: { low: 15, optimal: 30 },
      potassium: { low: 15, optimal: 30 }
    };
    
    const threshold = thresholds[nutrient.toLowerCase() as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';
    
    if (value < threshold.low) return 'text-red-600';
    if (value > threshold.optimal) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fertilizer Recommendation
        </h1>
        <p className="text-gray-600">
          Get AI-powered fertilizer recommendations based on soil analysis and crop type
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Beaker className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Soil Analysis</h2>
              <p className="text-sm text-gray-600">Enter your soil and environmental data</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Environmental Conditions */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Environmental Conditions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="e.g., 25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    name="humidity"
                    type="number"
                    step="0.1"
                    value={formData.humidity}
                    onChange={handleInputChange}
                    placeholder="e.g., 65"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moisture">Moisture (%)</Label>
                  <Input
                    id="moisture"
                    name="moisture"
                    type="number"
                    step="0.1"
                    value={formData.moisture}
                    onChange={handleInputChange}
                    placeholder="e.g., 45"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Soil & Crop Info */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 flex items-center gap-2">
                <Sprout className="h-4 w-4" />
                Soil & Crop Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <select
                    id="soilType"
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select soil type</option>
                    {SOIL_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type</Label>
                  <select
                    id="cropType"
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select crop type</option>
                    {CROP_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* NPK Values */}
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                NPK Levels (Current Soil Nutrients)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                  <Input
                    id="nitrogen"
                    name="nitrogen"
                    type="number"
                    step="0.1"
                    value={formData.nitrogen}
                    onChange={handleInputChange}
                    placeholder="e.g., 35"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phosphorous">Phosphorous (P)</Label>
                  <Input
                    id="phosphorous"
                    name="phosphorous"
                    type="number"
                    step="0.1"
                    value={formData.phosphorous}
                    onChange={handleInputChange}
                    placeholder="e.g., 25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="potassium">Potassium (K)</Label>
                  <Input
                    id="potassium"
                    name="potassium"
                    type="number"
                    step="0.1"
                    value={formData.potassium}
                    onChange={handleInputChange}
                    placeholder="e.g., 20"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Beaker className="mr-2 h-4 w-4" />
                  Get Recommendation
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recommendation</h2>
              <p className="text-sm text-gray-600">AI-powered fertilizer analysis</p>
            </div>
          </div>

          {result ? (
            <div className="space-y-6">
              {/* Recommended Fertilizer */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-green-800">
                    Recommended Fertilizer
                  </h3>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900 mb-2">
                  {result.recommended_fertilizer}
                </p>
                <p className="text-sm text-green-700">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>

              {/* Advice */}
              {result.advice && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Application Advice</h4>
                  <p className="text-sm text-blue-800">
                    {result.advice}
                  </p>
                </div>
              )}

              {/* Soil Analysis Summary */}
              {result.soil_analysis && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3">Soil Nutrient Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Nitrogen (N):</span>
                      <span className={`font-semibold ${getNPKStatus(result.soil_analysis.nitrogen, 'nitrogen')}`}>
                        {result.soil_analysis.nitrogen}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Phosphorous (P):</span>
                      <span className={`font-semibold ${getNPKStatus(result.soil_analysis.phosphorous, 'phosphorous')}`}>
                        {result.soil_analysis.phosphorous}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Potassium (K):</span>
                      <span className={`font-semibold ${getNPKStatus(result.soil_analysis.potassium, 'potassium')}`}>
                        {result.soil_analysis.potassium}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-gray-700">Soil Type:</span>
                      <span className="font-semibold">{result.soil_analysis.soil_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Moisture:</span>
                      <span className="font-semibold">{result.soil_analysis.moisture}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditions */}
              {result.conditions && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-3">Environmental Conditions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-700">Temperature:</span>
                      <p className="font-semibold">{result.conditions.temperature}°C</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-700">Humidity:</span>
                      <p className="font-semibold">{result.conditions.humidity}%</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-700">Crop Type:</span>
                      <p className="font-semibold">{result.conditions.crop_type}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter your soil data to get fertilizer recommendations</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Recommendations */}
      <Card className="shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Recommendations</h2>
              <p className="text-sm text-gray-600">Your previous fertilizer analyses</p>
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
                      <Beaker className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900">{item.recommended_fertilizer}</h4>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {(item.confidence_score * 100).toFixed(0)}%
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
                      <span className="text-gray-600">N-P-K:</span>
                      <span className="text-gray-800">
                        {item.nitrogen}-{item.phosphorous}-{item.potassium}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Soil Type:</span>
                      <span className="text-gray-800">{item.soil_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crop:</span>
                      <span className="text-gray-800">{item.crop_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
              <p className="text-sm">Start analyzing your soil above</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
