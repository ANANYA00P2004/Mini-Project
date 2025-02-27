import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import "./FutureEvent.css";

const API_URL = "http://localhost:5000/api/future-events";

const FutureEvent = ({ userId }) => {
    const [events, setEvents] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({ title: "", date: "", expected_amount: "", description: "" });
    const [pastEventId, setPastEventId] = useState(null); // Stores past event ID for deletion

    // Fetch events on load
    useEffect(() => {
        fetch(`${API_URL}/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setEvents(data);
                } else {
                    setEvents([]); // Ensure events is always an array
                }
            })
            .catch((err) => {
                console.error("Error fetching events:", err);
                setEvents([]); // Handle errors gracefully
            });
    }, [userId]);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Save event
    const saveEvent = async () => {
      if (!formData.title || !formData.date || !formData.expected_amount || !formData.description) {
          console.warn("❌ Missing fields, event not saved.");
          return;
      }
  
      console.log("📤 Sending data:", formData);
  
      try {
          const response = await fetch("http://localhost:5000/api/future-events", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData),
          });
  
          const result = await response.json();
          if (!response.ok) {
              console.error("❌ Failed to save event:", result);
              return;
          }
  
          console.log("✅ Event saved successfully:", result);
  
          setEvents((prevEvents) => [result, ...prevEvents]);
          setFormData({ title: "", date: "", expected_amount: "", description: "" });
          setFormVisible(false);
      } catch (error) {
          console.error("❌ Error saving event:", error);
      }
    };
  
  
    // Delete past event
    const deleteEvent = () => {
        if (!pastEventId) return;

        fetch(`${API_URL}/${pastEventId}`, { method: "DELETE" })
            .then(() => {
                setEvents(events.filter((event) => event.id !== pastEventId));
                setPastEventId(null);
            })
            .catch((err) => console.error("Error deleting event:", err));
    };

    // Categorize events
    const today = new Date().toISOString().split("T")[0];
    const upcoming = events.filter((e) => e.date > today);
    const todayEvents = events.filter((e) => e.date === today);
    const past = events.filter((e) => e.date < today);

    return (
        <Layout>
            <div className="future-events-container">
                <h2>Future Events</h2>
                <p>Plan ahead! Add future expenses and let us remind you while adjusting your budget automatically.</p>

                <div className="add-event">
                    <h3>Add Event</h3>
                    <button className="plus-button" onClick={() => setFormVisible(!formVisible)}>+</button>
                </div>

                {formVisible && (
                    <div className="event-form">
                        <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} />
                        <input type="date" name="date" value={formData.date} onChange={handleChange} />
                        <input type="number" name="expected_amount" placeholder="Expected Amount" value={formData.expected_amount} onChange={handleChange} />
                        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange}></textarea>
                        <button onClick={saveEvent} disabled={!formData.title || !formData.date || !formData.expected_amount || !formData.description}>Save</button>
                    </div>
                )}

                {events.length === 0 && <p className="no-events">No future events.</p>}

                {upcoming.length > 0 && <div className="events-row upcoming">Upcoming Events: {upcoming.map((e) => <span key={e.id}>{e.title}</span>)}</div>}
                {todayEvents.length > 0 && <div className="events-row today">Today's Events: {todayEvents.map((e) => <span key={e.id}>{e.title}</span>)}</div>}
                {past.length > 0 && (
                    <div className="events-row past">
                        Past Events: {past.map((e) => (
                            <span key={e.id} onDoubleClick={() => setPastEventId(e.id)}>{e.title}</span>
                        ))}
                        {pastEventId && <button onClick={deleteEvent}>Delete</button>}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default FutureEvent;
