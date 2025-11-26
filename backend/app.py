import os
import numpy as np
import pandas as pd
import pickle
import requests
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS configuration - allow frontend origins
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8081",
    "https://hingan-ai.vercel.app",  # Production frontend
    "https://hingan-ai-*.vercel.app"  # Preview deployments
]

CORS(app, 
     origins=allowed_origins,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
if supabase_url and supabase_key:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Supabase client initialized")
else:
    supabase = None
    print("⚠️ Supabase not configured")

# Model paths
MODEL_PATHS = {
    'crop_recommendation': 'models/model.pkl',
    'crop_scaler': 'models/standscaler.pkl',
    'crop_minmax': 'models/minmaxscaler.pkl',
    'disease_detection': 'models/model.tflite',  # Changed to TFLite
    'crop_yield': 'models/dtr.pkl',
    'crop_yield_preprocessor': 'models/preprocesser.pkl',
    'fertilizer': 'models/fertilizer_model.pkl',
    'fertilizer_info': 'models/fertilizer_model_info.pkl'
}

# Load ML models
models = {}

def load_models():
    """Load all ML models"""
    try:
        print("Loading ML models...")
        
        # Crop recommendation model
        if os.path.exists(MODEL_PATHS['crop_recommendation']):
            models['crop_model'] = pickle.load(open(MODEL_PATHS['crop_recommendation'], 'rb'))
            models['crop_scaler'] = pickle.load(open(MODEL_PATHS['crop_scaler'], 'rb'))
            models['crop_minmax'] = pickle.load(open(MODEL_PATHS['crop_minmax'], 'rb'))
            print("✅ Crop recommendation model loaded")
        
        # Disease detection model (TFLite)
        if os.path.exists(MODEL_PATHS['disease_detection']):
            models['disease_interpreter'] = tf.lite.Interpreter(model_path=MODEL_PATHS['disease_detection'])
            models['disease_interpreter'].allocate_tensors()
            models['disease_input_details'] = models['disease_interpreter'].get_input_details()
            models['disease_output_details'] = models['disease_interpreter'].get_output_details()
            print("✅ Disease detection model (TFLite) loaded")
        
        # Crop yield prediction model
        if os.path.exists(MODEL_PATHS['crop_yield']):
            models['yield_model'] = pickle.load(open(MODEL_PATHS['crop_yield'], 'rb'))
            models['yield_preprocessor'] = pickle.load(open(MODEL_PATHS['crop_yield_preprocessor'], 'rb'))
            print("✅ Crop yield prediction model loaded")
        
        # Fertilizer recommendation model
        if os.path.exists(MODEL_PATHS['fertilizer']):
            models['fertilizer_model'] = pickle.load(open(MODEL_PATHS['fertilizer'], 'rb'))
            if os.path.exists(MODEL_PATHS['fertilizer_info']):
                models['fertilizer_info'] = pickle.load(open(MODEL_PATHS['fertilizer_info'], 'rb'))
            print("✅ Fertilizer recommendation model loaded")
        
        print(f"Loaded {len(models)} models successfully!")
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")

# Load models on startup
load_models()

# Constants
CROP_DICT = {
    1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya", 7: "Orange",
    8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
    14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 18: "Mothbeans",
    19: "Pigeonpeas", 20: "Kidneybeans", 21: "Chickpea", 22: "Coffee"
}

DISEASE_LABELS = {0: 'Healthy', 1: 'Powdery', 2: 'Rust'}

# API Routes

@app.route('/health')
def health():
    """Health check endpoint for Render"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/')
def home():
    return jsonify({
        "message": "🌾 HinganAI Agriculture Platform API",
        "version": "1.0.0",
        "status": "active",
        "models_loaded": list(models.keys()),
        "endpoints": {
            "crop_recommendation": "POST /api/crop-recommendation",
            "disease_detection": "POST /api/disease-detection", 
            "crop_yield_prediction": "POST /api/crop-yield-prediction",
            "fertilizer_recommendation": "POST /api/fertilizer-recommendation",
            "weather": "GET /api/weather/<location>",
            "user_history": "GET /api/user/history/<user_id>"
        }
    })

@app.route('/api/crop-recommendation', methods=['POST'])
def predict_crop():
    """Predict the best crop based on soil and climate conditions"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        # Extract features
        N = float(data['nitrogen'])
        P = float(data['phosphorus'])
        K = float(data['potassium'])
        temp = float(data['temperature'])
        humidity = float(data['humidity'])
        ph = float(data['ph'])
        rainfall = float(data['rainfall'])
        user_id = data.get('user_id')
        
        # Check if model is loaded
        if 'crop_model' not in models:
            return jsonify({'success': False, 'error': 'Crop recommendation model not available'}), 500
        
        # Prepare features for prediction
        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)
        
        # Apply scaling
        mx_features = models['crop_minmax'].transform(single_pred)
        sc_mx_features = models['crop_scaler'].transform(mx_features)
        
        # Make prediction
        prediction = models['crop_model'].predict(sc_mx_features)
        confidence = models['crop_model'].predict_proba(sc_mx_features).max()
        
        # Get recommended crop
        if prediction[0] in CROP_DICT:
            recommended_crop = CROP_DICT[prediction[0]]
            
            # Save to Supabase if available and user_id provided (with retry)
            if supabase and user_id:
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        supabase.table('crop_recommendations').insert({
                            'user_id': user_id,
                            'nitrogen': N,
                            'phosphorus': P,
                            'potassium': K,
                            'temperature': temp,
                            'humidity': humidity,
                            'ph_level': ph,
                            'rainfall': rainfall,
                            'recommended_crop': recommended_crop,
                            'confidence_score': float(confidence),
                            'created_at': datetime.now().isoformat()
                        }).execute()
                        print(f"✅ Crop recommendation saved to database for user {user_id}")
                        break
                    except Exception as e:
                        if attempt < max_retries - 1:
                            print(f"⚠️ Database save attempt {attempt + 1} failed: {e}. Retrying...")
                            time.sleep(1)
                        else:
                            print(f"❌ Error saving to database after {max_retries} attempts: {e}")
            
            return jsonify({
                'success': True,
                'recommended_crop': recommended_crop,
                'confidence': float(confidence),
                'message': f'{recommended_crop} is the best crop for these conditions',
                'advice': f'Based on your soil conditions (N:{N}, P:{P}, K:{K}) and climate (temp:{temp}°C, humidity:{humidity}%, pH:{ph}, rainfall:{rainfall}mm), {recommended_crop} is recommended with {confidence:.1%} confidence.'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Could not determine the best crop with the provided data.'
            })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/disease-detection', methods=['POST'])
