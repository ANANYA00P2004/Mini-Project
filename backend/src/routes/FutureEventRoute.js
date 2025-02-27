const express = require("express");
const router = express.Router();
const FutureEventController = require("../controllers/FutureEventController");

// Route to fetch future events for a user
router.get("/:userId", FutureEventController.getEvents);

// Route to add a new future event
router.post("/", FutureEventController.addEvent);

// Route to delete a past event
router.delete("/:id", FutureEventController.deleteEvent);

module.exports = router;
