import { useEffect, useState } from "react";
import { fetchNotifications, markAsRead, markAllAsRead } from "../api/notification";
import { motion } from "framer-motion";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetchNotifications();
      console.log("Notifications data:", response.data);
      
      if (response?.data?.notifications) {
        setNotifications(response.data.notifications);
        
        if (response.data.unreadCount !== undefined) {
          setUnreadCount(response.data.unreadCount);
        } else {
          // Calculate unread count if not provided directly
          const unread = response.data.notifications.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(loadNotifications, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      
      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      
      // Update all notifications to read in local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 mt-20">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 mt-20">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={loadNotifications}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg shadow-sm">
          <p className="text-gray-500">No notifications to display</p>
        </div>
      ) : (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {notifications.map((notification) => (
            <motion.div
              key={notification._id}
              className={`p-4 rounded-lg shadow ${
                notification.isRead ? "bg-gray-100" : "bg-yellow-50 border-l-4 border-yellow-400"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-2 text-gray-800">{notification.message}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {formatDate(notification.timestamp)}
                </span>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;