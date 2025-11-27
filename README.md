<div align="center">
  # 🌾 HinganAI - AI-Powered Agriculture Platform
  
  **Transform Your Farm with Smart AI Technology**
  
  [![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://hingan-ai.vercel.app/)
  [![Backend](https://img.shields.io/badge/backend-render-blue.svg)](https://hinganai.onrender.com/)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

  [Features](#-features) •
  [Demo](#-live-demo) •
  [Tech Stack](#-tech-stack) •
  [Installation](#-installation) •
  [API Documentation](#-api-documentation) •
  [Contributing](#-contributing)

</div>

---

## 📖 About

HinganAI is an intelligent agricultural platform that leverages machine learning to help farmers make data-driven decisions. The platform provides four core AI-powered features: crop recommendations, disease detection, fertilizer optimization, and yield prediction.

Built for modern farmers in Rwanda and East Africa, HinganAI combines cutting-edge ML models with an intuitive interface to maximize crop yields, reduce costs, and promote sustainable farming practices.

---

## ✨ Features

### 🌱 Smart Crop Recommendation
- AI-powered crop suggestions based on soil composition (N, P, K levels)
- Climate and environmental factor analysis (temperature, humidity, rainfall, pH)
- Confidence scoring for each recommendation
- Historical tracking of recommendations

### 🔬 Instant Disease Detection
- Upload plant leaf images for instant disease identification
- Detects: Healthy, Powdery Mildew, Rust
- Provides treatment recommendations and confidence scores
- Real-time analysis using TensorFlow Lite models
- Complete prediction history with timestamps

### 🧪 Fertilizer Optimization
- Personalized fertilizer recommendations
- N-P-K (Nitrogen-Phosphorus-Potassium) deficiency analysis
- Crop-specific fertilizer guidance
- Cost-effective recommendations to minimize expenses
- Historical tracking of fertilizer applications

### 📊 Yield Prediction
- Predict crop yields before harvest
- Input: crop type, area, climate data, pesticide usage
- ML-powered forecasting using Decision Tree Regressor
- Historical yield tracking and analytics
- Helps with planning and resource allocation

### 💬 AI Agricultural Chatbot
- Powered by Google Gemini AI
- Expert advice on farming practices
- 24/7 agricultural consultation
- Context-aware responses about crops, pests, and farming techniques

### 🌤️ Weather Dashboard
- Real-time weather data integration (OpenWeatherMap API)
- Location-based forecasts for Rwanda/East Africa
- 5-day weather forecasts
- Farming suitability analysis based on weather conditions

### 👤 User Management
- Secure authentication via Supabase
- Personal dashboard with analytics
- History tracking for all ML predictions
- Profile management

---

## 🎯 Live Demo

- **Frontend**: [https://hingan-ai.vercel.app/](https://hingan-ai.vercel.app/)
- **Backend API**: [https://hinganai.onrender.com/](https://hinganai.onrender.com/)
- **API Health Check**: [https://hinganai.onrender.com/health](https://hinganai.onrender.com/health)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3 + TypeScript
- **Build Tool**: Vite 5.4
- **UI Components**: Radix UI + Shadcn/ui
- **Styling**: TailwindCSS 3.4
- **Animations**: Framer Motion 12
- **State Management**: TanStack Query 5
- **Routing**: React Router 6
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini AI

### Backend
- **Framework**: Flask 2.3
- **Language**: Python 3.11
- **ML Libraries**: 
  - TensorFlow 2.13+ (Disease Detection)
  - Scikit-learn 1.3+ (Crop/Fertilizer/Yield models)
  - Pandas, NumPy (Data processing)
- **Image Processing**: Pillow, OpenCV
- **Database**: Supabase Python Client
- **Server**: Gunicorn
- **CORS**: Flask-CORS
- **Environment**: python-dotenv

### Machine Learning Models
1. **Crop Recommendation**: Random Forest Classifier
2. **Disease Detection**: CNN (TensorFlow Lite optimized)
3. **Fertilizer Recommendation**: Classification model with nutrient analysis
4. **Yield Prediction**: Decision Tree Regressor

### Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Supabase Cloud
- **Version Control**: Git/GitHub

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/bun
- Python 3.11+
- Git
- Supabase account
- Google Gemini API key (optional, for chatbot)
- OpenWeather API key (optional, for weather features)

### 1. Clone the Repository
```bash
git clone https://github.com/Tresorshingiro/HinganAI.git
cd HinganAI
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOL
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
FLASK_SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
EOL

# Run the development server
python app.py
```

Backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
# or
bun install

# Create .env file
cat > .env << EOL
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_WEATHER_API_KEY=your_openweather_api_key
EOL

# Run the development server
npm run dev
# or
bun dev
```

Frontend will start on `http://localhost:5173`

### 4. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Create tables for storing ML predictions

-- Crop Recommendations
CREATE TABLE crop_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  recommended_crop TEXT NOT NULL,
  nitrogen FLOAT,
  phosphorus FLOAT,
  potassium FLOAT,
  temperature FLOAT,
  humidity FLOAT,
  ph FLOAT,
  rainfall FLOAT,
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disease Detections
CREATE TABLE disease_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  disease_name TEXT NOT NULL,
  confidence_score FLOAT,
  treatment_advice TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fertilizer Recommendations
CREATE TABLE fertilizer_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  crop_type TEXT,
  soil_type TEXT,
  nitrogen FLOAT,
  phosphorus FLOAT,
  potassium FLOAT,
  recommended_fertilizer TEXT,
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Yield Predictions
CREATE TABLE yield_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  crop_item TEXT,
  country TEXT,
  area FLOAT,
  average_rainfall FLOAT,
  pesticides_usage FLOAT,
  average_temperature FLOAT,
  predicted_yield FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE yield_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view own crop recommendations" 
  ON crop_recommendations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own disease detections" 
  ON disease_detections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own fertilizer recommendations" 
  ON fertilizer_recommendations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own yield predictions" 
  ON yield_predictions FOR SELECT 
  USING (auth.uid() = user_id);
```

---

## 🔌 API Documentation

### Base URL
```
Production: https://hinganai.onrender.com
Development: http://localhost:5000
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-27T10:30:00.000Z"
}
```

#### 2. Crop Recommendation
```http
POST /api/crop-recommendation
Content-Type: application/json

{
  "nitrogen": 90,
  "phosphorus": 42,
  "potassium": 43,
  "temperature": 20.5,
  "humidity": 82,
  "ph": 6.5,
  "rainfall": 202.5,
  "user_id": "uuid-string"
}
```
**Response:**
```json
{
  "success": true,
  "recommended_crop": "rice",
  "confidence": 0.95,
  "message": "Based on your soil and climate conditions, rice is recommended"
}
```

#### 3. Disease Detection
```http
POST /api/disease-detection
Content-Type: multipart/form-data

file: (image file)
user_id: "uuid-string"
```
**Response:**
```json
{
  "success": true,
  "disease": "Healthy",
  "confidence": 0.98,
  "treatment_advice": "Your crop appears healthy. Continue regular care."
}
```

#### 4. Fertilizer Recommendation
```http
POST /api/fertilizer-recommendation
Content-Type: application/json

{
  "crop": "Wheat",
  "nitrogen": 37,
  "phosphorus": 0,
  "potassium": 0,
  "user_id": "uuid-string"
}
```
**Response:**
```json
{
  "success": true,
  "recommended_fertilizer": "Urea",
  "nitrogen_needed": 20,
  "phosphorus_needed": 40,
  "potassium_needed": 40,
  "advice": "Apply nitrogen fertilizer to meet crop requirements"
}
```

#### 5. Yield Prediction
```http
POST /api/crop-yield-prediction
Content-Type: application/json

{
  "item": "Wheat",
  "year": 2024,
  "country": "Rwanda",
  "area": 100,
  "rainfall": 800,
  "pesticides": 50,
  "temp": 25,
  "user_id": "uuid-string"
}
```
**Response:**
```json
{
  "success": true,
  "predicted_yield": 4523.45,
  "unit": "kg/hectare",
  "message": "Predicted yield calculated successfully"
}
```

---

## 📁 Project Structure

```
HinganAI/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── models/               # ML model files (.pkl, .tflite)
│   ├── data/                 # Training datasets (.csv)
│   ├── notebooks/            # Jupyter notebooks for model training
│   ├── uploads/              # Temporary image uploads
│   └── utils/                # Utility functions
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # React page components
│   │   │   ├── Index.tsx               # Landing page
│   │   │   ├── Login.tsx              # Authentication
│   │   │   ├── Dashboard.tsx          # Main dashboard
│   │   │   ├── CropRecommendation.tsx
│   │   │   ├── DiseaseDetection.tsx
│   │   │   ├── FertilizerGuide.tsx
│   │   │   ├── YieldPrediction.tsx
│   │   │   ├── WeatherDashboard.tsx
│   │   │   └── Chatbot.tsx
│   │   │
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Navigation.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   └── ui/          # Shadcn/ui components
│   │   │
│   │   ├── lib/             # Utilities and services
│   │   │   ├── api.ts              # API client
│   │   │   ├── supabase.ts         # Supabase client
│   │   │   ├── ml-services.ts      # ML API services
│   │   │   ├── weather-service.ts  # Weather API
│   │   │   └── agriculture-chatbot.ts
│   │   │
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.tsx
│   │   │
│   │   └── types/           # TypeScript types
│   │
│   ├── public/              # Static assets
│   ├── package.json         # Node dependencies
│   ├── vercel.json          # Vercel configuration
│   └── vite.config.ts       # Vite configuration
│
├── .gitignore
└── README.md
```

---

## 🚀 Deployment

### Deploy Backend to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn --chdir backend app:app`
   - **Environment Variables**:
     - `SUPABASE_URL`
     - `SUPABASE_KEY` (service role key)
     - `FLASK_SECRET_KEY`
     - `GEMINI_API_KEY`

### Deploy Frontend to Vercel

1. Import project on [Vercel](https://vercel.com)
2. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_BACKEND_URL=https://your-backend.onrender.com`
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GEMINI_API_KEY`
     - `VITE_WEATHER_API_KEY`

3. Deploy!

---

## 🔐 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
FLASK_SECRET_KEY=your_random_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_WEATHER_API_KEY=your_openweather_api_key
```

---

## 🧪 Model Training

The ML models were trained using Jupyter notebooks in `backend/notebooks/`:

- **Crop Recommendation**: `Crop_recommendation_ML.ipynb`
- **Disease Detection**: `Model_Training.ipynb`
- **Fertilizer Prediction**: `fertilizer_Prediction.ipynb`
- **Yield Prediction**: `crop_yield.ipynb`

Datasets are stored in `backend/data/` directory.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Tresor Shingiro**
- GitHub: [@Tresorshingiro](https://github.com/Tresorshingiro)
- Project: [HinganAI](https://github.com/Tresorshingiro/HinganAI)

---

## 🙏 Acknowledgments

- TensorFlow team for ML frameworks
- Supabase for backend infrastructure
- Vercel & Render for hosting
- Radix UI & Shadcn for UI components
- OpenWeatherMap for weather data
- Google Gemini for AI chatbot capabilities

---

## 📞 Support

For support, email tresorshingiro@example.com or open an issue on GitHub.

---

<div align="center">
  <p>Made with ❤️ for farmers in Rwanda and East Africa</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
