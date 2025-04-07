
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
  ];

  return (
    <aside className="w-64 bg-indigo-700 text-white h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">StudyFlow</h2>
      <ul>
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.path}
              className={`block p-3 rounded-lg ${
                currentView === link.name.toLowerCase()
                  ? "bg-indigo-500"
                  : "hover:bg-indigo-600"
              }`}
              onClick={() => handleNavigation(link.name.toLowerCase())}
            >
              {link.icon} {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
