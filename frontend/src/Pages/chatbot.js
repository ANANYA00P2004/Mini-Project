import React, { useState, useEffect } from "react";
import axios from "axios";
import "./chatbot.css";
import ReactMarkdown from "react-markdown";
import Layout from "./Layout";
import { jsPDF } from "jspdf";

const Chatbot = () => {
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I’m here to provide financial tips and insights. How can I assist you?", sender: "bot" },
    ]);
    const [input, setInput] = useState("");
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportDuration, setReportDuration] = useState("7");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportData, setReportData] = useState(null);
    const [userId, setUserId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [type, setType] = useState("");

    useEffect(() => {
        const storedUserId = localStorage.getItem("user_id");
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            console.warn("User ID not found. Make sure the user is logged in.");
        }
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages([...messages, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const API_URL = "http://localhost:5002";
            const response = await axios.post(`${API_URL}/api/get-response`, {
                message: input,
            });

            const botResponse = response.data.response || "I'm not sure how to help with that.";
            setMessages([...messages, userMessage, { text: botResponse, sender: "bot" }]);
        } catch (error) {
            console.error("Error:", error);
            setMessages([...messages, { text: "Error fetching data. Try again.", sender: "bot" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateReport = async () => {
        const user_id = userId || localStorage.getItem("user_id");

        if (!user_id) {
            alert("User ID not found. Please log in again.");
            return;
        }

        let requestData = { user_id, duration: reportDuration };

        if (reportDuration === "custom") {
            if (!startDate || !endDate) {
                alert("Please select valid start and end dates.");
                return;
            }
            requestData.start_date = startDate;
            requestData.end_date = endDate;
        }

        if (categoryId) requestData.category_id = categoryId;
        if (type) requestData.type = type;

        try {
            const response = await axios.get("http://localhost:5002/api/generate-report", {
                params: requestData,
            });

            if (response.data.success) {
                setReportData(response.data.report);
                setShowReportModal(false);
            } else {
                alert("No data found for the selected period.");
            }
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Try again later.");
        }
    };

    const downloadPDF = () => {
        if (!reportData) {
            alert("No report data available to download.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("📊 Financial Report", 10, 10);

        let y = 20;

        Object.keys(reportData).forEach((date) => {
            doc.setFontSize(14);
            doc.text(`Date: ${date}`, 10, y);
            y += 8;

            reportData[date].forEach((item) => {
                doc.setFontSize(12);
                doc.text(`- ${item.category} | ${item.type} | $${item.amount}`, 10, y);
                y += 6;
            });
            y += 4;
        });

        doc.save("Financial_Report.pdf");
    };

    return (
        <Layout>
        <div className="chatbot-body">
            <div className="chatbot-container">
                <div className="chatbot-box">
                    {messages.map((msg, index) => (
                        <div key={index} className={`chatbot-message ${msg.sender === "bot" ? "chatbot-bot" : "chatbot-user"}`}>
                            {msg.sender === "bot" ? <ReactMarkdown>{msg.text}</ReactMarkdown> : <span>{msg.text}</span>}
                        </div>
                    ))}
                </div>

                <div className="chatbot-report-box">
                    <button onClick={() => setShowReportModal(true)}>📊 Generate Report</button>
                </div>

                {showReportModal && (
                    <div className="chatbot-modal-overlay">
                        <div className="chatbot-modal-content">
                            <h3>Select Report Duration</h3>
                            <select value={reportDuration} onChange={(e) => setReportDuration(e.target.value)}>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="custom">Custom Range</option>
                            </select>

                            <h3>Category:</h3>
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                <option value="">All Categories</option>
                                <option value="78">Food</option>
                                <option value="2">Transport</option>
                                <option value="3">Shopping</option>
                                <option value="4">Health</option>
                            </select>

                            <h3>Type:</h3>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>

                            {reportDuration === "custom" && (
                                <div>
                                    <label>Start Date:</label>
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    <label>End Date:</label>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            )}
                            <button type="submit" onClick={generateReport}>Generate</button>
                            <button onClick={() => setShowReportModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {reportData && (
                    <div className="chatbot-report-result">
                        <h3>📊 Financial Report</h3>
                        <button onClick={downloadPDF}>📥 Download PDF</button>
                        {Object.keys(reportData).length > 0 ? (
                            <div>
                                {Object.keys(reportData).map((date, idx) => (
                                    <div key={idx} className="chatbot-report-item">
                                        <h4>{date}</h4>
                                        {reportData[date].map((item, i) => (
                                            <div key={i}>
                                                <p><strong>Category:</strong> {item.category}</p>
                                                <p><strong>Type:</strong> {item.type}</p>
                                                <p><strong>Amount:</strong> ${item.amount}</p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No data found for the selected period.</p>
                        )}
                    </div>
                )}

                {isTyping && <div className="chatbot-typing-indicator">FinBot is typing...</div>}

                <input type="text" className="chatbot-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
                <button className="chatbot-button" onClick={sendMessage}>Send</button>
            </div>
        </div>
        </Layout>
    );
};

export default Chatbot;
