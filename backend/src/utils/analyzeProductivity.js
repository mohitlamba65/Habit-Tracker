export const analyzeProductivity = (logs) => {
    const hourCounts = Array(24).fill(0);
  
    logs.forEach((log) => {
      const date = new Date(log.timestamp); 
      hourCounts[hour]++;
    });
  
    const maxCount = Math.max(...hourCounts);
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count === maxCount)
      .map(({ hour }) => hour);
  
    return peakHours;
  };
  