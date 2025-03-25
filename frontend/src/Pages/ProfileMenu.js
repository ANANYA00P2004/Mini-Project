import React, { useState, useEffect } from "react";
import { UserCircle, X, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./profilemenu.css";

const API_BASE_URL = "http://localhost:5000/api/profile";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);  
  const [user, setUser] = useState(null);

  const userId = localStorage.getItem("userId");
  const googleProfilePhoto = localStorage.getItem("googleProfilePhoto");

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await fetch(`${API_BASE_URL}?userId=${userId}`, {
            method: "GET",
            credentials: "include",  
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
  }, [userId]);

  const handleLogout = () => {
    // Clear local storage
    //localStorage.clear();
    
    // Navigate to home page
    navigate("/home");
  };

  return (
    <div className="wyzo-profile-menu">
      <UserCircle
        className="wyzo-profile-icon"
        onClick={() => setOpen(!open)}
        size={50}
        color="#0A0F5B"
      />
      
      {open && (
        <div className="wyzo-profile-popup">
          <div className="wyzo-profile-content">
            <div className="wyzo-profile-header">
              {googleProfilePhoto ? (
                <img 
                  src={googleProfilePhoto} 
                  alt="Google Profile" 
                  className="wyzo-profile-img" 
                />
              ) : user?.photo ? (
                <img src={user.photo} alt="Profile" className="wyzo-profile-img" />
              ) : (
                <UserCircle className="wyzo-default-icon" size={80} />
              )}
              <div className="wyzo-user-info">
                <h3>{user?.name || "User"}</h3>
                <p>{user?.email || "No email"}</p>
              </div>
            </div>
            <div className="wyzo-profile-message">
              <h2>Hello {user?.name || "user"}, let's manage your finances wisely!</h2>
            </div>
            <div className="wyzo-profile-footer">
              <button onClick={() => setProfileOpen(true)}>
                <User size={20} /> Profile
              </button>
              <button onClick={handleLogout}>
                <LogOut size={20} /> Logout
              </button>
            </div>

            {profileOpen && (
              <div className="wyzo-profile-details-popup">
                <div className="wyzo-profile-details-header">
                  <h3>User Details</h3>
                  <X size={30} onClick={() => setProfileOpen(false)} className="close-icon" />
                </div>
                <div className="wyzo-profile-details-content">
                  {googleProfilePhoto && (
                    <div className="wyzo-google-profile-photo">
                      <img 
                        src={googleProfilePhoto} 
                        alt="Google Profile" 
                        className="wyzo-google-profile-img" 
                      />
                    </div>
                  )}
                  <div className="wyzo-profile-details-text">
                    <p><strong>Name:</strong> {user?.name || "N/A"}</p>
                    <p><strong>Email:</strong> {user?.email || "N/A"}</p>
                    <p><strong>Member Since:</strong> {user?.created_at || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;