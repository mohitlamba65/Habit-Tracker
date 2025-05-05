import { Routes, Route } from "react-router-dom";
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
import { Toaster } from "react-hot-toast";
import MainProvider from "./context/MainProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import MoodTracker from "./components/MoodTracer";
import Notifications from "./components/Notifications";

function App() {
  return (
    <MainProvider>
      <ThemeProvider>
        <Navbar />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
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
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </ThemeProvider>
    </MainProvider>
  );
}

export default App;
