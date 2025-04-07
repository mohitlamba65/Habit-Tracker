import { useState } from "react";

const Settings = () => {
  const [user, setUser] = useState({
    name: "Mohit Lamba",
    email: "mohit.lamba@example.com",
    username: "mohitlamba",
    language: "en",
    timezone: "utc-5.5",
    notifications: {
      email: true,
      push: true,
      whatsapp: false,
    },
    theme: "light",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setUser({ ...user, [id]: value });
  };

  const handleToggle = (key) => {
    setUser({
      ...user,
      notifications: { ...user.notifications, [key]: !user.notifications[key] },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-700 text-white p-6 py-20">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 text-gray-900">
        <h2 className="text-3xl font-bold text-center mb-6">⚙️ Settings</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block font-medium text-gray-700">Full Name</label>
              <input type="text" id="name" value={user.name} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
              <input type="email" id="email" value={user.email} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block font-medium text-gray-700">Username</label>
            <input type="text" id="username" value={user.username} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block font-medium text-gray-700">Language</label>
              <select id="language" value={user.language} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block font-medium text-gray-700">Timezone</label>
              <select id="timezone" value={user.timezone} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400">
                <option value="utc-8">Pacific Time (UTC-8)</option>
                <option value="utc-5">Eastern Time (UTC-5)</option>
                <option value="utc+0">Greenwich Mean Time (UTC+0)</option>
                <option value="utc+1">Central European Time (UTC+1)</option>
                <option value="utc+8">China Standard Time (UTC+8)</option>
                <option value="utc+5.5">Indian Standard Time (UTC+5:30)</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800">Notification Settings</h3>
            <div className="mt-4 space-y-4">
              {Object.entries(user.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 border rounded-md">
                  <span className="text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)} Notifications</span>
                  <button
                    type="button"
                    onClick={() => handleToggle(key)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${value ? "bg-indigo-500" : "bg-gray-300"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition ${value ? "translate-x-6" : ""}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
