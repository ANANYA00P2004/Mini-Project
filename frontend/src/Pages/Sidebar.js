import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./sidebar.css"; // This is isolated now
import logo from "../images/logo.PNG";
import { FaHome, FaMoneyBill, FaChartPie, FaBullseye, FaCalendarAlt, FaRobot } from "react-icons/fa";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="wyzo-container"> {/* Unique Wrapper */}
            <div 
                className={`wyzo-sidebar ${isOpen ? "open" : "closed"}`}
                onMouseEnter={() => setIsOpen(true)} 
                onMouseLeave={() => setIsOpen(false)}
            >
                <div className="wyzo-sidebar-top">
                    <img src={logo} alt="WYZO Logo" className="wyzo-sidebar-logo" />
                </div>

                <nav className="wyzo-sidebar-links">
                    <Link to="/home" className="wyzo-sidebar-link"><FaHome /><span className="wyzo-link-text">Home</span></Link>
                    <Link to="/expenses" className="wyzo-sidebar-link"><FaMoneyBill /><span className="wyzo-link-text">Expenses</span></Link>
                    <Link to="/plan" className="wyzo-sidebar-link"><FaChartPie /><span className="wyzo-link-text">Budget Plan</span></Link>
                    <Link to="/wishlist" className="wyzo-sidebar-link"><FaBullseye /><span className="wyzo-link-text">Goals</span></Link>
                    <Link to="/futureevents" className="wyzo-sidebar-link"><FaCalendarAlt /><span className="wyzo-link-text">Events</span></Link>
                    <Link to="/chatbot" className="wyzo-sidebar-link"><FaRobot /><span className="wyzo-link-text">Chatbot</span></Link>
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
