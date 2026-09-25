const express = require("express");

const {
  getPendingPhotographers,
  approvePhotographer,
  rejectPhotographer,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminAuthMiddleware");

const router = express.Router();

// Get pending photographer requests
router.get(
  "/photographers/pending",
  protect,
  requireAdmin,
  getPendingPhotographers
);

// Approve photographer
router.put(
  "/photographers/:id/approve",
  protect,
  requireAdmin,
  approvePhotographer
);

// Reject photographer
router.put(
  "/photographers/:id/reject",
  protect,
  requireAdmin,
  rejectPhotographer
);

module.exports = router;