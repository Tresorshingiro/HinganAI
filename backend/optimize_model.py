"""
Script to optimize and compress the disease detection model
Reduces model size from 137MB to ~10-20MB
"""
import tensorflow as tf
from tensorflow import keras
import numpy as np
import os

def optimize_model(input_model_path, output_model_path):
    """
    Optimize the model using TensorFlow Lite for smaller size
    """
    print(f"Loading model from: {input_model_path}")
    model = keras.models.load_model(input_model_path)
    
    # Get original model info
    original_size = os.path.getsize(input_model_path) / (1024 * 1024)  # MB
    print(f"Original model size: {original_size:.2f} MB")
    print(f"Model summary:")
    model.summary()
    
    # Method 1: Save with optimized format (HDF5 compressed)
    print("\n=== Method 1: Optimized H5 Format ===")
    output_h5 = output_model_path.replace('.h5', '_optimized.h5')
    model.save(output_h5, save_format='h5', include_optimizer=False)
    h5_size = os.path.getsize(output_h5) / (1024 * 1024)
    print(f"Optimized H5 size: {h5_size:.2f} MB")
    
    # Method 2: Convert to TensorFlow Lite (smallest)
    print("\n=== Method 2: TensorFlow Lite (Smallest) ===")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Enable optimizations
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    # Optional: Use float16 quantization for even smaller size
    converter.target_spec.supported_types = [tf.float16]
    
    tflite_model = converter.convert()
    
    # Save the TFLite model
    tflite_path = output_model_path.replace('.h5', '.tflite')
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    
    tflite_size = os.path.getsize(tflite_path) / (1024 * 1024)
    print(f"TFLite model size: {tflite_size:.2f} MB")
    
    # Method 3: SavedModel format (for TF Serving - optional)
    print("\n=== Method 3: SavedModel Format ===")
    saved_model_dir = output_model_path.replace('.h5', '_saved_model')
    model.save(saved_model_dir, save_format='tf', include_optimizer=False)
    
    # Calculate SavedModel directory size
    saved_model_size = sum(
        os.path.getsize(os.path.join(dirpath, filename))
        for dirpath, _, filenames in os.walk(saved_model_dir)
        for filename in filenames
    ) / (1024 * 1024)
    print(f"SavedModel size: {saved_model_size:.2f} MB")
    
    print("\n=== Optimization Complete ===")
    print(f"Original:     {original_size:.2f} MB")
    print(f"Optimized H5: {h5_size:.2f} MB (reduction: {(1 - h5_size/original_size)*100:.1f}%)")
    print(f"TFLite:       {tflite_size:.2f} MB (reduction: {(1 - tflite_size/original_size)*100:.1f}%)")
    print(f"SavedModel:   {saved_model_size:.2f} MB")
    
    print("\n=== Recommendations ===")
    if tflite_size < 50:
        print(f"✅ RECOMMENDED: Use TFLite model ({tflite_path})")
        print("   - Smallest size, fast inference")
        print("   - Perfect for production deployment")
        print("   - Can be pushed to GitHub")
    elif h5_size < 100:
        print(f"✅ RECOMMENDED: Use optimized H5 ({output_h5})")
        print("   - Good size reduction")
        print("   - Easy to use with Keras")
        print("   - Can be pushed to GitHub")
    else:
        print("⚠️  Model still too large for GitHub")
        print("   Consider using Git LFS or hosting model separately")
    
    return {
        'original_path': input_model_path,
        'optimized_h5': output_h5,
        'tflite': tflite_path,
        'saved_model_dir': saved_model_dir,
        'sizes': {
            'original': original_size,
            'optimized_h5': h5_size,
            'tflite': tflite_size,
            'saved_model': saved_model_size
        }
    }


def test_optimized_model(tflite_path, test_image_path):
    """
    Test the TFLite model to ensure it works correctly
    """
    print("\n=== Testing TFLite Model ===")
    
    # Load TFLite model
    interpreter = tf.lite.Interpreter(model_path=tflite_path)
    interpreter.allocate_tensors()
    
    # Get input and output details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print(f"Input shape: {input_details[0]['shape']}")
    print(f"Output shape: {output_details[0]['shape']}")
    
    # Load and preprocess test image
    from tensorflow.keras.preprocessing.image import load_img, img_to_array
    img = load_img(test_image_path, target_size=(225, 225))
    x = img_to_array(img)
    x = x.astype('float32') / 255.0
    x = np.expand_dims(x, axis=0)
    
    # Run inference
    interpreter.set_tensor(input_details[0]['index'], x)
    interpreter.invoke()
    predictions = interpreter.get_tensor(output_details[0]['index'])
    
    # Get class labels
    labels = {0: 'Healthy', 1: 'Powdery', 2: 'Rust'}
    predicted_class = labels[np.argmax(predictions[0])]
    confidence = np.max(predictions[0]) * 100
    
    print(f"\nPrediction: {predicted_class}")
    print(f"Confidence: {confidence:.2f}%")
    print(f"All probabilities: {predictions[0]}")
    
    return predicted_class, confidence


if __name__ == "__main__":
    # Paths
    input_model = "models/model.h5"
    output_model = "models/model.h5"
    
    # Check if input model exists
    if not os.path.exists(input_model):
        print(f"Error: Model not found at {input_model}")
        exit(1)
    
    # Optimize the model
    results = optimize_model(input_model, output_model)
    
    # Test with a sample image
    test_image = "Dataset/Test/Test/Rust/82add70df6ab2854.jpg"
    if os.path.exists(test_image):
        test_optimized_model(results['tflite'], test_image)
    else:
        print(f"\n⚠️  Test image not found: {test_image}")
        print("Skipping model testing")
    
    print("\n=== Next Steps ===")
    print("1. Update app.py to use the TFLite model")
    print("2. Replace model.h5 with model.tflite in your code")
    print("3. Delete the original large model.h5")
    print("4. Commit and push to GitHub")
