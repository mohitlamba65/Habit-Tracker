import axios from 'axios';

export const getProductivityPrediction = async (userId, logs) => {
  try {
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      console.warn("No logs provided for ML prediction");
      return null;
    }
    
    // Format logs for ML service
    const formattedLogs = logs.map((log) => {
      let startTime = 0;
      try {
        startTime = new Date(log.createdAt).getHours();
      } catch (e) {
        console.warn("Invalid createdAt time:", log.createdAt);
      }
      
      return {
        start_hour: startTime,
        mood: log.mood || 1, // Default mood if missing
        duration: log.duration || 30 // Default duration if missing
      };
    });
    
    console.log("Sending to ML service:", {
      user_id: userId,
      logs: formattedLogs
    });
    
    // Send to ML service
    const response = await axios.post('http://127.0.0.1:5001/predict', {
      user_id: userId,
      logs: formattedLogs
    }, {
      timeout: 5000 // 5 second timeout
    });
    
    console.log("ML service response:", response.data);
    
    // Check if response has predicted_hours
    if (response.data && Array.isArray(response.data.predicted_hours)) {
      return response.data.predicted_hours;
    } else {
      console.warn("ML service returned invalid response:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error connecting to ML server:", error.message);
    return null;
  }
};