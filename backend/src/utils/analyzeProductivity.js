export const analyzeProductivity = (logs) => {
  const hourCounts = Array(24).fill(0);
  
  logs.forEach((log) => {
    if (log && log.timestamp) {
      try {
        const date = new Date(log.timestamp);
        const hour = date.getHours(); 
        
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourCounts[hour]++;
        }
      } catch (error) {
        console.error("Error processing timestamp:", error);
      }
    }
  });
  
  const maxCount = Math.max(...hourCounts);
  
  // If no logs, return default hours
  if (maxCount === 0) {
    return [9, 14, 19]; 
  }
  
  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(({ count }) => count === maxCount)
    .map(({ hour }) => hour);
  
  return peakHours;
};