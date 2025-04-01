const socketIo = require("socket.io");
const nodemailer = require("nodemailer");
const supabase = require("../supabaseClient"); // ✅ Import Supabase client

// ✅ Initialize Socket.io instance
let io;
const initSocketIo = (server) => {
  io = socketIo(server, {
    cors: { origin: "*" }, // Allow frontend connections
  });
  console.log("✅ WebSocket initialized.");
};

// ✅ Listen for Supabase pg_notify events
async function listenToSupabaseNotifications() {
  const channels = [
    "category_exceeded",
    "category_approaching",
    "low_balance",
    "high_expense",
    "recurring_reminder",
    "wishlist_progress",
    "wishlist_goal_achieved",
  ];

  try {
    console.log("✅ Listening for notifications via Supabase pg_notify...");

    channels.forEach((channel) => {
      console.log(`📡 Subscribing to channel: ${channel}`); // Debug log
      supabase
        .channel(channel) // ✅ Subscribe to pg_notify channels directly
        .on("broadcast", { event: "*" }, async (payload) => {
          console.log(`🔔 Notification received on ${channel}:`, payload);
          await handleNotification(channel, payload); // Send to Socket.io and email
        })
        .subscribe((status) => {
          console.log(`📡 Subscription status for ${channel}:`, status);
        });
    });
  } catch (error) {
    console.error("❌ Error setting up Supabase Realtime listener:", error);
  }
}

// ✅ Handle notification and send to WebSocket/Email
async function handleNotification(channel, payload) {
  console.log(`📢 Handling notification for channel: ${channel}`, payload); // Debug log

  if (io) {
    console.log(`📤 Emitting event to WebSocket: ${channel}`); // Debug log
    io.emit(channel, payload);
  } else {
    console.warn("⚠️ WebSocket not initialized.");
  }

  // Send email for selected events
  if (["category_exceeded", "low_balance", "high_expense", "recurring_reminder", "wishlist_goal_achieved"].includes(channel)) {
    console.log(`📧 Preparing to send email for event: ${channel}`); // Debug log
    await sendEmailNotification(channel, payload.user_id, payload);
  }
}

// ✅ Fetch user's email from Supabase
async function getUserEmail(userId) {
  console.log(`🔍 Fetching email for user ID: ${userId}`); // Debug log
  const { data, error } = await supabase
    .from("users") // Replace with your actual table name
    .select("email")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("❌ Error fetching user email:", error);
    return null;
  }
  console.log(`✅ User email retrieved: ${data?.email}`); // Debug log
  return data?.email || null;
}

// ✅ Send email notifications based on event
async function sendEmailNotification(event, userId, payload) {
  const userEmail = await getUserEmail(userId);
  if (!userEmail) {
    console.warn("⚠️ No email found for user. Skipping email.");
    return;
  }

  console.log(`📧 Sending email to ${userEmail} for event: ${event}`); // Debug log
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailContent = getEmailContent(event, payload);
  const mailOptions = {
    from: `"Wyzo" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Wyzo - ${emailContent.subject}`,
    text: emailContent.body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${userEmail} for event: ${event}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

// ✅ Generate email content based on event type
function getEmailContent(event, payload) {
  console.log(`📝 Generating email content for event: ${event}`); // Debug log
  const messages = {
    category_exceeded: {
      subject: `Budget Alert: ${payload.category_name} Limit Exceeded`,
      body: `Dear User, you've exceeded your spending limit in ${payload.category_name}. Consider revisiting your budget.`,
    },
    category_approaching: {
      subject: `Budget Warning: ${payload.category_name} Spending Near Limit`,
      body: `Dear User, your spending in ${payload.category_name} is nearing the limit. Stay mindful of your budget.`,
    },
    low_balance: {
      subject: "Low Balance Alert!",
      body: `Dear User, your available balance is running low. Review your expenses to avoid overspending.`,
    },
    high_expense: {
      subject: "Expense Alert: Unusual Spending Detected",
      body: `Dear User, a higher-than-usual transaction of ₹${payload.amount} was recorded for category: ${payload.category_id}.`,
    },
    recurring_reminder: {
      subject: "Payment Reminder: Upcoming Recurring Payments",
      body: `Dear User, your recurring payments for ${payload.label} are due soon.`,
    },
    wishlist_progress: {
      subject: `Goal Progress: ${payload.item}`,
      body: `You've reached ${payload.progress}% of your goal for ${payload.item}. Keep going!`,
    },
    wishlist_goal_achieved: {
      subject: `Goal Achieved: 🎉 ${payload.item}`,
      body: `Dear User, congratulations! You've successfully achieved your goal for ${payload.item}. Time to make it happen!`,
    },
  };
  return messages[event] || { subject: "Notification from Wyzo", body: "You have a new alert." };
}

// ✅ Export required functions
module.exports = {
  initSocketIo,
  listenToSupabaseNotifications,
};
