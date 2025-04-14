import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut } from "lucide-react";
import API from "../utils/axios";

const Header = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err.message);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/users/logout");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className=" mt-[4.5rem] bg-white/60 backdrop-blur-md shadow-md rounded-lg bg-gradient-to-r from-[#6348EB] via-[#8B36EA] to-[#2F5FEB] text-white px-6 py-4 mb-6 flex justify-between items-center relative z-10"
    >
      <h1 className="text-2xl font-bold tracking-tight hover:scale-105 transition-transform duration-300">
        📚 StudyFlow
      </h1>

      {user && (
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-3 bg-white text-black px-4 py-2 rounded-full shadow hover:shadow-lg transition duration-300"
          >
            <span className="font-medium truncate max-w-[8rem] sm:max-w-[10rem]">
              {user.name}
            </span>

            {user.avatar ? (
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-[#6348EB] text-white rounded-full flex items-center justify-center font-bold">
                {getInitials(user.name)}
              </div>
            )}
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-52 bg-white text-black rounded-lg shadow-lg z-20"
              >
                <div className="px-4 py-2 border-b text-sm text-gray-600 flex items-center gap-2">
                  <User size={16} />
                  <span className="truncate inline-block max-w-[9.5rem]">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Header;
