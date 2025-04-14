import { useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";
import PropTypes from "prop-types"; 

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
      const storedPreference = localStorage.getItem('darkMode');
      return storedPreference ? JSON.parse(storedPreference) : false;
    });
  
    useEffect(() => {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
  
    return (
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        {children}
      </ThemeContext.Provider>
    );
};
  
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired, 
};
