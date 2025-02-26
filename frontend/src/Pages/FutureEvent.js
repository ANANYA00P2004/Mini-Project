import React, { useState, useEffect } from "react";
import Layout from "./Layout"; // Ensure Layout is imported
import supabase from "../supabaseClient";
import { FaPlus, FaTrash } from "react-icons/fa";
import "./FutureEvent.css";

const FutureEvent = () => {
  const [events, setEvents] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    expected_amount: "",
    description: "",
  });
  const [doubleClickedEvent, setDoubleClickedEvent] = useState(null);

  const user_id = "your-user-id"; // Replace with actual user ID (from auth)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("Future_Expenses")
        .select("*")
        .eq("user_id", user_id)
        .order("date", { ascending: true });

      if (error) console.error("Error fetching events:", error);
      else setEvents(data);
    };
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.expected_amount) return;
    const { data, error } = await supabase.from("Future_Expenses").insert([{ ...newEvent, user_id }]);

    if (error) console.error("Error adding event:", error);
    else {
      setEvents([data[0], ...events]);
      setNewEvent({ title: "", date: "", expected_amount: "", description: "" });
      setFormVisible(false);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("Future_Expenses").delete().eq("id", id);
    if (error) console.error("Error deleting event:", error);
    else setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <Layout>
      <div className="future-events">
        <h1 className="main-heading">Future Events</h1>
        <p className="description">Plan ahead! Add upcoming expenses, and we'll remind you while adjusting your budget.</p>

        <div className="add-event" onClick={() => setFormVisible(!formVisible)}>
          <h2>ADD EVENT</h2>
          <FaPlus className="add-icon" />
        </div>

        {formVisible && (
          <div className="event-form">
            <input type="text" name="title" placeholder="Event Title" onChange={handleChange} value={newEvent.title} />
            <input type="date" name="date" onChange={handleChange} value={newEvent.date} />
            <input type="number" name="expected_amount" placeholder="Expected Amount" onChange={handleChange} value={newEvent.expected_amount} />
            <textarea name="description" placeholder="Description" onChange={handleChange} value={newEvent.description}></textarea>
            <button onClick={handleSave}>Save</button>
          </div>
        )}

        <div className="events-list">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="event-item">
                {event.title} - ₹{event.expected_amount}
                <FaTrash onClick={() => handleDelete(event.id)} className="delete-icon" />
              </div>
            ))
          ) : (
            <p>No upcoming events.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FutureEvent;
