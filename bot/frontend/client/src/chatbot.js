import React, { useState } from "react";
import axios from "axios";
import './chabot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { text: "Hi! I’m here to provide financial tips and insights. How can I assist you?", sender: "bot" },
    ]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages([...messages, userMessage]);
        setInput("");

        try {
            const API_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5002";

            const response = await axios.post(`${API_URL}/api/get-response`, {
            message: input,
});



            const botResponse = response.data.response || "I'm not sure how to help with that.";
            setMessages([...messages, userMessage, { text: botResponse, sender: "bot" }]);
        } catch (error) {
            console.error("Error:", error);
            setMessages([...messages, { text: "Error fetching data. Try again.", sender: "bot" }]);
        }
       // console.log("API URL:", process.env.REACT_APP_SERVER_URL);

    };
    // Function to handle 'Enter' key press
const handleKeyPress = (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
};

    return (
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                //onChange={(e) => setInput(e.target.value)}
                //onKeyPress={(e) => handleKeyPress(e)}
                //onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chatbot;
