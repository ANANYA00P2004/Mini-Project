const express = require("express");
const router = express.Router();
const { getEvents, addEvent, deleteEvent } = require("../controllers/FutureEventController");

// Define routes
router.get("/", getEvents); // Fetch all events
router.post("/", addEvent); // Add a new event
router.delete("/:id", deleteEvent); // Delete an event by ID

module.exports = router;
