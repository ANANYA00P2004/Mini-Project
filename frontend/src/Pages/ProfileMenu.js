import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "./profilemenu.css";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="wyzo-profile-menu">
      <FaUserCircle className="wyzo-profile-icon" onClick={() => setOpen(!open)} />
      {open && (
        <div className="wyzo-dropdown">
          <ul>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/logout">Logout</a></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;