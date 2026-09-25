const mongoose = require("mongoose");


// ==========================================
// FACE SCHEMA
// ==========================================

const faceSchema = new mongoose.Schema(
  {
    faceId: {
      type: Number,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    _id: false,
  }
);


// ==========================================
// PHOTO SCHEMA
// ==========================================

const photoSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    // ======================================
    // FACE EMBEDDINGS
    // ======================================

    faces: {
      type: [faceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Photo", photoSchema);