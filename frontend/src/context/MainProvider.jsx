import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MainContext from "./MainContext";
import { getTasks } from "../api/taskApi.js"; 

const MainProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]); 
  const [currentView, setCurrentView] = useState("tasks");
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    aiAssistant: true,
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks); 
      } catch (err) {
        console.error("Failed to fetch tasks from backend:", err);
      }
    };

    fetchTasks(); 
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem("studyflowSettings", JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [settings]);

  const handleNavigation = (view) => setCurrentView(view);

  return (
    <MainContext.Provider
      value={{
        tasks,
        setTasks,
        settings,
        setSettings,
        currentView,
        handleNavigation,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

MainProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainProvider;
