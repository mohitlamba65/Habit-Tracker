import { useState, useEffect } from "react";
import PropTypes from "prop-types"; 
import MainContext from "./MainContext";

const MainProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState("tasks");
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    aiAssistant: true,
    ollamaEndpoint: "http://localhost:11434/api/chat",
    ollamaModel: "mistral",
  });

  useEffect(() => {
    try {
      const savedState = JSON.parse(localStorage.getItem("studyflowAppState"));
      if (savedState) {
        setTasks(savedState.tasks || []);
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...savedState.settings,
        }));
        setCurrentView(savedState.currentView || "tasks");
      }
    } catch (error) {
      console.error("Error loading app state:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "studyflowAppState",
        JSON.stringify({ tasks, currentView, settings })
      );
    } catch (error) {
      console.error("Error saving app state:", error);
    }
  }, [tasks, currentView, settings]);

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
        ollamaConnected,
        setOllamaConnected,
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
