const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    brideName: {
      type: String,
      required: true,
      trim: true,
    },

    groomName: {
      type: String,
      required: true,
      trim: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "archived"],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
