import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import "./FutureEvent.css";

const API_BASE_URL = "http://localhost:5000/api/futureevents"; // Adjust according to backend URL

const FutureEvent = () => {
  const userId = localStorage.getItem("userId");
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    expected_amount: "",
    description: "",
  });
  const [filter, setFilter] = useState("all");
  const [pastEventId, setPastEventId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchEvents();
  }, [userId]);

  const fetchEvents = async () => {
    if (!userId) {
      console.error("User ID is missing.");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}?userId=${userId}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const addEvent = async () => {
    if (!formData.title || !formData.date || !formData.expected_amount || !formData.description) {
      alert("Please fill all fields.");
      return;
    }
  
    const newEvent = { user_id: userId, ...formData };
  
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
  
      if (response.ok) {
        fetchEvents(); // Refresh list after adding
        setFormData({ title: "", date: "", expected_amount: "", description: "" });
        setShowForm(false);
      } else {
        alert("Error adding event.");
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };
  
  const deleteEvent = async () => {
    if (!pastEventId) {
      console.error("Event ID is missing.");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/${pastEventId}`, { method: "DELETE" });
  
      if (response.ok) {
        fetchEvents(); // Refresh list after deletion
        setPastEventId(null);
      } else {
        alert("Error deleting event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const filteredEvents =
    filter === "past"
      ? events.filter((e) => e.date < today)
      : filter === "today"
      ? events.filter((e) => e.date === today)
      : filter === "future"
      ? events.filter((e) => e.date > today)
      : events;

  return (
    <Layout>
      <div className="future-events-container">
        <h2>Future Expenses</h2>
        <p className="subtitle">Plan ahead and let us remind you while adjusting your budget automatically.</p>

        <div className="filter-buttons">
          <button className={`filter-btn future ${filter === "future" ? "active" : ""}`} onClick={() => setFilter("future")}>Future</button>
          <button className={`filter-btn today ${filter === "today" ? "active" : ""}`} onClick={() => setFilter("today")}>Today</button>
          <button className={`filter-btn past ${filter === "past" ? "active" : ""}`} onClick={() => setFilter("past")}>Past</button>
          <button className={`filter-btn all ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        </div>

        <div className="add-event">
          <button className="plus-button" onClick={() => setShowForm(!showForm)}>+ Add Event</button>
        </div>

        {showForm && (
          <div className="event-form">
            <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} />
            <input type="date" name="date" value={formData.date} onChange={handleChange} />
            <input type="number" name="expected_amount" placeholder="Expected Amount" value={formData.expected_amount} onChange={handleChange} />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange}></textarea>
            <button onClick={addEvent}>Add</button>
          </div>
        )}

        {filteredEvents.length === 0 && <p className="no-events">No events found.</p>}

        <div className="events-list">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`event-tab ${event.date < today ? "past" : event.date === today ? "today" : "future"}`}
              onDoubleClick={() => event.date < today && setPastEventId(event.id)}
            >
              <h4>{event.title}</h4>
              <p>Date: {event.date}</p>
              <p>Amount: Rs.{event.expected_amount}</p>
              <p>{event.description}</p>
            </div>
          ))}
        </div>

        {pastEventId && (
          <div className="delete-confirm">
            <p>Delete past event?</p>
            <button onClick={deleteEvent} className="delete-btn">Delete</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FutureEvent;
