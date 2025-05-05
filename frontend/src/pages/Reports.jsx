import { useContext, useEffect, useRef, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import MainContext from "../context/MainContext";
import API from "../utils/axios";
import axios from "axios";

const Reports = () => {
  const { tasks, setTasks } = useContext(MainContext);
  const [predictions, setPredictions] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [productivityPercentages, setProductivityPercentages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const taskTrendChartRef = useRef(null);
  const taskPriorityChartRef = useRef(null);
  const predictionChartRef = useRef(null);
  const moodChartRef = useRef(null);

  const currentHour = new Date().getHours();

  // Define chart initialization functions with useCallback BEFORE they are referenced
  const initTaskTrendChart = useCallback(() => {
    const ctx = document.getElementById("taskTrendChart");
    if (!ctx) return;

    if (taskTrendChartRef.current) taskTrendChartRef.current.destroy();

    taskTrendChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: tasks.map((task) =>
          new Date(task.createdAt).toLocaleDateString()
        ),
        datasets: [
          {
            label: "Completed",
            data: tasks.map((task) => (task.status ? 1 : 0)),
            borderColor: "#33FF57",
            backgroundColor: "rgba(51, 255, 87, 0.2)",
            fill: true,
          },
          {
            label: "Pending",
            data: tasks.map((task) => (task.status ? 0 : 1)),
            borderColor: "#FF5733",
            backgroundColor: "rgba(255, 87, 51, 0.2)",
            fill: true,
          },
        ],
      },
      options: { responsive: true },
    });
  }, [tasks]);

  const initTaskPriorityChart = useCallback(() => {
    const ctx = document.getElementById("taskPriorityChart");
    if (!ctx) return;

    if (taskPriorityChartRef.current) taskPriorityChartRef.current.destroy();

    taskPriorityChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            label: "Tasks by Priority",
            data: [
              tasks.filter((t) => t.priority === "high").length,
              tasks.filter((t) => t.priority === "medium").length,
              tasks.filter((t) => t.priority === "low").length,
            ],
            backgroundColor: ["#FF5733", "#FFC300", "#33FF57"],
          },
        ],
      },
      options: { responsive: true },
    });
  }, [tasks]);

  const initMoodChart = useCallback(() => {
    const ctx = document.getElementById("moodChart");
    if (!ctx) return;

    if (moodChartRef.current) moodChartRef.current.destroy();

    const moodMap = {};
    moodLogs.forEach((log) => {
      moodMap[log.mood] = (moodMap[log.mood] || 0) + 1;
    });

    const labels = Object.keys(moodMap);
    const data = Object.values(moodMap);

    moodChartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: "Mood Distribution",
            data,
            backgroundColor: ["#FACC15", "#60A5FA", "#F87171", "#A78BFA"],
          },
        ],
      },
      options: { responsive: true },
    });
  }, [moodLogs]);

  const initPredictionChart = useCallback(
    (data) => {
      const ctx = document.getElementById("predictionChart");
      if (!ctx) return;

      // Parse peak productivity times
      const hours = Array(24).fill(0);
      const percentages =
        productivityPercentages.length === 24
          ? productivityPercentages
          : Array(24).fill(50); // Default 50% if no data

      if (data && data.peak_productivity_times) {
        data.peak_productivity_times.forEach((timeStr) => {
          const hourMatch = timeStr.match(/^(\\d+):/);
          const hour = hourMatch ? parseInt(hourMatch[1]) : -1;
          if (hour >= 0 && hour < 24) {
            hours[hour] = percentages[hour] || 75; // Use percentage or default to 75%
          }
        });
      }

      // Fill in hours that aren't peak with their percentages
      for (let i = 0; i < 24; i++) {
        if (hours[i] === 0 && percentages[i]) {
          hours[i] = percentages[i];
        }
      }

      if (predictionChartRef.current) predictionChartRef.current.destroy();

      predictionChartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Array(24)
            .fill()
            .map((_, i) => `${i}:00`),
          datasets: [
            {
              label: "Productivity Percentage",
              data: hours,
              backgroundColor: (context) => {
                const index = context.dataIndex;

                // Highlight current hour
                if (index === currentHour) {
                  return "rgba(255, 99, 132, 0.8)"; // Red for current hour
                }

                // Color based on productivity percentage
                const value = context.dataset.data[index];
                if (value >= 75) {
                  return "rgba(75, 192, 192, 0.7)"; // Green for high productivity
                } else if (value >= 50) {
                  return "rgba(54, 162, 235, 0.7)"; // Blue for medium productivity
                } else {
                  return "rgba(153, 102, 255, 0.7)"; // Purple for low productivity
                }
              },
              borderColor: (context) => {
                return context.dataIndex === currentHour
                  ? "rgba(255, 99, 132, 1)"
                  : "rgba(0, 0, 0, 0.1)";
              },
              borderWidth: (context) =>
                context.dataIndex === currentHour ? 2 : 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Productivity %",
              },
            },
            x: {
              title: {
                display: true,
                text: "Hour of Day",
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `Productivity: ${context.raw}%`;
                },
                afterLabel: function (context) {
                  const hour = parseInt(context.label);
                  if (hour === currentHour) {
                    return "(Current hour)";
                  }
                  return "";
                },
              },
            },
            legend: {
              labels: {
                generateLabels: function (chart) {
                  const defaultLabels =
                    Chart.defaults.plugins.legend.labels.generateLabels(chart);

                  // Add custom legend items
                  return [
                    ...defaultLabels,
                    {
                      text: "Current Hour",
                      fillStyle: "rgba(255, 99, 132, 0.8)",
                      strokeStyle: "rgba(255, 99, 132, 1)",
                      lineWidth: 2,
                    },
                  ];
                },
              },
            },
          },
        },
      });
    },
    [productivityPercentages, currentHour]
  );

  const fetchProductivityPrediction = async () => {
    try {
      // Get productivity logs first for ML prediction
      const logsRes = await API.get("/habits/getHabitlogs");

      if (!logsRes.data || !Array.isArray(logsRes.data)) {
        throw new Error("Invalid habit logs data");
      }

      const formattedLogs = logsRes.data.map((log) => ({
        start_hour: new Date(log.start_time).getHours(),
        mood: log.mood_code ?? 1,
        duration: log.completion_time
          ? (new Date(log.completion_time) - new Date(log.start_time)) /
            (1000 * 60)
          : 30,
      }));

      console.log("Sending logs to ML service:", formattedLogs);

      // Try ML service first
      const mlRes = await axios.post("http://127.0.0.1:5001/predict", {
        logs: formattedLogs,
      });

      if (
        mlRes.data &&
        (mlRes.data.predicted_hours?.length > 0 ||
          mlRes.data.predicted_times?.length > 0)
      ) {
        // Extract productivity percentages if available
        if (mlRes.data.productivity_percentages) {
          setProductivityPercentages(mlRes.data.productivity_percentages);
        } else {
          // Generate default percentages based on predicted hours
          const defaultPercentages = Array(24).fill(0);
          const peakHours =
            mlRes.data.predicted_hours ||
            mlRes.data.predicted_times.map((t) => parseInt(t));

          peakHours.forEach((hour) => {
            if (!isNaN(hour) && hour >= 0 && hour < 24) {
              defaultPercentages[hour] = 85; // 85% for predicted peak hours
            }
          });

          // Add some variance to non-peak hours
          for (let i = 0; i < 24; i++) {
            if (defaultPercentages[i] === 0) {
              // Higher percentages for hours close to peak hours
              const closeToPeak = peakHours.some((h) => Math.abs(h - i) <= 1);
              defaultPercentages[i] = closeToPeak
                ? 40 + Math.floor(Math.random() * 20) // 40-60% for hours near peaks
                : 20 + Math.floor(Math.random() * 20); // 20-40% for other hours
            }
          }

          setProductivityPercentages(defaultPercentages);
        }

        return {
          peak_productivity_times:
            mlRes.data.predicted_times ||
            mlRes.data.predicted_hours.map((h) => `${h}:00`),
        };
      }
    } catch (err) {
      console.warn("ML service failed or returned insufficient data:", err);
    }

    // Fallback to backend
    try {
      const backendRes = await API.post("/predictions/generate");

      if (backendRes.data) {
        // Generate default percentages if not available
        if (!productivityPercentages.some((p) => p > 0)) {
          const peakHours = backendRes.data.peak_productivity_times
            .map((t) => {
              const hourMatch = t.match(/^(\\d+):/);
              return hourMatch ? parseInt(hourMatch[1]) : -1;
            })
            .filter((h) => h >= 0 && h < 24);

          const defaultPercentages = Array(24).fill(0);

          peakHours.forEach((hour) => {
            defaultPercentages[hour] = 80 + Math.floor(Math.random() * 15); // 80-95%
          });

          // Fill in non-peak hours
          for (let i = 0; i < 24; i++) {
            if (defaultPercentages[i] === 0) {
              const closeToPeak = peakHours.some((h) => Math.abs(h - i) <= 1);
              defaultPercentages[i] = closeToPeak
                ? 45 + Math.floor(Math.random() * 20) // 45-65% for hours near peaks
                : 20 + Math.floor(Math.random() * 25); // 20-45% for other hours
            }
          }

          setProductivityPercentages(defaultPercentages);
        }

        return backendRes.data;
      }
    } catch (err) {
      console.error("Both ML and backend failed to return predictions:", err);
      toast.error("Unable to load productivity data.");
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [habitsRes, moodRes] = await Promise.all([
          API.get("/habits/getHabits"),
          API.get("/productivity"),
        ]);

        setTasks(habitsRes.data);
        setMoodLogs(moodRes.data);

        // Get productivity predictions
        const predictionData = await fetchProductivityPrediction();
        if (predictionData) {
          setPredictions([predictionData]);
        }
      } catch (err) {
        console.error("Error loading report data:", err);
        toast.error("Failed to load some report data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setTasks]); // Removed the chart init functions from here

  // Separate useEffect that runs when loading is complete
  useEffect(() => {
    if (!isLoading) {
      if (tasks.length > 0) {
        initTaskTrendChart();
        initTaskPriorityChart();
      }

      if (moodLogs.length > 0) {
        initMoodChart();
      }

      if (predictions.length > 0 && predictions[0]) {
        initPredictionChart(predictions[0]);
      }
    }
  }, [
    isLoading,
    tasks,
    moodLogs,
    predictions,
    initTaskTrendChart,
    initTaskPriorityChart,
    initMoodChart,
    initPredictionChart,
  ]);

  const generatePDF = async () => {
    const element = document.getElementById("reports-container");
    if (!element) return;
  
    toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Productivity Report", pdfWidth / 2, 15, { align: "center" });
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 22, { align: "center" });
  
      // Add images of the charts
      pdf.addImage(imgData, "PNG", 0, 30, pdfWidth, pdfHeight);
      
      // Calculate where to start text content after charts
      const textStartY = 30 + pdfHeight + 10;
      
      // Add explanatory text for each chart
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setTextColor(44, 62, 80);
      pdf.text("Detailed Analysis", pdfWidth / 2, 15, { align: "center" });
      
      // Task Completion Trend explanation
      let yPosition = 25;
      pdf.setFontSize(14);
      pdf.setTextColor(41, 128, 185);
      pdf.text("Task Completion Trend", 10, yPosition);
      
      pdf.setFontSize(11);
      pdf.setTextColor(52, 73, 94);
      yPosition += 8;
      const taskTrendText = `This graph shows your task completion rate over time. The green line represents completed tasks, while the red line shows pending tasks. ${
        tasks.filter(t => t.status).length > tasks.filter(t => !t.status).length 
          ? "You're completing more tasks than leaving them pending, which indicates good productivity."
          : "You have more pending tasks than completed ones, which may indicate areas for improvement."
      }`;
      
      const taskTrendLines = pdf.splitTextToSize(taskTrendText, pdfWidth - 20);
      pdf.text(taskTrendLines, 10, yPosition);
      yPosition += taskTrendLines.length * 6;
      
      // Task Priority Distribution explanation
      yPosition += 5;
      pdf.setFontSize(14);
      pdf.setTextColor(41, 128, 185);
      pdf.text("Task Priority Distribution", 10, yPosition);
      
      pdf.setFontSize(11);
      pdf.setTextColor(52, 73, 94);
      yPosition += 8;
      
      const highPriorityCount = tasks.filter(t => t.priority === "high").length;
      const mediumPriorityCount = tasks.filter(t => t.priority === "medium").length;
      const lowPriorityCount = tasks.filter(t => t.priority === "low").length;
      const totalTasks = tasks.length;
      
      const taskPriorityText = `This chart shows how your tasks are distributed by priority level. You have ${highPriorityCount} high priority (${Math.round(highPriorityCount/totalTasks*100)}%), ${mediumPriorityCount} medium priority (${Math.round(mediumPriorityCount/totalTasks*100)}%), and ${lowPriorityCount} low priority (${Math.round(lowPriorityCount/totalTasks*100)}%) tasks. ${
        highPriorityCount > (mediumPriorityCount + lowPriorityCount) 
          ? "You may want to reconsider your priority assignments as having too many high priority tasks can lead to stress."
          : "Your priority distribution looks balanced, which is good for maintaining focus on what's truly important."
      }`;
      
      const taskPriorityLines = pdf.splitTextToSize(taskPriorityText, pdfWidth - 20);
      pdf.text(taskPriorityLines, 10, yPosition);
      yPosition += taskPriorityLines.length * 6;
      
      // Mood Tracking explanation
      yPosition += 5;
      pdf.setFontSize(14);
      pdf.setTextColor(41, 128, 185);
      pdf.text("Mood Tracking", 10, yPosition);
      
      pdf.setFontSize(11);
      pdf.setTextColor(52, 73, 94);
      yPosition += 8;
      
      // Calculate dominant mood
      const moodCounts = {};
      moodLogs.forEach(log => {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      });
      let dominantMood = '';
      let maxCount = 0;
      Object.keys(moodCounts).forEach(mood => {
        if (moodCounts[mood] > maxCount) {
          maxCount = moodCounts[mood];
          dominantMood = mood;
        }
      });
      
      const moodText = `This chart visualizes your mood patterns. Your most frequent mood is "${dominantMood}" (${Math.round(maxCount/moodLogs.length*100)}% of entries). ${
        dominantMood === "Happy" || dominantMood === "Focused" || dominantMood === "Productive"
          ? "Positive moods tend to correlate with higher productivity."
          : "Consider activities that might improve your overall mood, as this can positively impact productivity."
      }`;
      
      const moodLines = pdf.splitTextToSize(moodText, pdfWidth - 20);
      pdf.text(moodLines, 10, yPosition);
      yPosition += moodLines.length * 6;
      
      // Productivity by Hour explanation
      yPosition += 5;
      pdf.setFontSize(14);
      pdf.setTextColor(41, 128, 185);
      pdf.text("Productivity by Hour", 10, yPosition);
      
      pdf.setFontSize(11);
      pdf.setTextColor(52, 73, 94);
      yPosition += 8;
      
      let peakHoursText = '';
      if (predictions.length > 0 && predictions[0]) {
        peakHoursText = `Your peak productivity hours are: ${predictions[0].peak_productivity_times.join(', ')}.`;
      }
      
      const productivityText = `This chart shows your estimated productivity levels throughout the day. ${peakHoursText} ${
        predictions.length > 0 && predictions[0]
          ? `Consider scheduling your most important tasks during these peak hours to maximize effectiveness. The current hour (${currentHour}:00) is highlighted in red on the chart.`
          : "Try to schedule your most demanding tasks during your higher productivity periods."
      }`;
      
      const productivityLines = pdf.splitTextToSize(productivityText, pdfWidth - 20);
      pdf.text(productivityLines, 10, yPosition);
      
      // Add conclusion
      yPosition += productivityLines.length * 6 + 10;
      pdf.setFontSize(14);
      pdf.setTextColor(46, 204, 113);
      pdf.text("Recommendations", 10, yPosition);
      
      pdf.setFontSize(11);
      pdf.setTextColor(52, 73, 94);
      yPosition += 8;
      
      const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status).length / tasks.length) * 100 : 0;
      const recommendationText = `Based on your data:
  1. ${completionRate < 50 ? "Focus on completing more of your existing tasks before adding new ones." : "You're maintaining a good task completion rate."}
  2. Schedule complex tasks during your peak productivity hours (${predictions.length > 0 && predictions[0] ? predictions[0].peak_productivity_times[0] : "morning/afternoon"}).
  3. ${highPriorityCount > (totalTasks * 0.4) ? "Consider re-evaluating your task priorities - not everything can be high priority." : "Your task priorities seem well distributed."}
  4. ${dominantMood && (dominantMood !== "Happy" && dominantMood !== "Focused") ? "Consider activities that might improve your overall mood, as this can positively impact productivity." : "Your positive mood patterns correlate well with productivity."}`;
      
      const recommendationLines = pdf.splitTextToSize(recommendationText, pdfWidth - 20);
      pdf.text(recommendationLines, 10, yPosition);
      
      pdf.save("productivity_report.pdf");
      toast.dismiss();
      toast.success("PDF downloaded with detailed analysis");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to generate PDF");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6 mt-[4.5rem]">
        <h1 className="text-2xl font-bold text-gray-800">Productivity Reports</h1>
        <button
          onClick={generatePDF}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          Download PDF
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div id="reports-container" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Task Completion Trend</h2>
            <canvas id="taskTrendChart"></canvas>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Task Priority Distribution</h2>
            <canvas id="taskPriorityChart"></canvas>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Mood Tracking</h2>
            <canvas id="moodChart"></canvas>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">
              Productivity by Hour 
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Current hour: {currentHour}:00)
              </span>
            </h2>
            <canvas id="predictionChart"></canvas>
            
            {predictions.length > 0 && predictions[0] && (
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>Peak Productivity Hours: </strong>
                  {predictions[0].peak_productivity_times.join(', ')}
                </p>
                <p className="mt-1">
                  <span className="inline-block w-3 h-3 bg-red-400 mr-1"></span>
                  Current hour
                  <span className="inline-block w-3 h-3 bg-teal-400 ml-3 mr-1"></span>
                  High productivity (75%+)
                  <span className="inline-block w-3 h-3 bg-blue-400 ml-3 mr-1"></span>
                  Medium productivity (50-74%)
                  <span className="inline-block w-3 h-3 bg-purple-400 ml-3 mr-1"></span>
                  Lower productivity (&lt;50%)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;