def detect_disease():
    """Detect plant diseases from uploaded images"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        user_id = request.form.get('user_id')
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if 'disease_interpreter' not in models:
            return jsonify({'success': False, 'error': 'Disease detection model not available'}), 500
            
        if file:
            # Save uploaded file
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            try:
                # Process image and make prediction with TFLite
                img = load_img(file_path, target_size=(225, 225))
                x = img_to_array(img)
                x = x.astype('float32') / 255.0
                x = np.expand_dims(x, axis=0)
                
                # Run TFLite inference
                interpreter = models['disease_interpreter']
                input_details = models['disease_input_details']
                output_details = models['disease_output_details']
                
                interpreter.set_tensor(input_details[0]['index'], x)
                interpreter.invoke()
                predictions = interpreter.get_tensor(output_details[0]['index'])[0]
                
                predicted_class = np.argmax(predictions)
                confidence = float(predictions[predicted_class])
                disease = DISEASE_LABELS[predicted_class]
                
                # Generate treatment advice
                treatment_data = get_treatment_advice(disease)
                
                # Save to Supabase if available (with retry for network issues)
                if supabase and user_id:
                    max_retries = 3
                    for attempt in range(max_retries):
                        try:
                            supabase.table('disease_detections').insert({
                                'user_id': user_id,
                                'detected_disease': disease,
                                'confidence_score': confidence,
                                'created_at': datetime.now().isoformat()
                            }).execute()
                            print(f"✅ Disease detection saved to database for user {user_id}")
                            break
                        except Exception as e:
                            if attempt < max_retries - 1:
                                print(f"⚠️ Database save attempt {attempt + 1} failed: {e}. Retrying...")
                                time.sleep(1)  # Wait 1 second before retry
                            else:
                                print(f"❌ Error saving to database after {max_retries} attempts: {e}")
                
                return jsonify({
                    'success': True,
                    'disease': disease,
                    'confidence': confidence,
                    'treatment_advice': treatment_data['advice'],
                    'recommended_products': treatment_data['products'],
                    'prevention_tips': treatment_data['prevention'],
                    'severity': get_severity_level(confidence, disease)
                })
                
            finally:
                # Clean up uploaded file
                if os.path.exists(file_path):
                    os.remove(file_path)
                    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Utility functions

def get_treatment_advice(disease):
    """Generate treatment advice based on detected disease"""
    treatments = {
        'Healthy': {
            'advice': 'Your plant appears healthy! Continue with regular care and monitoring.',
            'products': [
                {'name': 'Balanced NPK Fertilizer', 'type': 'Preventive', 'application': 'Apply as per crop requirements'}
            ],
            'prevention': [
                'Maintain proper plant spacing for air circulation',
                'Water early in the day to allow leaves to dry',
                'Remove any dead or diseased plant material',
                'Monitor plants regularly for early disease detection'
            ]
        },
        'Powdery': {
            'advice': 'Powdery mildew detected. This fungal disease appears as white powdery spots on leaves. Treat immediately to prevent spread.',
            'products': [
                {'name': 'Sulfur-based Fungicide', 'type': 'Fungicide', 'application': 'Spray on affected areas, repeat every 7-14 days'},
                {'name': 'Neem Oil', 'type': 'Organic', 'application': 'Mix with water and spray weekly'},
                {'name': 'Baking Soda Solution', 'type': 'Home Remedy', 'application': '1 tablespoon per gallon of water, spray leaves'}
            ],
            'prevention': [
                'Improve air circulation around plants',
                'Avoid overhead watering',
                'Remove and destroy infected plant parts',
                'Apply preventive fungicide during humid conditions',
                'Plant resistant varieties when available'
            ]
        },
        'Rust': {
            'advice': 'Rust disease detected. This fungal infection causes orange-brown pustules on leaves. Early treatment is crucial.',
            'products': [
                {'name': 'Copper-based Fungicide', 'type': 'Fungicide', 'application': 'Apply every 7-10 days until symptoms disappear'},
                {'name': 'Mancozeb', 'type': 'Fungicide', 'application': 'Spray thoroughly covering all leaf surfaces'},
                {'name': 'Triazole Fungicides', 'type': 'Systemic', 'application': 'Follow manufacturer instructions'}
            ],
            'prevention': [
                'Remove infected leaves immediately',
                'Avoid working with plants when wet',
                'Ensure good drainage',
                'Space plants properly for air flow',
                'Rotate crops annually',
                'Use disease-free seeds and transplants'
            ]
        }
    }
    
    default = {
        'advice': 'Disease detected. Consult with agricultural extension services for proper diagnosis and treatment.',
        'products': [],
        'prevention': ['Maintain good plant hygiene', 'Monitor plants regularly']
    }
    
    return treatments.get(disease, default)

def get_severity_level(confidence, disease):
    """Determine severity level based on confidence and disease type"""
    if disease == 'Healthy':
        return 'Good'
    elif confidence > 0.8:
        return 'High' if disease in ['Powdery', 'Rust'] else 'Medium'
    elif confidence > 0.6:
        return 'Medium'
    else:
        return 'Low'

# Add crop yield and fertilizer routes
@app.route('/api/crop-yield-prediction', methods=['POST'])
def predict_crop_yield():
    """Predict crop yield based on various factors"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['Year', 'average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp', 'Area', 'Item']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        if 'yield_model' not in models:
            return jsonify({'success': False, 'error': 'Crop yield model not available'}), 500
        
        # Extract features
        year = int(data['Year'])
        rainfall = float(data['average_rain_fall_mm_per_year'])
        pesticides = float(data['pesticides_tonnes'])
        temp = float(data['avg_temp'])
        area = data['Area']  # This is country name (string), not a number
        item = data['Item']
        user_id = data.get('user_id')
        
        # Prepare features (matching the order from training)
        features = np.array([[year, rainfall, pesticides, temp, area, item]], dtype=object)
        
        # Transform features
        transformed_features = models['yield_preprocessor'].transform(features)
        
        # Make prediction
        prediction = models['yield_model'].predict(transformed_features)
        predicted_yield = float(prediction[0])
        
        # Save to Supabase if available (with retry)
        if supabase and user_id:
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    supabase.table('yield_predictions').insert({
                        'user_id': user_id,
                        'year': year,
                        'average_rainfall': rainfall,
                        'pesticides_usage': pesticides,
                        'average_temperature': temp,
                        'area': area,
                        'crop_item': item,
                        'predicted_yield': predicted_yield,
                        'created_at': datetime.now().isoformat()
                    }).execute()
                    print(f"✅ Yield prediction saved to database for user {user_id}")
                    break
                except Exception as e:
                    if attempt < max_retries - 1:
                        print(f"⚠️ Database save attempt {attempt + 1} failed: {e}. Retrying...")
                        time.sleep(1)
                    else:
                        print(f"❌ Error saving to database after {max_retries} attempts: {e}")
        
        return jsonify({
            'success': True,
            'predicted_yield': predicted_yield,
            'crop_type': item,
            'area': area,
            'message': f'Predicted yield for {item} in {area}: {predicted_yield:.2f} hg/ha',
            'factors': {
                'year': year,
                'rainfall': rainfall,
                'pesticides_used': pesticides,
                'temperature': temp,
                'country': area
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/fertilizer-recommendation', methods=['POST'])
def recommend_fertilizer():
    """Recommend fertilizer based on soil conditions and crop type"""
    try:
        data = request.get_json()
        
        # Validate required fields (matching the fertilizer model training data)
        required_fields = ['Temparature', 'Humidity ', 'Moisture', 'Soil Type', 'Crop Type', 'Nitrogen', 'Potassium', 'Phosphorous']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        if 'fertilizer_model' not in models:
            return jsonify({'success': False, 'error': 'Fertilizer model not available'}), 500
        
        user_id = data.get('user_id')
        
        # Prepare input data for prediction (matching exact column names from training)
        input_data = pd.DataFrame([{
            'Temparature': float(data['Temparature']),
            'Humidity ': float(data['Humidity ']),  # Note the space after Humidity
            'Moisture': float(data['Moisture']),
            'Soil Type': data['Soil Type'],
            'Crop Type': data['Crop Type'],
            'Nitrogen': float(data['Nitrogen']),
            'Potassium': float(data['Potassium']),
            'Phosphorous': float(data['Phosphorous'])
        }])
        
        # Make prediction
        predicted_fertilizer = models['fertilizer_model'].predict(input_data)[0]
        
        # Get prediction probability for confidence
        prediction_proba = models['fertilizer_model'].predict_proba(input_data)[0]
        confidence = float(np.max(prediction_proba))
        
        # Get fertilizer advice
        fertilizer_advice = get_fertilizer_advice(predicted_fertilizer, data)
        
        # Save to Supabase if available (with retry)
        if supabase and user_id:
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    supabase.table('fertilizer_recommendations').insert({
                        'user_id': user_id,
                        'temperature': float(data['Temparature']),
                        'humidity': float(data['Humidity ']),
                        'moisture': float(data['Moisture']),
                        'soil_type': data['Soil Type'],
                        'crop_type': data['Crop Type'],
                        'nitrogen': float(data['Nitrogen']),
                        'potassium': float(data['Potassium']),
                        'phosphorous': float(data['Phosphorous']),
                        'recommended_fertilizer': predicted_fertilizer,
                        'confidence_score': confidence,
                        'created_at': datetime.now().isoformat()
                    }).execute()
                    print(f"✅ Fertilizer recommendation saved to database for user {user_id}")
                    break
                except Exception as e:
                    if attempt < max_retries - 1:
                        print(f"⚠️ Database save attempt {attempt + 1} failed: {e}. Retrying...")
                        time.sleep(1)
                    else:
                        print(f"❌ Error saving to database after {max_retries} attempts: {e}")
        
        return jsonify({
            'success': True,
            'recommended_fertilizer': predicted_fertilizer,
            'confidence': confidence,
            'advice': fertilizer_advice,
            'soil_analysis': {
                'nitrogen': float(data['Nitrogen']),
                'phosphorous': float(data['Phosphorous']),
                'potassium': float(data['Potassium']),
                'soil_type': data['Soil Type'],
                'moisture': float(data['Moisture'])
            },
            'conditions': {
                'temperature': float(data['Temparature']),
                'humidity': float(data['Humidity ']),
                'crop_type': data['Crop Type']
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/weather/<location>')
def get_weather(location):
    """Get weather information for a location"""
    try:
        api_key = os.getenv('OPENWEATHER_API_KEY')
        if not api_key:
            return jsonify({'success': False, 'error': 'Weather API key not configured'}), 500
            
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'success': True,
                'location': data['name'],
                'country': data['sys']['country'],
                'temperature': data['main']['temp'],
                'feels_like': data['main']['feels_like'],
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'description': data['weather'][0]['description'].title(),
                'icon': data['weather'][0]['icon'],
                'wind_speed': data['wind']['speed'],
                'wind_direction': data['wind'].get('deg', 0),
                'visibility': data.get('visibility', 0) / 1000,  # Convert to km
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': 'Location not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user/history/<user_id>')
def get_user_history(user_id):
    """Get user's prediction and recommendation history"""
    try:
        if not supabase:
            return jsonify({'success': False, 'error': 'Database not configured'}), 500
        
        history = {}
        
        # Get crop recommendations
        try:
            crops = supabase.table('crop_recommendations').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute()
            history['crop_recommendations'] = crops.data
        except:
            history['crop_recommendations'] = []
        
        # Get disease detections
        try:
            diseases = supabase.table('disease_detections').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute()
            history['disease_detections'] = diseases.data
        except:
            history['disease_detections'] = []
        
        # Get fertilizer recommendations
        try:
            fertilizers = supabase.table('fertilizer_recommendations').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute()
            history['fertilizer_recommendations'] = fertilizers.data
        except:
            history['fertilizer_recommendations'] = []
        
        # Get yield predictions
        try:
            yields = supabase.table('crop_yield_predictions').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute()
            history['crop_yield_predictions'] = yields.data
        except:
            history['crop_yield_predictions'] = []
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'history': history,
            'total_records': sum(len(v) for v in history.values())
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def get_fertilizer_advice(fertilizer, input_data):
    """Generate detailed fertilizer application advice"""
    fertilizer_info = {
        'Urea': {
            'description': 'High nitrogen fertilizer (46% N)',
            'usage': 'Promotes vegetative growth and leaf development',
            'application': 'Apply before planting or during early growth stages'
        },
        'DAP': {
            'description': 'Diammonium Phosphate (18% N, 46% P)',
            'usage': 'Excellent for root development and early plant growth',
            'application': 'Apply at planting time for best results'
        },
        '14-35-14': {
            'description': 'Balanced fertilizer with high phosphorus',
            'usage': 'Good for flowering and fruit development',
            'application': 'Apply during flowering stage'
        },
        '28-28': {
            'description': 'Equal nitrogen and phosphorus',
            'usage': 'Balanced nutrition for overall plant health',
            'application': 'Can be used throughout growing season'
        },
        '17-17-17': {
            'description': 'Complete balanced fertilizer',
            'usage': 'All-purpose nutrition for healthy growth',
            'application': 'Suitable for most crops and growth stages'
        },
        '20-20': {
            'description': 'High nitrogen-phosphorus blend',
            'usage': 'Promotes both vegetative and root growth',
            'application': 'Best for early to mid-season application'
        },
        '10-26-26': {
            'description': 'Low nitrogen, high phosphorus and potassium',
            'usage': 'Excellent for fruit and flower development',
            'application': 'Apply during reproductive stages'
        }
    }
    
    base_info = fertilizer_info.get(fertilizer, {
        'description': f'{fertilizer} fertilizer',
        'usage': 'Follow manufacturer guidelines',
        'application': 'Apply according to crop requirements'
    })
    
    advice = f"🌾 Recommended Fertilizer: {fertilizer}\n\n"
    advice += f"📋 Description: {base_info['description']}\n"
    advice += f"🎯 Usage: {base_info['usage']}\n"
    advice += f"⏰ Application: {base_info['application']}\n\n"
    
    # Add specific advice based on soil conditions
    nitrogen = float(input_data['Nitrogen'])
    phosphorous = float(input_data['Phosphorous'])
    potassium = float(input_data['Potassium'])
    
    advice += "📊 Soil Analysis Recommendations:\n"
    
    if nitrogen < 20:
        advice += "• 🔴 Low nitrogen detected - this fertilizer will help boost leaf growth\n"
    elif nitrogen > 50:
        advice += "• 🟡 High nitrogen levels - monitor to prevent excessive vegetative growth\n"
    else:
        advice += "• 🟢 Nitrogen levels are adequate\n"
    
    if phosphorous < 15:
        advice += "• 🔴 Low phosphorus - will improve root development and flowering\n"
    elif phosphorous > 40:
        advice += "• 🟢 Good phosphorus levels - maintain current status\n"
    else:
        advice += "• 🟡 Moderate phosphorus levels\n"
    
    if potassium < 20:
        advice += "• 🔴 Low potassium - will enhance disease resistance and fruit quality\n"
    elif potassium > 50:
        advice += "• 🟢 Excellent potassium levels\n"
    else:
        advice += "• 🟡 Moderate potassium levels\n"
    
    advice += f"\n🌱 Crop: {input_data['Crop Type']} | 🏔️ Soil: {input_data['Soil Type']}\n"
    advice += f"🌡️ Temperature: {input_data['Temparature']}°C | 💧 Humidity: {input_data['Humidity ']}%\n"
    
    return advice

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting HinganAI Agriculture Platform API...")
    print(f"📊 Models loaded: {list(models.keys())}")
    print(f"🔗 Supabase: {'Connected' if supabase else 'Not configured'}")
    print("🌐 Server running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)