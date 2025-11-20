"""
Additional API routes for crop yield prediction and fertilizer recommendation
"""

import numpy as np
import pandas as pd
from flask import request, jsonify
from datetime import datetime

def add_yield_prediction_route(app, models, supabase=None):
    """Add crop yield prediction route"""
    
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
            area = float(data['Area'])
            item = data['Item']
            user_id = data.get('user_id')
            
            # Prepare features (matching the order from training)
            features = np.array([[year, rainfall, pesticides, temp, area, item]], dtype=object)
            
            # Transform features
            transformed_features = models['yield_preprocessor'].transform(features)
            
            # Make prediction
            prediction = models['yield_model'].predict(transformed_features)
            predicted_yield = float(prediction[0])
            
            # Save to Supabase if available
            if supabase and user_id:
                try:
                    supabase.table('crop_yield_predictions').insert({
                        'user_id': user_id,
                        'year': year,
                        'rainfall': rainfall,
                        'pesticides_used': pesticides,
                        'temperature': temp,
                        'area': area,
                        'crop_type': item,
                        'predicted_yield': predicted_yield,
                        'created_at': datetime.now().isoformat()
                    }).execute()
                except Exception as e:
                    print(f"Error saving to database: {e}")
            
            return jsonify({
                'success': True,
                'predicted_yield': predicted_yield,
                'crop_type': item,
                'area': area,
                'yield_per_hectare': predicted_yield / area if area > 0 else 0,
                'message': f'Predicted yield for {item}: {predicted_yield:.2f} tons',
                'factors': {
                    'year': year,
                    'rainfall': rainfall,
                    'pesticides_used': pesticides,
                    'temperature': temp
                }
            })
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

def add_fertilizer_recommendation_route(app, models, supabase=None):
    """Add fertilizer recommendation route"""
    
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
            
            # Save to Supabase if available
            if supabase and user_id:
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
                        'confidence': confidence,
                        'advice': fertilizer_advice,
                        'created_at': datetime.now().isoformat()
                    }).execute()
                except Exception as e:
                    print(f"Error saving to database: {e}")
            
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