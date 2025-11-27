import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sprout, Bug, Beaker, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Prediction {
  id: string;
  user_id: string;
  created_at: string;
  details: Record<string, unknown>;
}

export default function PredictionsPage() {
  const [cropPredictions, setCropPredictions] = useState<Prediction[]>([]);
  const [diseasePredictions, setDiseasePredictions] = useState<Prediction[]>([]);
  const [fertilizerPredictions, setFertilizerPredictions] = useState<Prediction[]>([]);
  const [yieldPredictions, setYieldPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPredictions();
  }, []);

  const fetchAllPredictions = async () => {
    try {
      setLoading(true);

      const [crop, disease, fertilizer, yieldData] = await Promise.all([
        supabase.from('crop_recommendations').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('disease_detections').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('fertilizer_recommendations').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('yield_predictions').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      setCropPredictions(crop.data || []);
      setDiseasePredictions(disease.data || []);
      setFertilizerPredictions(fertilizer.data || []);
      setYieldPredictions(yieldData.data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const PredictionCard = ({ prediction, type, icon: Icon, color }: { 
    prediction: Prediction; 
    type: string; 
    icon: React.ComponentType<{ className?: string }>; 
    color: string;
  }) => (
    <Card className={`p-4 border-l-4 ${color} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Icon className="h-5 w-5 mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                {type}
              </span>
              <span className="text-xs text-gray-500">
                {format(new Date(prediction.created_at), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(prediction.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Predictions History</h1>
        <p className="text-gray-600 mt-1">View all predictions made by users across different models</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Crop</p>
              <h3 className="text-2xl font-bold text-gray-900">{cropPredictions.length}</h3>
            </div>
            <Sprout className="h-10 w-10 text-emerald-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Disease</p>
              <h3 className="text-2xl font-bold text-gray-900">{diseasePredictions.length}</h3>
            </div>
            <Bug className="h-10 w-10 text-red-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Fertilizer</p>
              <h3 className="text-2xl font-bold text-gray-900">{fertilizerPredictions.length}</h3>
            </div>
            <Beaker className="h-10 w-10 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Yield</p>
              <h3 className="text-2xl font-bold text-gray-900">{yieldPredictions.length}</h3>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Predictions Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Predictions</TabsTrigger>
          <TabsTrigger value="crop">Crop Recommendations</TabsTrigger>
          <TabsTrigger value="disease">Disease Detection</TabsTrigger>
          <TabsTrigger value="fertilizer">Fertilizer</TabsTrigger>
          <TabsTrigger value="yield">Yield Prediction</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {[...cropPredictions, ...diseasePredictions, ...fertilizerPredictions, ...yieldPredictions]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 20)
            .map((pred) => {
              const type = cropPredictions.includes(pred) ? 'crop' :
                          diseasePredictions.includes(pred) ? 'disease' :
                          fertilizerPredictions.includes(pred) ? 'fertilizer' : 'yield';
              const icon = type === 'crop' ? Sprout : type === 'disease' ? Bug : type === 'fertilizer' ? Beaker : BarChart3;
              const color = type === 'crop' ? 'border-emerald-500' : type === 'disease' ? 'border-red-500' : type === 'fertilizer' ? 'border-blue-500' : 'border-purple-500';
              
              return <PredictionCard key={pred.id} prediction={pred} type={type} icon={icon} color={color} />;
            })}
        </TabsContent>

        <TabsContent value="crop" className="space-y-4">
          {cropPredictions.map((pred) => (
            <PredictionCard key={pred.id} prediction={pred} type="crop" icon={Sprout} color="border-emerald-500" />
          ))}
        </TabsContent>

        <TabsContent value="disease" className="space-y-4">
          {diseasePredictions.map((pred) => (
            <PredictionCard key={pred.id} prediction={pred} type="disease" icon={Bug} color="border-red-500" />
          ))}
        </TabsContent>

        <TabsContent value="fertilizer" className="space-y-4">
          {fertilizerPredictions.map((pred) => (
            <PredictionCard key={pred.id} prediction={pred} type="fertilizer" icon={Beaker} color="border-blue-500" />
          ))}
        </TabsContent>

        <TabsContent value="yield" className="space-y-4">
          {yieldPredictions.map((pred) => (
            <PredictionCard key={pred.id} prediction={pred} type="yield" icon={BarChart3} color="border-purple-500" />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
