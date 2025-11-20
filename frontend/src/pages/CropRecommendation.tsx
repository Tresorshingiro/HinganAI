import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cropService } from '@/lib/database';
import { cropRecommendationML, CropRecommendationService, type CropRecommendationResult } from '@/lib/ml-services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Leaf, Info, TrendingUp, Droplets, Thermometer, AlertTriangle, History, Calendar, Sprout, CheckCircle, Zap } from 'lucide-react';
import type { CropRecommendationInput, CropRecommendation } from '@/types/database';

export default function CropRecommendation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropRecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CropRecommendation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [formData, setFormData] = useState<CropRecommendationInput>({
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    temperature: 0,
    humidity: 0,
    ph_level: 0,
    rainfall: 0,
    notes: '',
  });

  const loadHistory = useCallback(async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const historyResult = await cropService.getRecommendations(user.id, 1, 5);
      setHistory(historyResult.data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  // Load recommendation history
  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'notes') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      // For NPK values, use integers; for others, use floats
      const numValue = ['nitrogen', 'phosphorus', 'potassium'].includes(name) 
        ? parseInt(value) || 0 
        : parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setResult(null); // Clear previous results
    
    console.log('🚀 Starting crop recommendation...', formData);
    
    try {
      // Check if all required fields are filled
      if (!formData.nitrogen || !formData.phosphorus || !formData.potassium || 
          !formData.temperature || !formData.humidity || !formData.ph_level || !formData.rainfall) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate input ranges
      console.log('🔍 Validating input ranges...');
      const validation = CropRecommendationService.validateInput(formData);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Get ML recommendation (this is fast)
      console.log('🔬 Getting ML prediction...');
      const mlResult = await cropRecommendationML.getCropRecommendation(formData);
      
      // Show results immediately 
      setResult(mlResult);
      console.log('✅ ML prediction received:', mlResult.recommended_crop);
      
      // Save to database asynchronously (don't block UI)
      setTimeout(async () => {
        try {
          const dbData = {
            recommended_crop: mlResult.recommended_crop,
            confidence_score: mlResult.confidence_score,
            alternative_crops: mlResult.alternative_crops,
          };
          
          console.log('💾 Saving to database...');
          const dbResult = await cropService.createRecommendation(user.id, formData, dbData);
          
          if (dbResult.success) {
            console.log('✅ Saved to database successfully');
            // Refresh history to show the new recommendation
            loadHistory();
          } else {
            console.error('❌ Database save failed:', dbResult.error);
            // Don't show error to user since they already have their prediction
          }
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
          // Don't show error to user since they already have their prediction
        }
      }, 0);
    } catch (error) {
      console.error('Error getting crop recommendation:', error);
      setError('Failed to get crop recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
            <Sprout className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Crop Recommendation
            </h1>
            <p className="text-gray-600 mt-1">
              Get AI-powered crop suggestions based on your soil and climate conditions
            </p>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">22</div>
            <div className="text-sm text-gray-500">Crop Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">&lt;1s</div>
            <div className="text-sm text-gray-500">Response Time</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form Section */}
        <Card className="shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Soil Analysis</h2>
                <p className="text-sm text-gray-500">Enter your soil and climate data</p>
              </div>
            </div>

            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Enter actual measured values from soil tests and weather data. 
                NPK values are raw nutrient levels, not percentages.
              </AlertDescription>
            </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Soil Nutrients */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                <Input
                  id="nitrogen"
                  name="nitrogen"
                  type="number"
                  step="1"
                  min="0"
                  max="140"
                  value={formData.nitrogen || ''}
                  onChange={handleInputChange}
                  placeholder="Enter nitrogen level"
                  required
                />
                <p className="text-xs text-gray-500">Range: 0-140</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                <Input
                  id="phosphorus"
                  name="phosphorus"
                  type="number"
                  step="1"
                  min="5"
                  max="145"
                  value={formData.phosphorus || ''}
                  onChange={handleInputChange}
                  placeholder="Enter phosphorus level"
                  required
                />
                <p className="text-xs text-gray-500">Range: 5-145</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="potassium">Potassium (K)</Label>
                <Input
                  id="potassium"
                  name="potassium"
                  type="number"
                  step="1"
                  min="5"
                  max="205"
                  value={formData.potassium || ''}
                  onChange={handleInputChange}
                  placeholder="Enter potassium level"
                  required
                />
                <p className="text-xs text-gray-500">Range: 5-205</p>
              </div>
            </div>

            {/* Climate Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  min="8"
                  max="44"
                  value={formData.temperature || ''}
                  onChange={handleInputChange}
                  placeholder="Enter temperature"
                  required
                />
                <p className="text-xs text-gray-500">Range: 8.8-43.7°C</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Humidity (%)</Label>
                <Input
                  id="humidity"
                  name="humidity"
                  type="number"
                  step="0.1"
                  min="14"
                  max="100"
                  value={formData.humidity || ''}
                  onChange={handleInputChange}
                  placeholder="Enter humidity %"
                  required
                />
                <p className="text-xs text-gray-500">Range: 14-100%</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph_level">pH Level</Label>
                <Input
                  id="ph_level"
                  name="ph_level"
                  type="number"
                  step="0.1"
                  min="3.5"
                  max="9.9"
                  value={formData.ph_level || ''}
                  onChange={handleInputChange}
                  placeholder="Enter pH level"
                  required
                />
                <p className="text-xs text-gray-500">Range: 3.5-9.9</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rainfall">Rainfall (mm)</Label>
                <Input
                  id="rainfall"
                  name="rainfall"
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={formData.rainfall || ''}
                  onChange={handleInputChange}
                  placeholder="Enter rainfall amount"
                  required
                />
                <p className="text-xs text-gray-500">Range: 20-299mm</p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information about your farm or soil conditions..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting AI Prediction...
                </>
              ) : (
                <>
                  <Leaf className="mr-2 h-4 w-4" />
                  Get Recommendation
                </>
              )}
            </Button>
          </form>
          </div>
        </Card>

        {/* Results Section */}
        <Card className="shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Recommendation</h2>
                <p className="text-sm text-gray-500">Based on your soil analysis</p>
              </div>
            </div>

          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result ? (
            <div className="space-y-6">
              {/* Primary Recommendation */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Recommended Crop
                    </h3>
                    <p className="text-sm text-green-600">AI-powered recommendation</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-3xl font-bold text-green-900 mb-2">
                    {result.recommended_crop}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {(result.confidence_score * 100).toFixed(1)}% confidence
                    </Badge>
                    <Badge variant="outline" className="border-green-300">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {result.estimated_yield.min}-{result.estimated_yield.max} {result.estimated_yield.unit}
                    </Badge>
                  </div>
                </div>
                
                {result.reasoning && (
                  <p className="text-sm text-green-700 bg-green-100 p-3 rounded">
                    {result.reasoning}
                  </p>
                )}
              </div>

              {/* Optimal Growing Conditions */}
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Optimal Growing Conditions
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span>Temperature: {result.optimal_conditions.temperature_range}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>Humidity: {result.optimal_conditions.humidity_range}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">pH:</span>
                    <span>{result.optimal_conditions.ph_range}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">Water:</span>
                    <span>{result.optimal_conditions.water_requirements}</span>
                  </div>
                </div>
              </Card>

              {/* Alternative Crops */}
              {result.alternative_crops && result.alternative_crops.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Alternative Options
                  </h4>
                  <div className="space-y-3">
                    {result.alternative_crops.map((alt, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{alt.crop}</span>
                          <Badge variant="secondary">
                            {(alt.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alt.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Growing Tips */}
              {result.growing_tips && result.growing_tips.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Growing Tips</h4>
                  <ul className="space-y-2">
                    {result.growing_tips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter your soil data to get AI recommendations</p>
            </div>
          )}
          </div>
        </Card>
      </div>

      {/* History Section */}
      <Card className="shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Recommendations</h2>
              <p className="text-sm text-gray-600">Your previous crop analyses</p>
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
                    <h4 className="font-medium text-gray-900">{item.recommended_crop}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {item.confidence_score ? `${(item.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">N-P-K:</span>
                      <span className="text-gray-800">
                        {item.nitrogen.toFixed(1)}-{item.phosphorus.toFixed(1)}-{item.potassium.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Climate:</span>
                      <span className="text-gray-800">
                        {item.temperature.toFixed(0)}°C, {item.humidity.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">pH:</span>
                      <span className="text-gray-800">{item.ph_level.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
              <p className="text-sm">Start by analyzing your soil conditions above</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}