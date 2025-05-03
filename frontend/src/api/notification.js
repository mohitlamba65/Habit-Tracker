import API from "../utils/axios.js";

export const fetchNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.patch(`/notifications/${id}/read`);
export const toggleNotifications = () => API.patch(`/notifications/toggle-settings`);
