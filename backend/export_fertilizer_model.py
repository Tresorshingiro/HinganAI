#!/usr/bin/env python3
"""
Script to train and export the fertilizer prediction model
"""

import numpy as np
import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

def train_and_export_fertilizer_model():
    """Train the fertilizer prediction model and export it"""
    
    print("Loading fertilizer prediction data...")
    # Load the data
    data = pd.read_csv('Fertilizer_Prediction.csv')
    
    print("Data shape:", data.shape)
    print("Fertilizer types:", data['Fertilizer Name'].unique())
    
    # Prepare features and target
    y = data['Fertilizer Name'].copy()
    X = data.drop('Fertilizer Name', axis=1).copy()
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, train_size=0.7, shuffle=True, random_state=42
    )
    
    print(f"Training set: {X_train.shape}")
    print(f"Test set: {X_test.shape}")
    
    # Create preprocessing pipeline
    normal_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(sparse_output=False, handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(transformers=[
        ('normal', normal_transformer, ['Soil Type', 'Crop Type'])
    ], remainder='passthrough')
    
    # Create full model pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5
        ))
    ])
    
    print("Training the fertilizer prediction model...")
    # Train the model
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model trained successfully!")
    print(f"Test Accuracy: {accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Export the model
    model_path = 'models/fertilizer_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"Model exported to: {model_path}")
    
    # Also save the feature names and fertilizer labels for reference
    feature_info = {
        'feature_columns': X.columns.tolist(),
        'soil_types': data['Soil Type'].unique().tolist(),
        'crop_types': data['Crop Type'].unique().tolist(),
        'fertilizer_names': data['Fertilizer Name'].unique().tolist()
    }
    
    info_path = 'models/fertilizer_model_info.pkl'
    with open(info_path, 'wb') as f:
        pickle.dump(feature_info, f)
    
    print(f"Model info exported to: {info_path}")
    
    # Test a sample prediction
    print("\nTesting sample prediction...")
    sample_data = X_test.iloc[:1]
    prediction = model.predict(sample_data)
    print(f"Sample input: {sample_data.iloc[0].to_dict()}")
    print(f"Predicted fertilizer: {prediction[0]}")
    
    return model, feature_info

if __name__ == "__main__":
    train_and_export_fertilizer_model()