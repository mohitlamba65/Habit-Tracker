import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from joblib import dump
import os

current_dir = os.path.dirname(os.path.abspath(__file__))

csv_path = os.path.join(current_dir, "data", "habit_logs.csv")
print(f"Looking for CSV at: {csv_path}")

try:
    df = pd.read_csv(csv_path)
    print(f"Successfully loaded CSV with {len(df)} records")
    
    # Check for empty dataframe
    if df.empty:
        print("Warning: CSV file is empty!")
        exit(1)
        
    # Features and label - convert to numeric types if needed
    X = df[["start_time", "mood", "duration"]].copy()
    
    # Convert 'start_time' to hour of day (numeric)
    if X["start_time"].dtype == 'object':
        try:
            X["start_time"] = pd.to_datetime(X["start_time"]).dt.hour
        except:
            print("Error: Could not convert start_time to datetime. Using dummy values.")
            X["start_time"] = 12  # Default to noon if conversion fails
    
    # Ensure other columns are numeric
    X["mood"] = pd.to_numeric(X["mood"], errors="coerce").fillna(1)
    X["duration"] = pd.to_numeric(X["duration"], errors="coerce").fillna(0)
    
    y = df["productive"]
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save model
    model_path = os.path.join(current_dir, "productivity_model.joblib")
    dump(model, model_path)
    print(f"✅ Model saved successfully at {model_path}")
    
except FileNotFoundError:
    print(f"ERROR: File not found at {csv_path}")
    print("Please make sure you have the habit_logs.csv file in the data directory")
except Exception as e:
    print(f"ERROR: {str(e)}")