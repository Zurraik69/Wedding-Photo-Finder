const User = require("../models/User");

// Get all pending photographer requests
const getPendingPhotographers = async (req, res) => {
  try {
    const photographers = await User.find({
      photographerStatus: "pending",
    }).select("-password");

    res.status(200).json({
      message: "Pending photographer requests fetched successfully",
      photographers,
    });
  } catch (error) {
    console.error("Get pending photographers error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Approve photographer request
const approvePhotographer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if photographer request is pending
    if (user.photographerStatus !== "pending") {
      return res.status(400).json({
        message: "Photographer request is not pending",
      });
    }

    // Approve photographer
    user.role = "photographer";
    user.photographerStatus = "approved";

    await user.save();

    res.status(200).json({
      message: "Photographer approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photographerStatus: user.photographerStatus,
      },
    });
  } catch (error) {
    console.error("Approve photographer error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Reject photographer request
const rejectPhotographer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if photographer request is pending
    if (user.photographerStatus !== "pending") {
      return res.status(400).json({
        message: "Photographer request is not pending",
      });
    }

    // Reject photographer request
    user.role = "guest";
    user.photographerStatus = "rejected";

    await user.save();

    res.status(200).json({
      message: "Photographer request rejected successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photographerStatus: user.photographerStatus,
      },
    });
  } catch (error) {
    console.error("Reject photographer error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getPendingPhotographers,
  approvePhotographer,
  rejectPhotographer,
};