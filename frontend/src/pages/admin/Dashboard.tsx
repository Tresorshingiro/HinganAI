import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  TrendingUp,
  Activity,
  Database,
  Sprout,
  Bug,
  Beaker,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface SystemStats {
  totalUsers: number;
  totalPredictions: number;
  cropRecommendations: number;
  diseaseDetections: number;
  fertilizerRecommendations: number;
  yieldPredictions: number;
  todayPredictions: number;
  weekPredictions: number;
}

interface CropDetails {
  recommended_crop?: string;
  confidence_score?: number;
  N?: number;
  P?: number;
  K?: number;
  temperature?: number;
  humidity?: number;
  ph?: number;
  rainfall?: number;
}

interface DiseaseDetails {
  disease_name?: string;
  confidence_score?: number;
  image_path?: string;
}

interface FertilizerDetails {
  recommended_fertilizer?: string;
  confidence_score?: number;
  Nitrogen?: number;
  Phosphorous?: number;
  Potassium?: number;
  crop_type?: string;
}

interface YieldDetails {
  predicted_yield?: number;
  crop_item?: string;
  season?: string;
  state?: string;
  area?: number;
  annual_rainfall?: number;
  fertilizer?: number;
  pesticide?: number;
}

type PredictionDetails = (CropDetails | DiseaseDetails | FertilizerDetails | YieldDetails) & Record<string, unknown>;

