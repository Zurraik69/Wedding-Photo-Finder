const express = require("express");

const {
  registerUser,
  loginUser,
  requestPhotographerAccess,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const requireApprovedPhotographer = require("../middleware/photographerMiddleware");

const requireAdmin = require("../middleware/adminAuthMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

// Photographer access request
router.post(
  "/photographer-request",
  protect,
  requestPhotographerAccess
);

// Protected test route
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

// Photographer protected test route
router.get(
  "/photographer-test",
  protect,
  requireApprovedPhotographer,
  (req, res) => {
    res.status(200).json({
      message: "Approved photographer access granted",
      user: req.user,
    });
  }
);

// Admin protected test route
router.get(
  "/admin-test",
  protect,
  requireAdmin,
  (req, res) => {
    res.status(200).json({
      message: "Admin access granted",
      user: req.user,
    });
  }
);

module.exports = router;