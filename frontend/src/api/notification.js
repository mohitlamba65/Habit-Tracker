import API from "../utils/axios.js";

/**
 * Fetch all notifications for the current user
 * @returns {Promise} Response with notifications and unreadCount
 */
export const fetchNotifications = async () => {
  try {
    const response = await API.get('/notifications');
    console.log("Notification API response:", response.data);
    return response;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} id - The notification ID
 * @returns {Promise} Response with success message
 */
export const markAsRead = async (id) => {
  try {
    const response = await API.patch(`/notifications/${id}/read`);
    return response;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise} Response with success message
 */
export const markAllAsRead = async () => {
  try {
    const response = await API.patch('/notifications/mark-all-read');
    return response;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Toggle notification settings
 * @param {Object} settings - Notification preferences to update
 * @returns {Promise} Response with updated settings
 */
export const updateNotificationPrefs = async (settings) => {
  try {
    const response = await API.patch(`/notifications/preferences`, settings);
    return response;
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw error;
  }
};