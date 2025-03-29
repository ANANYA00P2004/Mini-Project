import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./profilemenu.css";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUserData(user);
      } else {
        console.error("Error fetching user data:", error);
      }
    };

    // Fetch user data on initial page load
    fetchUserData();
  }, []); // Empty dependency to run only once

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="wyzo-profile-menu">
      {userData?.user_metadata?.avatar_url ? (
        <img
          src={userData.user_metadata.avatar_url}
          alt="Profile"
          className="wyzo-profile-img"
          onClick={() => setOpen(!open)}
        />
      ) : (
        <FaUserCircle
          className="wyzo-profile-icon"
          onClick={() => setOpen(!open)}
        />
      )}

      {open && (
        <div className="wyzo-dropdown">
          <ul>
            <li>
              <a href="/profile" onClick={handleProfileClick}>
                Profile
              </a>
            </li>
            <li>
              <a href="/logout" onClick={handleLogout}>
                Logout
              </a>
            </li>
          </ul>
        </div>
      )}

      {modalOpen && (
        <>
          <div className="wyzo-backdrop" onClick={closeModal}></div>
          <div className="wyzo-modal">
            {userData ? (
              <>
                <img
                  src={userData.user_metadata.avatar_url || "default-avatar.png"}
                  alt="Profile"
                  className="wyzo-profile-pic"
                />
                <h2>{userData.user_metadata.full_name}</h2>
                <p>
                  <strong>Email:</strong> {userData.email}
                </p>
                <p>
                  <strong>User ID:</strong> {userData.id}
                </p>
                <p>
                  <strong>Joined:</strong>{" "}
                  {new Date(userData.created_at).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileMenu;
