import React, { useState, useEffect } from "react";
import { UserCircle, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./profilemenu.css";

const NEW_BASE_URL = "http://localhost:5000/api/profile";  // Backend API URL

const ProfilePage = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetching user info from Supabase/Google OAuth
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      console.log("Stored User ID:", userId); // Debug log
      console.log("🔍 Debugging - Stored User ID:", userId);
      
      if (userId) {
        try {
          const response = await fetch(`${NEW_BASE_URL}?userId=${userId}`, {
            method: "GET",
            //credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="profile-container">
      {/* Profile Icon */}
      <div className="profile-icon" onClick={() => setOpen(!open)}>
        {user?.photo ? (
          <img src={user.photo} alt="Profile" />
        ) : (
          <UserCircle size={40} />
        )}
      </div>

      {/* Profile Popup */}
      {open && (
        <div className="profile-popup">
          <div className="profile-header">
            <X size={28} onClick={() => setOpen(false)} className="profile-close-icon" />
          </div>

          <div className="profile-content">
            <img
              src={user?.photo || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"}//user?.photo ||
              alt="User"
              className="profile-photo"
            />

            <h3>{user?.name || "Unknown User"}</h3>
            <p>{user?.email || "No email available"}</p>
            <p>Joined Since: {new Date(user?.created_at).toDateString() || "N/A"}</p>

            <button className="profile-logout-btn" onClick={handleLogout}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
