import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import HabitDetails from "./pages/HabitDetails";
import Habits from "./pages/Habits";
import AiAssistant from "./pages/AiAssistant";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import MainProvider from "./context/MainProvider";

function App() {
  return (
    <MainProvider> 
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/habit/:id" element={<HabitDetails />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </BrowserRouter>
    </MainProvider>
  );
}

export default App;
