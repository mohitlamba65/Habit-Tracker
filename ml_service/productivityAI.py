from flask import Flask, request, jsonify
from joblib import load
import os
import pandas as pd
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "productivity_model.joblib")

# Try to load the model
try:
    model = load(model_path)
    print(f"✅ Model loaded successfully from {model_path}")
except Exception as e:
    print(f"⚠️ Warning: Could not load model: {str(e)}")
    model = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "model_loaded": model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        logs = data.get('logs', [])
        
        if not logs or len(logs) == 0:
            return jsonify({"error": "No logs provided"}), 400
            
        # Handle case when model couldn't be loaded
        if model is None:
            # Use fallback algorithm - find the hour with most logs
            hour_counts = [0] * 24
            for log in logs:
                hour = log.get('start_hour') 
                if hour is not None and 0 <= hour < 24:
                    hour_counts[hour] += 1
            
            # Find peak hours
            max_count = max(hour_counts) if max(hour_counts) > 0 else 1
            
            # Calculate productivity percentages based on activity counts
            productivity_percentages = [min(count / max_count * 100, 100) for count in hour_counts]
            
            # Add some randomness for hours with no data
            for i in range(24):
                if hour_counts[i] == 0:
                    productivity_percentages[i] = 20 + np.random.rand() * 30  # 20-50% for hours with no data
            
            # Smooth the percentages a bit (weighted average with neighbors)
            smoothed_percentages = productivity_percentages.copy()
            for i in range(24):
                prev_idx = (i - 1) % 24
                next_idx = (i + 1) % 24
                smoothed_percentages[i] = (
                    0.2 * productivity_percentages[prev_idx] + 
                    0.6 * productivity_percentages[i] + 
                    0.2 * productivity_percentages[next_idx]
                )
            
            # Find peak hours (top 3)
            peak_indices = np.argsort(smoothed_percentages)[-3:]
            peak_hours = sorted(peak_indices.tolist())
            
            return jsonify({
                "predicted_hours": peak_hours,
                "predicted_times": [f"{h}:00" for h in peak_hours],
                "productivity_percentages": [round(p, 1) for p in smoothed_percentages],
                "method": "fallback"
            })
        
        # Use ML model for prediction
        # Prepare data for model
        df = pd.DataFrame(logs)
        
        # Ensure we have the required columns
        required_cols = ["start_hour", "mood", "duration"]
        for col in required_cols:
            if col not in df.columns:
                df[col] = 1  # Default value
                
        # Rename columns to match model expectations
        df = df.rename(columns={"start_hour": "start_time"})
        
        # Make prediction
        X = df[["start_time", "mood", "duration"]]
        
        # Get productive hours (based on probability of productivity)
        productivity_by_hour = []
        
        # Try different hours of the day and see which are most productive
        for hour in range(24):
            test_data = X.copy()
            test_data["start_time"] = hour
            
            # Predict probability of being productive
            try:
                prob = model.predict_proba(test_data)[:, 1]
                avg_prob = np.mean(prob)
                productivity_by_hour.append((hour, avg_prob * 100))  # Convert to percentage
            except Exception as e:
                print(f"Error predicting for hour {hour}: {str(e)}")
                productivity_by_hour.append((hour, 50))  # Default 50% if prediction fails
        
        # Get productivity percentages for all hours
        productivity_percentages = [0] * 24
        for hour, percentage in productivity_by_hour:
            productivity_percentages[hour] = round(percentage, 1)
        
        # Sort by probability and get top 3 hours
        productivity_by_hour.sort(key=lambda x: x[1], reverse=True)
        top_hours = [hour for hour, _ in productivity_by_hour[:3]]
        
        return jsonify({
            "predicted_hours": top_hours,
            "predicted_times": [f"{h}:00" for h in top_hours],
            "productivity_percentages": productivity_percentages,
            "method": "ml_model"
        })
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)