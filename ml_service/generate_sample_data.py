import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

# Create a directory for the data if it doesn't exist
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, "data")
os.makedirs(data_dir, exist_ok=True)

# Path to the output CSV file
output_file = os.path.join(data_dir, "habit_logs.csv")

# Parameters for generating sample data
num_samples = 200
start_date = datetime.now() - timedelta(days=30)

# Create a list to store the data
data = []

# Generate random data with some patterns
for i in range(num_samples):
    # Create a random date within the last 30 days
    random_days = random.randint(0, 29)
    random_hours = random.randint(0, 23)
    random_minutes = random.randint(0, 59)
    timestamp = start_date + timedelta(days=random_days, hours=random_hours, minutes=random_minutes)
    
    # Mood (1-5)
    mood = random.randint(1, 5)
    
    # Duration (in minutes)
    duration = random.randint(5, 120)
    
    # Make certain hours more productive (pattern for the model to learn)
    productive_hours = [8, 9, 10, 14, 15, 16]  # Morning and afternoon hours
    
    # Make productivity more likely during productive hours
    if timestamp.hour in productive_hours:
        productive_probability = 0.8
    else:
        productive_probability = 0.3
        
    # High mood slightly increases productivity
    if mood >= 4:
        productive_probability += 0.1
    
    # Determine if the log was productive
    productive = 1 if random.random() < productive_probability else 0
    
    # Add the data point
    data.append({
        "start_time": timestamp.hour,
        "mood": mood,
        "duration": duration,
        "productive": productive
    })

# Create a DataFrame
df = pd.DataFrame(data)

# Save to CSV
df.to_csv(output_file, index=False)

print(f"✅ Generated {num_samples} sample data points and saved to {output_file}")
print(f"Sample data:")
print(df.head())

# Some statistics
print("\nStatistics:")
print(f"Productive logs: {df['productive'].sum()} ({df['productive'].mean()*100:.1f}%)")
print("Mean productivity by hour:")
hour_productivity = df.groupby("start_time")["productive"].mean()
for hour, productivity in hour_productivity.items():
    print(f"Hour {hour}: {productivity*100:.1f}% productive")