import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { diseaseService } from '@/lib/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Camera, 
  Upload, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Image as ImageIcon
} from 'lucide-react';

export default function DiseaseDetection() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [cropType, setCropType] = useState('');
  const [notes, setNotes] = useState('');

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
      // TODO: Upload image and call ML backend
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

      const mockResult = {
        detected_disease: 'Leaf Blight',
        confidence_score: 0.92,
        severity_level: 'Medium',
        affected_part: 'Leaves',
        treatment_advice: 'Apply fungicide spray every 7-10 days. Remove affected leaves and ensure proper drainage.',
        recommended_products: [
          { name: 'Copper Fungicide', type: 'Chemical', application: 'Foliar spray' },
          { name: 'Neem Oil', type: 'Organic', application: 'Foliar spray' }
        ],
        prevention_tips: [
          'Maintain proper plant spacing for air circulation',
          'Water at soil level to avoid wetting leaves',
          'Remove plant debris regularly'
        ]
      };

      // Save to database
      const imageUrl = await diseaseService.uploadImage(user.id, selectedImage);
      await diseaseService.createDetection(
        user.id,
        imageUrl,
        selectedImage.name,
        mockResult,
        { crop_type: cropType, notes }
      );

      setResult(mockResult);
    } catch (error) {
      console.error('Error analyzing image:', error);
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
    </div>
  );
}