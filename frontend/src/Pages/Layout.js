import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";
import "./layout.css";

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className={`wyzo-container ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="wyzo-main-content">
                <ProfileMenu />
                <div className="wyzo-page-content">{children}</div>
            </div>
        </div>
    );
};

export default Layout;
