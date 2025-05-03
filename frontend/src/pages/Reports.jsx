import { useContext, useEffect, useRef, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import MainContext from "../context/MainContext";
import API from "../utils/axios";

const Reports = () => {
  const { tasks, setTasks } = useContext(MainContext);
  const [predictions, setPredictions] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);

  const taskTrendChartRef = useRef(null);
  const taskPriorityChartRef = useRef(null);
  const predictionChartRef = useRef(null);
  const moodChartRef = useRef(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitsRes, predictionRes, moodRes] = await Promise.all([
          API.get("/habits/getHabits"),
          API.get("/predictions"),
          API.get("/productivity"),
        ]);

        setTasks(habitsRes.data);
        setPredictions(predictionRes.data);
        setMoodLogs(moodRes.data);

        initPredictionChart(predictionRes.data);
         
      } catch (err) {
        toast.error("Failed to load reports data");
        console.error(err);
      }
    };

    fetchData();
  }, [setTasks]);

  
  

  const initTaskTrendChart = useCallback(() => {
    const ctx = document.getElementById("taskTrendChart");
    if (!ctx) return;

    if (taskTrendChartRef.current) taskTrendChartRef.current.destroy();

    taskTrendChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: tasks.map((task) => new Date(task.createdAt).toLocaleDateString()),
        datasets: [
          {
            label: "Completed",
            data: tasks.map((task) => task.status ? 1 : 0),
            borderColor: "#33FF57",
            backgroundColor: "rgba(51, 255, 87, 0.2)",
            fill: true,
          },
          {
            label: "Pending",
            data: tasks.map((task) => task.status ? 0 : 1),
            borderColor: "#FF5733",
            backgroundColor: "rgba(255, 87, 51, 0.2)",
            fill: true,
          }
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
              tasks.filter((t) => t.priority === "low").length
            ],
            backgroundColor: ["#FF5733", "#FFC300", "#33FF57"]
          }
        ]
      },
      options: { responsive: true },
    });
  }, [tasks]);

  const initMoodChart = useCallback(() => {
    const ctx = document.getElementById("moodChart");
    if (!ctx) return;

    if (moodChartRef.current) moodChartRef.current.destroy();

    const moodMap = {};
    moodLogs.forEach(log => {
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
            backgroundColor: ["#FACC15", "#60A5FA", "#F87171", "#A78BFA"]
          }
        ]
      },
      options: { responsive: true },
    });
  }, [moodLogs]);

  const initPredictionChart = useCallback((data) => {
    const ctx = document.getElementById("predictionChart");
    if (!ctx) return;

    const hours = Array(24).fill(0);
    data.forEach((pred) => {
      pred.peak_productivity_times.forEach((h) => {
        const hour = parseInt(h);
        if (!isNaN(hour)) hours[hour]++;
      });
    });

    if (predictionChartRef.current) predictionChartRef.current.destroy();

    predictionChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: hours.map((_, i) => `${i}:00`),
        datasets: [
          {
            label: "Peak Productivity Times",
            data: hours,
            backgroundColor: "#6366F1"
          }
        ]
      },
      options: { responsive: true },
    });
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      initTaskTrendChart();
      initTaskPriorityChart();
    }
  }, [tasks, initTaskTrendChart, initTaskPriorityChart]);

  useEffect(() => {
    if (moodLogs.length > 0) {
      initMoodChart();
    }
  }, [moodLogs, initMoodChart]);

  const exportPDF = async () => {
    const reportEl = document.getElementById("report-content");
    const canvas = await html2canvas(reportEl);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("StudyFlow_Report.pdf");
  };

  return (
    <div className="py-10 px-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">📊 Study Reports & Analytics</h1>
        <button
          onClick={exportPDF}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Export PDF
        </button>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-lg font-bold mb-2">Task Trends</h2>
            <canvas id="taskTrendChart"></canvas>
          </div>

          <div className="bg-white shadow rounded p-4">
            <h2 className="text-lg font-bold mb-2">Priority Distribution</h2>
            <canvas id="taskPriorityChart"></canvas>
          </div>

          <div className="bg-white shadow rounded p-4">
            <h2 className="text-lg font-bold mb-2">Mood Distribution</h2>
            <canvas id="moodChart"></canvas> {/* 🔥 New chart here */}
          </div>

          <div className="bg-white shadow rounded p-4 md:col-span-2">
            <h2 className="text-lg font-bold mb-2">AI Predicted Peak Hours</h2>
            <canvas id="predictionChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
