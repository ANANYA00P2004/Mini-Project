import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./notificationFrontend.css";

// ✅ Connect to the backend WebSocket server
const socket = io(process.env.REACT_APP_NOTIFICATION_SERVER_URL || "http://localhost:5000");
console.log("✅ Connecting to WebSocket server...");

// ✅ Notification Component
const NotificationFrontend = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    console.log("✅ Setting up notification listeners...");

    // ✅ Listen to all notification channels
    const channels = [
      "category_exceeded",
      "category_approaching",
      "low_balance",
      "high_expense",
      "recurring_reminder",
      "wishlist_progress",
      "wishlist_goal_achieved",
    ];

    channels.forEach((channel) => {
      console.log(`📡 Listening for notifications on channel: ${channel}`); // Debug log
      socket.on(channel, (data) => {
        console.log(`🔔 Notification received on ${channel}:`, data);

        const newNotification = {
          id: Date.now(),
          message: getNotificationMessage(channel, data),
        };

        console.log(`🆕 New notification added:`, newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
      });
    });

    // ✅ Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up listeners...");
      channels.forEach((channel) => {
        console.log(`❌ Removing listener for channel: ${channel}`);
        socket.off(channel);
      });
    };
  }, []);

  // ✅ Generate messages based on the event
  const getNotificationMessage = (event, data) => {
    console.log(`📝 Generating notification message for event: ${event}`, data); // Debug log
    switch (event) {
      case "category_exceeded":
        return `🚨 Budget Exceeded: ${data.category_name} limit crossed!`;
      case "category_approaching":
        return `⚠️ Warning: Spending in ${data.category_name} is approaching the limit.`;
      case "low_balance":
        return "⚠️ Low Balance Alert! Review your expenses.";
      case "high_expense":
        return `💸 High Expense Alert: ₹${data.amount} recorded.`;
      case "recurring_reminder":
        return `🔔 Payment Reminder: Upcoming payments for ${data.label}.`;
      case "wishlist_progress":
        return `🎯 Goal Progress: ${data.progress}% saved for ${data.item}.`;
      case "wishlist_goal_achieved":
        return `🎉 Goal Achieved! You’ve saved enough for ${data.item}.`;
      default:
        return "🔔 New notification received.";
    }
  };

  // ✅ Render notifications
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className="notification-item">
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default NotificationFrontend;
