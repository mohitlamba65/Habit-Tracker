export const moodFrequency = (logs) => {
    const freq = {};
    logs.forEach(log => {
      freq[log.mood] = (freq[log.mood] || 0) + 1;
    });
    return freq;
  };
  