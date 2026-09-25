const express = require("express");

const {
  createEvent,
  getMyEvents,
  getEventByCode,
  completeEvent,
  cancelEvent,
  archiveEvent,
  softDeleteEvent,
} = require("../controllers/eventController");

const protect = require("../middleware/authMiddleware");

const requireApprovedPhotographer = require("../middleware/photographerMiddleware");

const router = express.Router();


// =========================
// Guest Event Access
// =========================

// Get event by event code
// Public route - no authentication required
router.get(
  "/code/:eventCode",
  getEventByCode
);


// =========================
// Photographer Routes
// =========================

// Get photographer's events
router.get(
  "/",
  protect,
  requireApprovedPhotographer,
  getMyEvents
);


// Create event
router.post(
  "/",
  protect,
  requireApprovedPhotographer,
  createEvent
);


// Complete event
router.put(
  "/:id/complete",
  protect,
  requireApprovedPhotographer,
  completeEvent
);


// Cancel event
router.put(
  "/:id/cancel",
  protect,
  requireApprovedPhotographer,
  cancelEvent
);


// Archive event
router.put(
  "/:id/archive",
  protect,
  requireApprovedPhotographer,
  archiveEvent
);


// Soft delete event
router.put(
  "/:id/delete",
  protect,
  requireApprovedPhotographer,
  softDeleteEvent
);


module.exports = router;