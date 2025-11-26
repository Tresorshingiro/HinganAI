import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { dashboardService } from '@/lib/database'
import type { DashboardStats } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind,
  Eye,
  Gauge,
  Sprout,
  Bug,
  Leaf,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Calendar,
  MapPin
} from 'lucide-react'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  pressure: number
  visibility: number
  description: string
  icon: string
  location: string
}

const quickActions = [
  {
    title: 'Crop Recommendation',
    description: 'Get AI-powered crop suggestions based on your soil and climate',
    icon: Sprout,
    href: '/dashboard/crop-recommendation',
    color: 'bg-emerald-500'
  },
  {
    title: 'Disease Detection',
    description: 'Upload crop images to detect diseases and get treatment advice',
    icon: Bug,
    href: '/dashboard/disease-detection',
    color: 'bg-red-500'
  },
  {
    title: 'Fertilizer Guide',
    description: 'Optimize your fertilizer usage with smart recommendations',
    icon: Leaf,
    href: '/dashboard/fertilizer',
    color: 'bg-green-500'
  },
  {
    title: 'Yield Prediction',
    description: 'Forecast your crop yields based on current conditions',
    icon: BarChart3,
    href: '/dashboard/yield-prediction',
    color: 'bg-blue-500'
  }
]

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [weatherError, setWeatherError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      
      try {
        const [dashboardStats] = await Promise.all([
          dashboardService.getStats(user.id),
          fetchWeatherData()
        ])
        setStats(dashboardStats)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const fetchWeatherData = async () => {
    try {
      // Use the weather service to get real weather data
      const { weatherService } = await import('../lib/weather-service')
      
      // Get weather for Kigali by default
      const data = await weatherService.getCurrentWeatherByCity('Kigali')
      
      setWeather({
        temperature: data.temperature,
        humidity: data.humidity,
        windSpeed: Math.round(data.wind_speed * 3.6), // Convert m/s to km/h
        pressure: data.pressure,
        visibility: data.visibility,
        description: data.weather_description,
        icon: data.weather_icon,
        location: data.location
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching weather:', error)
      setWeatherError('Unable to fetch weather data')
      // Fallback to mock data if API fails
      setWeather({
        temperature: 24,
        humidity: 65,
        windSpeed: 12,
        pressure: 1013,
        visibility: 10,
        description: 'Partly cloudy',
        icon: '02d',
        location: 'Kigali, Rwanda'
      })
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {profile?.full_name || user?.email?.split('@')[0] || 'Farmer'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome to your HinganAI farming dashboard. Let's make your farming smarter today.
            </p>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              {profile?.farm_location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {profile.farm_location}
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <Sprout className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Recommendations</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.total_recommendations}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-full">
                <Sprout className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disease Detections</p>
                <p className="text-2xl font-bold text-red-600">{stats.total_detections}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <Bug className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Yield Predictions</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_predictions}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Conversations</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total_messages}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Weather Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="h-5 w-5 mr-2 text-blue-500" />
            Current Weather
          </CardTitle>
          <CardDescription>Local weather conditions for better farming decisions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : weatherError ? (
            <div className="text-red-500 text-center py-8">
              <p>{weatherError}</p>
              <p className="text-sm text-gray-500 mt-2">
                Configure OpenWeatherMap API key in backend/.env to see live weather data
              </p>
            </div>
          ) : weather ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-600">{weather.location}</span>
                </div>
                <Badge variant="secondary">{weather.description}</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Thermometer className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold">{weather.temperature}°C</div>
                  <div className="text-sm text-gray-500">Temperature</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{weather.humidity}%</div>
                  <div className="text-sm text-gray-500">Humidity</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Wind className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold">{weather.windSpeed} km/h</div>
                  <div className="text-sm text-gray-500">Wind Speed</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Gauge className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">{weather.pressure} hPa</div>
                  <div className="text-sm text-gray-500">Pressure</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{weather.visibility} km</div>
                  <div className="text-sm text-gray-500">Visibility</div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link to={action.href}>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-emerald-50 group-hover:border-emerald-300"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Assistant Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <MessageSquare className="h-5 w-5 mr-2" />
            AI Farming Assistant
          </CardTitle>
          <CardDescription className="text-blue-700">
            Have questions about farming? Chat with our AI assistant for instant help and advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/dashboard/chatbot">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Start Conversation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your farming insights and recommendations history</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_activity.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'crop' ? 'bg-emerald-100' :
                    activity.type === 'disease' ? 'bg-red-100' :
                    activity.type === 'yield' ? 'bg-blue-100' :
                    activity.type === 'fertilizer' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'crop' && <Sprout className="h-4 w-4 text-emerald-600" />}
                    {activity.type === 'disease' && <Bug className="h-4 w-4 text-red-600" />}
                    {activity.type === 'yield' && <BarChart3 className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'fertilizer' && <Leaf className="h-4 w-4 text-green-600" />}
                    {activity.type === 'chat' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity yet.</p>
              <p className="text-sm mt-2">Start using our AI tools to see your farming insights here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}