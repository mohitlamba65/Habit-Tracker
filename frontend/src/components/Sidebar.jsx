import { useContext } from "react";
import { Link } from "react-router-dom";
import MainContext from "../context/MainContext";

const Sidebar = () => {
  const { currentView, handleNavigation } = useContext(MainContext);

  const links = [
    { name: "Tasks", path: "/tasks", icon: "📋" },
    { name: "Reports", path: "/reports", icon: "📈" },
    { name: "AI Assistant", path: "/ai-assistant", icon: "🤖" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
    { name: "Mood Tracker", path: "/mood", icon: "🧠" },
  ];

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 z-40 bg-gradient-to-b from-[#6348EB] via-[#8B36EA] to-[#2F5FEB] text-white p-6 shadow-lg">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">StudyFlow</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.path}
              className={`block py-2.5 px-4 rounded-lg font-medium text-lg transition-all ${
                currentView === link.name.toLowerCase()
                  ? "bg-white text-[#2F5FEB]"
                  : "hover:bg-white hover:text-[#6348EB]"
              }`}
              onClick={() => handleNavigation(link.name.toLowerCase())}
            >
              <span className="mr-2">{link.icon}</span> {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
