import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { diseaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Image as ImageIcon,
  History,
  Calendar,
  Bug
} from 'lucide-react';

interface DiseaseDetection {
  id: string;
  detected_disease: string;
  confidence_score: number;
  created_at: string;
}

export default function DiseaseDetection() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [cropType, setCropType] = useState('');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<DiseaseDetection[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('disease_detections')
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null); // Clear previous results
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !user) return;

    setLoading(true);
    try {
      // Create FormData to send image to backend
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('user_id', user.id);
      if (cropType) formData.append('crop_type', cropType);
      if (notes) formData.append('notes', notes);

      // Call backend API
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/disease-detection`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();

      if (data.success) {
        setResult({
          detected_disease: data.disease,
          confidence_score: data.confidence,
          severity_level: data.severity || 'Unknown',
          affected_part: 'Leaves',
          treatment_advice: data.treatment_advice,
          recommended_products: data.recommended_products || [],
          prevention_tips: data.prevention_tips || []
        });
        
        // Reload history after successful detection
        loadHistory();
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Plant Disease Detection
        </h1>
        <p className="text-gray-600">
          Upload photos of your plants to detect diseases and get treatment recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Camera className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Image Upload</h2>
              <p className="text-sm text-gray-600">Take or upload a clear photo of the affected plant</p>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-6">
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={handleUpload}
              >
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Plant Image
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click to select or drag and drop your image here
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, WebP (Max 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected plant"
                  className="w-full h-64 object-cover rounded-lg border"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {!imagePreview && (
              <Button
                onClick={handleUpload}
                variant="outline"
                className="w-full"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Select Image
              </Button>
            )}

            {/* Additional Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type (Optional)</Label>
                <Input
                  id="cropType"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder="e.g., Tomato, Rice, Maize"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe symptoms, location, duration..."
                  rows={3}
                />
              </div>
            </div>

            {imagePreview && (
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Analyze Plant
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Results Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Detection Results</h2>
              <p className="text-sm text-gray-600">AI analysis and treatment recommendations</p>
            </div>
          </div>

          {result ? (
            <div className="space-y-6">
              {/* Disease Detection */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-red-800">
                    Disease Detected
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(result.severity_level)}`}>
                    {result.severity_level}
                  </span>
                </div>
                <p className="text-xl font-bold text-red-900 mb-1">
                  {result.detected_disease}
                </p>
                <p className="text-sm text-red-700">
                  Confidence: {(result.confidence_score * 100).toFixed(1)}% • Affected: {result.affected_part}
                </p>
              </div>

              {/* Treatment Advice */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Treatment Recommendation
                </h4>
                <p className="text-sm text-green-800 mb-4">
                  {result.treatment_advice}
                </p>

                {/* Recommended Products */}
                {result.recommended_products && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-green-900">Recommended Products:</h5>
                    {result.recommended_products.map((product: any, index: number) => (
                      <div key={index} className="p-2 bg-white rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {product.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{product.application}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prevention Tips */}
              {result.prevention_tips && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Prevention Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {result.prevention_tips.map((tip: string, index: number) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Upload a plant image to start disease detection</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Detections */}
      <Card className="shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Detections</h2>
              <p className="text-sm text-gray-600">Your previous disease scans</p>
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => {
                const isHealthy = item.detected_disease.toLowerCase().includes('healthy');
                const getDiseaseColor = () => {
                  if (isHealthy) return 'bg-green-100 text-green-800 border-green-200';
                  if (item.detected_disease.toLowerCase().includes('rust')) return 'bg-orange-100 text-orange-800 border-orange-200';
                  if (item.detected_disease.toLowerCase().includes('powdery')) return 'bg-purple-100 text-purple-800 border-purple-200';
                  return 'bg-gray-100 text-gray-800 border-gray-200';
                };

                return (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4 text-gray-500" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDiseaseColor()}`}>
                          {item.detected_disease}
                        </span>
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
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isHealthy ? 'bg-green-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${item.confidence_score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {isHealthy ? (
                          <CheckCircle className="h-4 w-4 text-green-600 inline" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600 inline" />
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No detections yet</h3>
              <p className="text-sm">Start scanning your plants above</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}