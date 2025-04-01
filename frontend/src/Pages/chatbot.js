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
    const [userInfo, setUserInfo] = useState(null);
    const [categoryId, setCategoryId] = useState("");
    const [type, setType] = useState("");
    const [budgetData, setBudgetData] = useState(null);
    const [categoriesData, setCategoriesData] = useState([]);
    const [transactionsData, setTransactionsData] = useState([]);
    const [groupedTransactions, setGroupedTransactions] = useState({});
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [netSavings, setNetSavings] = useState(0);
    const logopath= require('../images/logo.PNG');

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
            const API_URL = "http://localhost:5000";
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
            const response = await axios.get("http://localhost:5000/api/generate-report", {
                params: requestData,
            });

            if (response.data.success) {
                setReportData(response.data.report);
                setUserInfo(response.data.user);
                setBudgetData(response.data.budget);
                setCategoriesData(response.data.categories);
                setTransactionsData(response.data.transactions);
                setGroupedTransactions(response.data.groupedTransactions);
                setShowReportModal(false);

                
                if (response.data.summary) {
                    setTotalIncome(response.data.summary.totalIncome);
                    setTotalExpenses(response.data.summary.totalExpenses);
                    setNetSavings(response.data.summary.netSavings);
                }
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
    
        doc.setFillColor(0, 51, 102);
        doc.rect(0, 0, 210, 20, "F");
        doc.addImage(logopath, "PNG", 10, 5, 30, 30);
    
        doc.setFontSize(24);
        doc.setTextColor(255);
        doc.text("WYZO Financial Report", 70, 14);
    
        let y = 40;
    
        if (userInfo) {
            doc.setFontSize(14);
            doc.setTextColor(0, 51, 102);
            doc.setFont("helvetica", "bold");
            doc.text(`User: ${userInfo.name || "N/A"}`, 10, y);
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 51, 102);
            doc.line(10, y + 2, 70, y + 2); // Underline
            y += 10;
        }

        const periodText =
            reportDuration === "custom"
            ? `Reporting Period: ${startDate} to ${endDate}`
            : `Reporting Period: Last ${reportDuration} days`;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text(periodText, 10, y);
        y += 12;
    
        // 📊 Summary Box on Right
        doc.setFillColor(245, 245, 245);
        doc.rect(130, 40, 70, 30, "F");
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Key Highlights", 135, 46);
        doc.setFontSize(10);
        const topCategory =
        categoriesData && categoriesData.length > 0
            ? categoriesData[0].label
            : "N/A";
        doc.text(`Net Savings: $${netSavings}`, 135, 54);
        doc.text(`Top Spending: ${topCategory || "N/A"}`, 135, 60);
        
        // Budget Summary
        if (budgetData) {
            doc.setFontSize(16);
            doc.setTextColor(0, 102, 51);
            doc.text("Budget Summary", 10, y);
            y += 8;
    
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Monthly Income: $${budgetData.monthly_income}`, 15, y);
            y += 6;
            doc.text(`Expected Savings: $${budgetData.expected_savings}`, 15, y);
            y += 10;
        }
    
        // Financial Summary
        if (totalIncome !== undefined && totalExpenses !== undefined) {
            doc.setFontSize(16);
            doc.setTextColor(0, 102, 51);
            doc.text("Financial Summary", 10, y);
            y += 8;
    
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Total Income: $${totalIncome}`, 15, y);
            y += 6;
            doc.text(`Total Expenses: $${totalExpenses}`, 15, y);
            y += 6;
            doc.text(`Net Savings: $${netSavings}`, 15, y);
            y += 12;
        }
    
        // Categories
        if (categoriesData && categoriesData.length > 0) {
            doc.setFontSize(16);
            doc.setTextColor(0, 102, 51);
            doc.text("Categories", 10, y);
            y += 8;
    
            doc.setFontSize(12);
            doc.setTextColor(0);

            let x = 10;
            categoriesData.forEach((category, index) => {
                doc.text(`- ${category.label}`, x, y);
                x += 60;
                if ((index + 1) % 3 === 0) {
                    x = 10;
                    y += 6;
                }
            });
            y += 12;
        }
    
        // Transactions
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 51);
        doc.text("Transaction Details", 10, y);
        y += 8;
    
        Object.keys(reportData).forEach((date) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 100);
            doc.text(`Date: ${date}`, 10, y);
            y += 8;
    
            // Create Table Headers
            doc.setFillColor(230, 230, 230);
            doc.rect(10, y - 4, 190, 8, "F");
            doc.setTextColor(0);
            doc.text("Category", 15, y);
            doc.text("Type", 80, y);
            doc.text("Amount", 140, y);
            y += 6;

            reportData[date].forEach((item, index) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                const bgColor = index % 2 === 0 ? [240, 240, 240] : [255, 255, 255];
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                doc.rect(10, y - 4, 190, 8, "F");
    
                doc.setFontSize(12);
                doc.setTextColor(item.type === "income" ? 0 : 255, item.type === "income" ? 100 : 0, 0);
                doc.text(item.category, 15, y);
                doc.text(item.type, 80, y);
                doc.text(`$${item.amount}`, 140, y);
                y += 6;
            });
            y += 6;
        });

        // Add Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFillColor(0, 51, 102);
            doc.rect(0, doc.internal.pageSize.height - 15, 210, 15, "F");
            doc.setFontSize(10);
            doc.setTextColor(255);
            doc.text(
                `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleDateString()}`,
                105,
                doc.internal.pageSize.height - 5,
                { align: "center" }
            );
        }

         // 📝 Footer
        doc.setFontSize(10);
        doc.text("Wyzo Financial Management", 10, y + 10);
        doc.text("https://www.wyzoapp.com", 10, y + 16);
        doc.text("Support: support@wyzoapp.com", 10, y + 22);
        doc.text("Privacy Policy & Disclaimer", 10, y + 28);
    
        // Save the PDF
        doc.save("WYZO_Financial_Report.pdf");
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
                        <button onClick={downloadPDF}>📥 Download PDF</button><br></br>
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
