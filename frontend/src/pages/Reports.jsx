import { useEffect, useContext, useRef, useCallback } from "react";
import MainContext from "../context/MainContext";
import Chart from "chart.js/auto";

const Reports = () => {
  const { tasks } = useContext(MainContext);
  const taskTrendChartRef = useRef(null);
  const taskPriorityChartRef = useRef(null);

  const initTaskTrendChart = useCallback(() => {
    const ctx = document.getElementById("taskTrendChart");
    if (ctx) {
      taskTrendChartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["1 Mar", "8 Mar", "15 Mar", "22 Mar", "1 Apr", "8 Apr"],
          datasets: [
            {
              label: "Active Tasks",
              data: tasks.map((task) => (task.completed ? 0 : 1)),
              borderColor: "#FF5733",
              backgroundColor: "rgba(255, 87, 51, 0.2)",
              fill: true,
            },
            {
              label: "Completed Tasks",
              data: tasks.map((task) => (task.completed ? 1 : 0)),
              borderColor: "#33FF57",
              backgroundColor: "rgba(51, 255, 87, 0.2)",
              fill: true,
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [tasks]);

  const initTaskPriorityChart = useCallback(() => {
    const ctx = document.getElementById("taskPriorityChart");
    if (ctx) {
      taskPriorityChartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["High", "Medium", "Low"],
          datasets: [
            {
              label: "Tasks by Priority",
              data: [
                tasks.filter((task) => task.priority === "high").length,
                tasks.filter((task) => task.priority === "medium").length,
                tasks.filter((task) => task.priority === "low").length,
              ],
              backgroundColor: ["#FF5733", "#FFC300", "#33FF57"],
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [tasks]);

  const initCharts = useCallback(() => {
    setTimeout(() => {
      destroyChart(taskTrendChartRef);
      destroyChart(taskPriorityChartRef);
      initTaskTrendChart();
      initTaskPriorityChart();
    }, 500);
  }, [initTaskTrendChart, initTaskPriorityChart]);

  useEffect(() => {
    if (tasks.length > 0) {
      initCharts();
    }
  }, [tasks, initCharts]);

  const destroyChart = (chartRef) => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };

  return (
    <div className="reports-container py-10 px-6">
      <h1 className="text-2xl font-semibold text-center mb-6">Study Reports & Analytics</h1>
      
      {/* Stats Overview */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-4 w-40 text-center">
          <div className="text-3xl font-bold">{tasks.length}</div>
          <div className="text-sm text-gray-500">Total Tasks</div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 w-40 text-center">
          <div className="text-3xl font-bold">{tasks.filter((task) => task.completed).length}</div>
          <div className="text-sm text-gray-500">Completed Tasks</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Task Trends</h2>
          <canvas id="taskTrendChart"></canvas>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Task Priority Distribution</h2>
          <canvas id="taskPriorityChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default Reports;


