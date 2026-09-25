const express = require("express");

const {
  createPhoto,
  processGuestSelfie,
  findGuestPhotos,
} = require("../controllers/photoController");

const protect = require("../middleware/authMiddleware");

const requireApprovedPhotographer = require(
  "../middleware/photographerMiddleware"
);

const upload = require(
  "../middleware/uploadMiddleware"
);

const router = express.Router();


// ==========================================
// PHOTOGRAPHER PHOTO UPLOAD
// ==========================================

router.post(
  "/",
  protect,
  requireApprovedPhotographer,
  upload.array("photos", 50),
  createPhoto
);


// ==========================================
// GUEST SELFIE PROCESSING
// ==========================================

router.post(
  "/guest-selfie",
  upload.single("selfie"),
  processGuestSelfie
);


// ==========================================
// GUEST PHOTO MATCHING
// ==========================================

router.post(
  "/guest-matches",
  findGuestPhotos
);


module.exports = router;