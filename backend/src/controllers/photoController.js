const Photo = require("../models/Photo");
const Event = require("../models/Event");
const cloudinary = require("../config/cloudinary");
const fs = require("fs/promises");
const path = require("path");

const {
  generateFaceEmbeddings,
  generateFaceEmbeddingsFromFile,
} = require("../services/faceAIService");

const {
  findMatchingPhotos,
} = require("../services/faceMatchingService");


// ==========================================
// CREATE PHOTOS
// ==========================================

const createPhoto = async (req, res) => {
  try {
    const { eventId } = req.body;


    // ========================================
    // Check uploaded files
    // ========================================

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one photo is required",
      });
    }


    // ========================================
    // Check event ID
    // ========================================

    if (!eventId) {
      return res.status(400).json({
        message: "Event ID is required",
      });
    }


    // ========================================
    // Find photographer's event
    // ========================================

    const event = await Event.findOne({
      _id: eventId,
      photographer: req.user._id,
      isDeleted: false,
    });


    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }


    // ========================================
    // Only active events can receive photos
    // ========================================

    if (event.status !== "active") {
      return res.status(400).json({
        message:
          "Photos can only be uploaded to active events",
      });
    }


    // ========================================
    // Store uploaded photos
    // ========================================

    const uploadedPhotos = [];


    // ========================================
    // Process every photo
    // ========================================

    for (const file of req.files) {

      try {

        // ======================================
        // 1. Upload photo to Cloudinary
        // ======================================

        const result =
          await cloudinary.uploader.upload(
            file.path,
            {
              folder:
                `wedding-photo-finder/${event.eventCode}`,

              resource_type: "image",
            }
          );


        console.log(
          `Cloudinary upload successful: ${file.originalname}`
        );


        // ======================================
        // 2. Generate Face Embeddings
        // ======================================

        console.log(
          `Starting Face AI for: ${file.originalname}`
        );


        const faces =
          await generateFaceEmbeddings(
            result.secure_url
          );


        console.log(
          `Face AI completed for: ${file.originalname}`
        );


        console.log(
          `Faces detected: ${faces.length}`
        );


        // ======================================
        // 3. Save Photo + Face Embeddings
        // ======================================

        const photo = await Photo.create({

          event: event._id,

          photographer: req.user._id,

          // Original image remains on Cloudinary
          imageUrl: result.secure_url,

          filename: file.originalname,

          // Only numerical embeddings
          // are stored in MongoDB
          faces: faces.map((face) => ({
            faceId: face.faceId,
            embedding: face.embedding,
          })),
        });


        uploadedPhotos.push(photo);


        // ======================================
        // 4. Delete temporary local file
        // ======================================

        await fs.unlink(file.path);


        console.log(
          `Completed processing: ${file.originalname}`
        );


      } catch (uploadError) {

        console.error(
          `Failed to process ${file.originalname}:`,
          uploadError.message
        );


        // ======================================
        // Try temporary file cleanup
        // ======================================

        try {

          await fs.unlink(file.path);

        } catch (deleteError) {

          console.error(
            "Temporary file cleanup error:",
            deleteError.message
          );

        }


        throw uploadError;
      }
    }


    // ========================================
    // Success Response
    // ========================================

    res.status(201).json({

      message:
        `${uploadedPhotos.length} photos uploaded successfully`,

      photos: uploadedPhotos,
    });


  } catch (error) {

    console.error(
      "Create photos error:",
      error.message
    );


    res.status(500).json({
      message: "Failed to upload photos",
    });
  }
};


// ==========================================
// GUEST SELFIE FACE EMBEDDING
// ==========================================

const processGuestSelfie = async (req, res) => {

  let selfiePath = null;


  try {

    // ========================================
    // Check uploaded selfie
    // ========================================

    if (!req.file) {

      return res.status(400).json({
        message: "Selfie is required",
      });

    }


    selfiePath = path.resolve(req.file.path);


    console.log(
      `Starting Guest Selfie Face AI: ${req.file.originalname}`
    );


    // ========================================
    // Generate Face Embedding
    // ========================================

    const faces =
      await generateFaceEmbeddingsFromFile(
        selfiePath
      );


    console.log(
      "Guest Selfie Face AI completed"
    );


    console.log(
      `Faces detected: ${faces.length}`
    );


    // ========================================
    // Delete temporary selfie
    // ========================================

    await fs.unlink(
      selfiePath
    );


    selfiePath = null;


    console.log(
      "Guest selfie temporary file deleted"
    );


    // ========================================
    // No face detected
    // ========================================

    if (faces.length === 0) {

      return res.status(400).json({
        message:
          "No face detected. Please upload a clear selfie.",
      });

    }


    // ========================================
    // Return Face Embeddings
    // ========================================

    return res.status(200).json({

      message:
        "Guest selfie processed successfully",

      faces: faces.map((face) => ({

        faceId: face.faceId,

        embedding: face.embedding,

      })),

    });


  } catch (error) {

    console.error(
      "Guest selfie processing error:",
      error.message
    );


    // ========================================
    // Cleanup if processing failed
    // ========================================

    if (selfiePath) {

      try {

        await fs.unlink(
          selfiePath
        );

      } catch (deleteError) {

        console.error(
          "Guest selfie cleanup error:",
          deleteError.message
        );

      }

    }


    // ========================================
    // Error Response
    // ========================================

    return res.status(500).json({

      message:
        "Failed to process guest selfie",

    });

  }

};


// ==========================================
// FIND GUEST PHOTOS
// ==========================================

const findGuestPhotos = async (req, res) => {

  try {

    const { eventCode } = req.body;


    // ========================================
    // Check Event Code
    // ========================================

    if (!eventCode) {

      return res.status(400).json({
        message: "Event code is required",
      });

    }


    // ========================================
    // Check Guest Face Embedding
    // ========================================

    const { embedding } = req.body;


    if (!embedding || !Array.isArray(embedding)) {

      return res.status(400).json({
        message: "Face embedding is required",
      });

    }


    // ========================================
    // Validate Embedding Length
    // ========================================

    if (embedding.length !== 128) {

      return res.status(400).json({
        message:
          "Invalid face embedding. Expected 128 values.",
      });

    }


    // ========================================
    // Find Event
    // ========================================

    const event = await Event.findOne({
      eventCode,
      isDeleted: false,
    });


    if (!event) {

      return res.status(404).json({
        message: "Event not found",
      });

    }


    // ========================================
    // Check Event Status
    // ========================================

    if (
      event.status !== "active" &&
      event.status !== "completed"
    ) {

      return res.status(400).json({
        message:
          "Photos are not available for this event",
      });

    }


    // ========================================
    // Find Event Photos
    // ========================================

    const photos = await Photo.find({
      event: event._id,
    }).select(
      "_id imageUrl filename faces"
    );


    console.log(
      `Photos found for event ${eventCode}: ${photos.length}`
    );


    // ========================================
    // Find Matching Photos
    // ========================================

    const matches = findMatchingPhotos(
      embedding,
      photos,
      0.5
    );


    console.log(
      `Matching photos found: ${matches.length}`
    );


    // ========================================
    // Return Results
    // ========================================

    return res.status(200).json({

      message:
        "Photo matching completed successfully",

      eventCode,

      totalPhotos: photos.length,

      matchingPhotos: matches.length,

      photos: matches,

    });


  } catch (error) {

    console.error(
      "Find guest photos error:",
      error.message
    );


    return res.status(500).json({

      message:
        "Failed to find guest photos",

    });

  }

};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createPhoto,
  processGuestSelfie,
  findGuestPhotos,
};