import { useEffect, useState } from 'react';
import { fetchNotifications, markAsRead } from '../api/notification';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications().then(res => setNotifications(res.data.notifications));
  }, []);

  const handleMarkAsRead = (id) => {
    markAsRead(id).then(() => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((n) => (
          <div key={n._id} className={`p-3 mb-2 rounded ${n.isRead ? 'bg-gray-100' : 'bg-yellow-100'}`}>
            <p>{n.message}</p>
            {!n.isRead && (
              <button onClick={() => handleMarkAsRead(n._id)} className="text-sm text-blue-500">
                Mark as Read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