interface RecentPrediction {
  id: string;
  type: 'crop' | 'disease' | 'fertilizer' | 'yield';
  user_email?: string;
  created_at: string;
  details: PredictionDetails;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalPredictions: 0,
    cropRecommendations: 0,
    diseaseDetections: 0,
    fertilizerRecommendations: 0,
    yieldPredictions: 0,
    todayPredictions: 0,
    weekPredictions: 0,
  });
  const [recentPredictions, setRecentPredictions] = useState<RecentPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkAdminAccess = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if user has admin privileges
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (!profile?.is_admin) {
        console.log('User is not admin, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if user is admin (you can implement your own admin check)
    checkAdminAccess();
    fetchStats();
    fetchRecentPredictions();
  }, [checkAdminAccess]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
      }

      // Fetch crop recommendations count
      const { count: cropCount, error: cropError } = await supabase
        .from('crop_recommendations')
        .select('*', { count: 'exact', head: true });

      if (cropError) {
        console.error('Error fetching crop count:', cropError);
      }

      // Fetch disease detections count
      const { count: diseaseCount, error: diseaseError } = await supabase
        .from('disease_detections')
        .select('*', { count: 'exact', head: true });

      if (diseaseError) {
        console.error('Error fetching disease count:', diseaseError);
      }

      // Fetch fertilizer recommendations count
      const { count: fertilizerCount, error: fertilizerError } = await supabase
        .from('fertilizer_recommendations')
        .select('*', { count: 'exact', head: true });

      if (fertilizerError) {
        console.error('Error fetching fertilizer count:', fertilizerError);
      }

      // Fetch yield predictions count
      const { count: yieldCount, error: yieldError } = await supabase
        .from('yield_predictions')
        .select('*', { count: 'exact', head: true });

      if (yieldError) {
        console.error('Error fetching yield count:', yieldError);
      }

      // Calculate today's predictions (check all tables)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayISO = today.toISOString();

      const { count: cropTodayCount } = await supabase
        .from('crop_recommendations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      const { count: diseaseTodayCount } = await supabase
        .from('disease_detections')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      const { count: fertilizerTodayCount } = await supabase
        .from('fertilizer_recommendations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      const { count: yieldTodayCount } = await supabase
        .from('yield_predictions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      const todayTotal = 
        (cropTodayCount || 0) + 
        (diseaseTodayCount || 0) + 
        (fertilizerTodayCount || 0) + 
        (yieldTodayCount || 0);

      // Calculate this week's predictions (check all tables)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoISO = weekAgo.toISOString();

      const { count: cropWeekCount } = await supabase
        .from('crop_recommendations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgoISO);

      const { count: diseaseWeekCount } = await supabase
        .from('disease_detections')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgoISO);

      const { count: fertilizerWeekCount } = await supabase
        .from('fertilizer_recommendations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgoISO);

      const { count: yieldWeekCount } = await supabase
        .from('yield_predictions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgoISO);

      const weekTotal = 
        (cropWeekCount || 0) + 
        (diseaseWeekCount || 0) + 
        (fertilizerWeekCount || 0) + 
        (yieldWeekCount || 0);

      const totalPredictions =
        (cropCount || 0) +
        (diseaseCount || 0) +
        (fertilizerCount || 0) +
        (yieldCount || 0);

      console.log('Stats fetched:', {
        totalUsers: usersCount || 0,
        totalPredictions,
        cropRecommendations: cropCount || 0,
        diseaseDetections: diseaseCount || 0,
        fertilizerRecommendations: fertilizerCount || 0,
        yieldPredictions: yieldCount || 0,
        todayPredictions: todayTotal,
        weekPredictions: weekTotal,
      });

      setStats({
        totalUsers: usersCount || 0,
        totalPredictions,
        cropRecommendations: cropCount || 0,
        diseaseDetections: diseaseCount || 0,
        fertilizerRecommendations: fertilizerCount || 0,
        yieldPredictions: yieldCount || 0,
        todayPredictions: todayTotal,
        weekPredictions: weekTotal,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPredictions = async () => {
    try {
      // Fetch recent predictions from all tables with user information
      const { data: cropData, error: cropError } = await supabase
        .from('crop_recommendations')
        .select(`
          id, 
          user_id, 
          recommended_crop, 
          confidence_score, 
          created_at,
          user_profiles!inner(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (cropError) console.error('Error fetching crop predictions:', cropError);

      const { data: diseaseData, error: diseaseError } = await supabase
        .from('disease_detections')
        .select(`
          id, 
          user_id, 
          detected_disease, 
          confidence_score, 
          created_at,
          user_profiles!inner(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (diseaseError) console.error('Error fetching disease predictions:', diseaseError);

      const { data: fertilizerData, error: fertilizerError } = await supabase
        .from('fertilizer_recommendations')
        .select(`
          id, 
          user_id, 
          recommended_fertilizer, 
          confidence_score, 
          created_at,
          user_profiles!inner(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (fertilizerError) console.error('Error fetching fertilizer predictions:', fertilizerError);

      const { data: yieldData, error: yieldError } = await supabase
        .from('yield_predictions')
        .select(`
          id, 
          user_id, 
          crop_item, 
          predicted_yield, 
          created_at,
          user_profiles!inner(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (yieldError) console.error('Error fetching yield predictions:', yieldError);

      // Combine and format predictions
      const allPredictions: RecentPrediction[] = [
        ...(cropData || []).map((p: any) => ({
          id: p.id,
          type: 'crop' as const,
          created_at: p.created_at,
          user_email: p.user_profiles?.email || 'Unknown',
          details: {
            recommended_crop: p.recommended_crop,
            confidence_score: p.confidence_score,
          },
        })),
        ...(diseaseData || []).map((p: any) => ({
          id: p.id,
          type: 'disease' as const,
          created_at: p.created_at,
          user_email: p.user_profiles?.email || 'Unknown',
          details: {
            disease_name: p.detected_disease,
            confidence_score: p.confidence_score,
          },
        })),
        ...(fertilizerData || []).map((p: any) => ({
          id: p.id,
          type: 'fertilizer' as const,
          created_at: p.created_at,
          user_email: p.user_profiles?.email || 'Unknown',
          details: {
            recommended_fertilizer: p.recommended_fertilizer,
            confidence_score: p.confidence_score,
          },
        })),
        ...(yieldData || []).map((p: any) => ({
          id: p.id,
          type: 'yield' as const,
          created_at: p.created_at,
          user_email: p.user_profiles?.email || 'Unknown',
          details: {
            crop_item: p.crop_item,
            predicted_yield: p.predicted_yield,
          },
        })),
      ];

      // Sort by date and take top 20
      allPredictions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('Recent predictions fetched:', allPredictions.length);
      setRecentPredictions(allPredictions.slice(0, 20));
    } catch (error) {
      console.error('Error fetching recent predictions:', error);
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'crop':
        return <Sprout className="h-5 w-5 text-emerald-600" />;
      case 'disease':
        return <Bug className="h-5 w-5 text-red-600" />;
      case 'fertilizer':
        return <Beaker className="h-5 w-5 text-blue-600" />;
      case 'yield':
        return <BarChart3 className="h-5 w-5 text-purple-600" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getPredictionColor = (type: string) => {
    switch (type) {
      case 'crop':
        return 'bg-emerald-50 border-emerald-200';
      case 'disease':
        return 'bg-red-50 border-red-200';
      case 'fertilizer':
        return 'bg-blue-50 border-blue-200';
      case 'yield':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getDetailValue = (details: PredictionDetails, key: string): string | number => {
    const value = details[key as keyof PredictionDetails];
    return value !== undefined ? String(value) : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Monitor system performance and user activity</p>
      </div>

      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Active</span>
            </div>
          </Card>

          {/* Total Predictions */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Predictions</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalPredictions}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Database className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600">All time</span>
            </div>
          </Card>

          {/* Today's Predictions */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Activity</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.todayPredictions}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-purple-600">Last 24h</span>
            </div>
          </Card>

          {/* Week's Predictions */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.weekPredictions}</h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600">Last 7 days</span>
            </div>
          </Card>
        </div>

        {/* Feature Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sprout className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Crop Recommendations</p>
                <h4 className="text-2xl font-bold">{stats.cropRecommendations}</h4>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{
                  width: `${(stats.cropRecommendations / stats.totalPredictions) * 100}%`,
                }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bug className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Disease Detections</p>
                <h4 className="text-2xl font-bold">{stats.diseaseDetections}</h4>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${(stats.diseaseDetections / stats.totalPredictions) * 100}%`,
                }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Beaker className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Fertilizer Guides</p>
                <h4 className="text-2xl font-bold">{stats.fertilizerRecommendations}</h4>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(stats.fertilizerRecommendations / stats.totalPredictions) * 100}%`,
                }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Yield Predictions</p>
                <h4 className="text-2xl font-bold">{stats.yieldPredictions}</h4>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${(stats.yieldPredictions / stats.totalPredictions) * 100}%`,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Recent Predictions */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Predictions</h2>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="crop">Crop</TabsTrigger>
              <TabsTrigger value="disease">Disease</TabsTrigger>
              <TabsTrigger value="fertilizer">Fertilizer</TabsTrigger>
              <TabsTrigger value="yield">Yield</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-4">
                {recentPredictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className={`p-4 rounded-lg border-2 ${getPredictionColor(prediction.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getPredictionIcon(prediction.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold capitalize">{prediction.type}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(prediction.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {prediction.type === 'crop' && (
                              <span>Recommended: {getDetailValue(prediction.details, 'recommended_crop')}</span>
                            )}
                            {prediction.type === 'disease' && (
                              <span>Detected: {getDetailValue(prediction.details, 'disease_name')}</span>
                            )}
                            {prediction.type === 'fertilizer' && (
                              <span>Recommended: {getDetailValue(prediction.details, 'recommended_fertilizer')}</span>
                            )}
                            {prediction.type === 'yield' && (
                              <span>
                                {getDetailValue(prediction.details, 'crop_item')}: {getDetailValue(prediction.details, 'predicted_yield')} kg/ha
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {prediction.details.confidence_score && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Confidence</p>
                          <p className="font-semibold">
                            {(Number(prediction.details.confidence_score) * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {['crop', 'disease', 'fertilizer', 'yield'].map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-4">
                  {recentPredictions
                    .filter((p) => p.type === type)
                    .map((prediction) => (
                      <div
                        key={prediction.id}
                        className={`p-4 rounded-lg border-2 ${getPredictionColor(prediction.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getPredictionIcon(prediction.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold capitalize">{prediction.type}</span>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(prediction.created_at), 'MMM dd, yyyy HH:mm')}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {prediction.type === 'crop' && (
                                  <span>Recommended: {prediction.details.recommended_crop}</span>
                                )}
                                {prediction.type === 'disease' && (
                                  <span>Detected: {prediction.details.disease_name}</span>
                                )}
                                {prediction.type === 'fertilizer' && (
                                  <span>Recommended: {prediction.details.recommended_fertilizer}</span>
                                )}
                                {prediction.type === 'yield' && (
                                  <span>
                                    {prediction.details.crop_item}: {prediction.details.predicted_yield} kg/ha
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {prediction.details.confidence_score && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Confidence</p>
                              <p className="font-semibold">
                                {(prediction.details.confidence_score * 100).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
