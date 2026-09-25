const Event = require("../models/Event");

// Create wedding event
const createEvent = async (req, res) => {
  try {
    const { title, brideName, groomName, eventDate, venue } = req.body;

    if (!title || !brideName || !groomName || !eventDate || !venue) {
      return res.status(400).json({
        message: "All event fields are required",
      });
    }

    const eventCode =
      "WPF-" +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    const event = await Event.create({
      title,
      brideName,
      groomName,
      eventDate,
      venue,
      photographer: req.user._id,
      eventCode,
    });

    res.status(201).json({
      message: "Wedding event created successfully",
      event: {
        id: event._id,
        title: event.title,
        brideName: event.brideName,
        groomName: event.groomName,
        eventDate: event.eventDate,
        venue: event.venue,
        photographer: event.photographer,
        eventCode: event.eventCode,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Create event error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Get logged-in photographer's events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      photographer: req.user._id,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    console.error("Get events error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Get event by event code for guests
const getEventByCode = async (req, res) => {
  try {
    const { eventCode } = req.params;

    if (!eventCode) {
      return res.status(400).json({
        message: "Event code is required",
      });
    }

    const event = await Event.findOne({
      eventCode: eventCode.toUpperCase(),
      status: "active",
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    }).select(
      "title brideName groomName eventDate venue eventCode status"
    );

    if (!event) {
      return res.status(404).json({
        message: "Invalid event code",
      });
    }

    res.status(200).json({
      message: "Event found successfully",
      event,
    });
  } catch (error) {
    console.error("Get event by code error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Mark event as completed
const completeEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      photographer: req.user._id,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.status !== "active") {
      return res.status(400).json({
        message: "Only active events can be marked as completed",
      });
    }

    event.isDeleted = false;
    event.status = "completed";

    await event.save();

    res.status(200).json({
      message: "Event marked as completed successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Complete event error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Cancel event
const cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      photographer: req.user._id,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.status !== "active") {
      return res.status(400).json({
        message: "Only active events can be cancelled",
      });
    }

    event.isDeleted = false;
    event.status = "cancelled";

    await event.save();

    res.status(200).json({
      message: "Event cancelled successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Cancel event error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Archive event
const archiveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      photographer: req.user._id,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (
      event.status !== "completed" &&
      event.status !== "cancelled"
    ) {
      return res.status(400).json({
        message: "Only completed or cancelled events can be archived",
      });
    }

    event.status = "archived";

    await event.save();

    res.status(200).json({
      message: "Event archived successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Archive event error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Soft delete archived event
const softDeleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      photographer: req.user._id,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.status !== "archived") {
      return res.status(400).json({
        message: "Only archived events can be deleted",
      });
    }

    event.isDeleted = true;

    await event.save();

    res.status(200).json({
      message: "Event deleted successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
        isDeleted: event.isDeleted,
      },
    });
  } catch (error) {
    console.error("Soft delete event error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  createEvent,
  getMyEvents,
  getEventByCode,
  completeEvent,
  cancelEvent,
  archiveEvent,
  softDeleteEvent,
};