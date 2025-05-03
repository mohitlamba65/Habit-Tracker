import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, List, UserPlus, LogIn, Grid, Bell } from "lucide-react";
import Logo from "../assets/Habit_Tracker.png";
import { fetchNotifications } from "../api/notification";
import API from "../utils/axios";

const Navbar = () => {
 

const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  try {
    fetchNotifications().then((res) => {
      console.log(res)
      // const unread = res.data.notifications.filter(n => !n.isRead).length;
      // setUnreadCount(unread);
    });
  } catch (error) {
    console.log("Failed to fetch notifications", error)
    setUnreadCount(0);
  }
}, []);
  
useEffect(() => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(async (reg) => {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });
      await API.post("/users/push-subscribe", { subscription });
    });
  }
}, []);



  return (
    <motion.nav
      className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 fixed top-0 left-0 w-full z-50 bg-white text-white shadow-lg"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto flex justify-between items-center my-0">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center space-x-3">
          <motion.img
            src={Logo}
            alt="Habit Tracker Logo"
            className="w-16 h-12"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <motion.span
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Habit Tracker
          </motion.span>
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-6 items-center">
          <NavLink to="/" label="Home" icon={<Home />} />
          <NavLink to="/habits" label="Habits" icon={<List />} />
          <NavLink to="/signup" label="Signup" icon={<UserPlus />} />
          <NavLink to="/login" label="Login" icon={<LogIn />} />
          <NavLink to="/dashboard" label="Dashboard" icon={<Grid />} />

          {/* Notification Bell Icon */}
          <Link to="/notifications" className="relative">
            <Bell className="w-6 h-6 hover:text-yellow-300 transition duration-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, label, icon }) => (
  <Link to={to} className="flex items-center space-x-2 group">
    <motion.div
      whileHover={{ scale: 1.2, rotate: 10 }}
      className="group-hover:text-yellow-300 transition duration-300"
    >
      {icon}
    </motion.div>
    <motion.span
      className="group-hover:text-gray-200 transition duration-300"
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      whileHover={{ color: "#fff" }}
    >
      {label}
    </motion.span>
  </Link>
);

export default Navbar;
