import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import logo from "../assets/logo.png";
import "./GuestEventPage.css";

const GuestEventPage = () => {
  const { eventCode } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [findingPhotos, setFindingPhotos] = useState(false);

  // Matching photos
  const [matchingPhotos, setMatchingPhotos] = useState([]);
  const [searchCompleted, setSearchCompleted] = useState(false);

  // Selected matching photo for lightbox
  const [selectedMatchingPhoto, setSelectedMatchingPhoto] =
    useState(null);

  // Matching gallery scroll reference
  const matchingGalleryRef = useRef(null);

  // Prevent multiple automatic scrolls
  const hasScrolledToResultsRef = useRef(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/events/code/${eventCode}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to find this event"
          );
        }

        setEvent(data.event);
      } catch (error) {
        console.error(
          "Guest event error:",
          error.message
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventCode) {
      fetchEvent();
    }
  }, [eventCode]);

  const handleOpenCamera = async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera access is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error(
        "Camera error:",
        error.message
      );

      setCameraError(
        "Unable to access camera. Please allow camera permission and try again."
      );
    }
  };

  useEffect(() => {
    if (!cameraOpen) {
      return;
    }

    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) {
      return;
    }

    video.srcObject = stream;

    const startVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error(
          "Video play error:",
          error.message
        );
      }
    };

    if (video.readyState >= 1) {
      startVideo();
    } else {
      video.onloadedmetadata = startVideo;
    }

    return () => {
      video.onloadedmetadata = null;
    };
  }, [cameraOpen]);

  const handleCapturePhoto = () => {
    const video = videoRef.current;

    if (!video) {
      setCameraError(
        "Camera preview is not ready yet."
      );
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setCameraError(
        "Camera is still starting. Please wait a moment and try again."
      );
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError(
        "Unable to capture photo."
      );
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError(
            "Unable to create photo."
          );
          return;
        }

        const file = new File(
          [blob],
          "selfie.jpg",
          {
            type: "image/jpeg",
          }
        );

        const previewUrl =
          URL.createObjectURL(blob);

        setSelectedPhoto(file);
        setPhotoPreview(previewUrl);

        // Clear previous search results
        setMatchingPhotos([]);
        setSearchCompleted(false);
        setSelectedMatchingPhoto(null);

        hasScrolledToResultsRef.current = false;

        handleCloseCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setSelectedPhoto(file);

    const previewUrl =
      URL.createObjectURL(file);

    setPhotoPreview(previewUrl);

    // Clear previous search results
    setMatchingPhotos([]);
    setSearchCompleted(false);
    setSelectedMatchingPhoto(null);

    hasScrolledToResultsRef.current = false;
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setSelectedPhoto(null);
    setPhotoPreview("");

    // Clear previous matching results
    setMatchingPhotos([]);
    setSearchCompleted(false);
    setSelectedMatchingPhoto(null);

    hasScrolledToResultsRef.current = false;

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const handleFindPhotos = async () => {
    if (!selectedPhoto) {
      alert("Please select or capture a selfie first.");
      return;
    }

    try {
      setFindingPhotos(true);
      setCameraError("");

      // Clear previous results
      setMatchingPhotos([]);
      setSearchCompleted(false);
      setSelectedMatchingPhoto(null);

      hasScrolledToResultsRef.current = false;

      console.log(
        "Step 1: Uploading guest selfie..."
      );

      const formData = new FormData();

      formData.append(
        "selfie",
        selectedPhoto
      );

      const selfieResponse = await fetch(
        "http://localhost:5000/api/photos/guest-selfie",
        {
          method: "POST",
          body: formData,
        }
      );

      const selfieData =
        await selfieResponse.json();

      if (!selfieResponse.ok) {
        throw new Error(
          selfieData.message ||
            "Failed to process guest selfie"
        );
      }

      console.log(
        "Guest selfie processed successfully."
      );

      if (
        !selfieData.faces ||
        selfieData.faces.length === 0
      ) {
        throw new Error(
          "No face detected. Please upload a clear selfie."
        );
      }

      const guestEmbedding =
        selfieData.faces[0].embedding;

      console.log(
        "Guest embedding length:",
        guestEmbedding.length
      );

      console.log(
        "Step 2: Searching matching photos..."
      );

      const matchResponse = await fetch(
        "http://localhost:5000/api/photos/guest-matches",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventCode,
            embedding: guestEmbedding,
          }),
        }
      );

      const matchData =
        await matchResponse.json();

      if (!matchResponse.ok) {
        throw new Error(
          matchData.message ||
            "Failed to find matching photos"
        );
      }

      console.log(
        "Guest photo matching completed successfully."
      );

      console.log(
        "Matching photos:",
        matchData.photos
      );

      console.log(
        "Total matching photos:",
        matchData.matchingPhotos
      );

      // Store matching photos
      setMatchingPhotos(
        matchData.photos || []
      );

      // Search complete
      setSearchCompleted(true);

    } catch (error) {
      console.error(
        "Find photos error:",
        error.message
      );

      alert(
        error.message ||
          "Failed to find your photos."
      );
    } finally {
      setFindingPhotos(false);
    }
  };

  // ========================================
  // AUTOMATIC SCROLL TO MATCHING PHOTOS
  // ========================================

  const scrollToMatchingGallery = () => {
    if (
      hasScrolledToResultsRef.current ||
      !matchingGalleryRef.current
    ) {
      return;
    }

    hasScrolledToResultsRef.current = true;

    requestAnimationFrame(() => {
      setTimeout(() => {
        matchingGalleryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    });
  };

  // ========================================
  // MATCHING PHOTO LIGHTBOX FUNCTIONS
  // ========================================

  const handleOpenMatchingPhoto = (photo) => {
    setSelectedMatchingPhoto(photo);
  };

  const handleCloseMatchingPhoto = () => {
    setSelectedMatchingPhoto(null);
  };

  const handlePreviousMatchingPhoto = () => {
    if (
      !selectedMatchingPhoto ||
      matchingPhotos.length <= 1
    ) {
      return;
    }

    const currentIndex =
      matchingPhotos.findIndex(
        (photo) =>
          photo.photoId ===
          selectedMatchingPhoto.photoId
      );

    const previousIndex =
      currentIndex === 0
        ? matchingPhotos.length - 1
        : currentIndex - 1;

    setSelectedMatchingPhoto(
      matchingPhotos[previousIndex]
    );
  };

  const handleNextMatchingPhoto = () => {
    if (
      !selectedMatchingPhoto ||
      matchingPhotos.length <= 1
    ) {
      return;
    }

    const currentIndex =
      matchingPhotos.findIndex(
        (photo) =>
          photo.photoId ===
          selectedMatchingPhoto.photoId
      );

    const nextIndex =
      currentIndex === matchingPhotos.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedMatchingPhoto(
      matchingPhotos[nextIndex]
    );
  };

  const getDownloadUrl = (imageUrl) => {
    return imageUrl.replace(
      "/upload/",
      "/upload/fl_attachment/"
    );
  };

  // ========================================
  // CLEANUP
  // ========================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // ========================================
  // IF NO MATCHING PHOTOS
  // ========================================

  useEffect(() => {
    if (
      searchCompleted &&
      matchingPhotos.length === 0
    ) {
      scrollToMatchingGallery();
    }
  }, [searchCompleted, matchingPhotos.length]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="guest-event-page">
        <div className="guest-event-card">

          <div className="guest-event-loader"></div>

          <h2>Finding Your Event</h2>

          <p>
            Please wait while we load your wedding event.
          </p>

        </div>
      </main>
    );
  }

  // ========================================
  // EVENT ERROR
  // ========================================

  if (error || !event) {
    return (
      <main className="guest-event-page">

        <div className="guest-event-card guest-error-card">

          <div className="guest-error-icon">
            !
          </div>

          <h2>Event Not Found</h2>

          <p>
            {error ||
              "This event could not be found."}
          </p>

          <span className="guest-event-code">
            Event Code: {eventCode}
          </span>

        </div>

      </main>
    );
  }

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <main className="guest-event-page">

      <div className="guest-event-card">

        {/* ========================================
            BRAND
        ======================================== */}

        <div className="guest-event-brand">

          <div className="guest-logo-mark">

            <img
              src={logo}
              alt="Wedding Photo Finder logo"
            />

          </div>

          <div>

            <h1>Wedding Photo Finder</h1>

            <span>
              Guest Access
            </span>

          </div>

        </div>

        <div className="guest-event-content">

          {/* ========================================
              EVENT INFORMATION
          ======================================== */}

          <p className="guest-eyebrow">
            WELCOME TO THE EVENT
          </p>

          <h2>
            {event.title}
          </h2>

          <p className="guest-couple">
            {event.brideName} & {event.groomName}
          </p>

          <div className="guest-event-details">

            <div className="guest-detail">

              <span className="guest-detail-icon">
                📅
              </span>

              <div>

                <span>
                  Date
                </span>

                <strong>
                  {new Date(
                    event.eventDate
                  ).toLocaleDateString()}
                </strong>

              </div>

            </div>

            <div className="guest-detail">

              <span className="guest-detail-icon">
                📍
              </span>

              <div>

                <span>
                  Venue
                </span>

                <strong>
                  {event.venue}
                </strong>

              </div>

            </div>

          </div>

          {/* ========================================
              SELFIE SECTION
          ======================================== */}

          {event.status === "active" ? (

            <div className="selfie-section">

              {/* ========================================
                  CAMERA OPEN
              ======================================== */}

              {cameraOpen ? (

                <>

                  <div className="camera-preview-wrapper">

                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-preview"
                    />

                  </div>

                  <h3>
                    Take Your Selfie
                  </h3>

                  <p>
                    Position your face clearly
                    inside the camera preview.
                  </p>

                  {cameraError && (
                    <p className="camera-error">
                      {cameraError}
                    </p>
                  )}

                  <div className="camera-actions">

                    <button
                      type="button"
                      className="selfie-find-button"
                      onClick={handleCapturePhoto}
                      disabled={findingPhotos}
                    >
                      📸 Capture Photo
                    </button>

                    <button
                      type="button"
                      className="selfie-remove-button"
                      onClick={handleCloseCamera}
                      disabled={findingPhotos}
                    >
                      Cancel
                    </button>

                  </div>

                </>

              ) : photoPreview ? (

                /* ========================================
                   PHOTO READY
                ======================================== */

                <>

                  <div className="selfie-preview-wrapper">

                    <img
                      src={photoPreview}
                      alt="Selected selfie"
                      className="selfie-preview"
                    />

                  </div>

                  <h3>
                    Photo Ready
                  </h3>

                  <p>
                    Your photo is ready. Continue
                    to find your wedding photos.
                  </p>

                  <button
                    type="button"
                    className="selfie-find-button"
                    onClick={handleFindPhotos}
                    disabled={findingPhotos}
                  >
                    {findingPhotos
                      ? "Finding Your Photos..."
                      : "Find My Photos"}
                  </button>

                  <button
                    type="button"
                    className="selfie-remove-button"
                    onClick={handleRemovePhoto}
                    disabled={findingPhotos}
                  >
                    Remove / Choose Another
                  </button>

                </>

              ) : (

                /* ========================================
                   SELECT SELFIE
                ======================================== */

                <>

                  <div className="selfie-icon">
                    📸
                  </div>

                  <h3>
                    Find Your Photos
                  </h3>

                  <p>
                    Take a selfie or choose a photo
                    from your gallery to find your
                    wedding photos.
                  </p>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handlePhotoSelect}
                    style={{
                      display: "none",
                    }}
                  />

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{
                      display: "none",
                    }}
                  />

                  <div className="selfie-options">

                    <button
                      type="button"
                      className="selfie-option-button"
                      onClick={handleOpenCamera}
                    >
                      <span className="selfie-option-icon">
                        📷
                      </span>

                      <span>
                        Take a Photo
                      </span>

                    </button>

                    <button
                      type="button"
                      className="selfie-option-button"
                      onClick={() =>
                        galleryInputRef.current?.click()
                      }
                    >
                      <span className="selfie-option-icon">
                        🖼️
                      </span>

                      <span>
                        Choose from Gallery
                      </span>

                    </button>

                  </div>

                  {cameraError && (
                    <p className="camera-error">
                      {cameraError}
                    </p>
                  )}

                  <small>
                    Use a clear photo where your face
                    is clearly visible.
                  </small>

                </>

              )}

            </div>

          ) : (

            /* ========================================
               EVENT UNAVAILABLE
            ======================================== */

            <div className="event-unavailable">

              <div className="unavailable-icon">
                ✓
              </div>

              <h3>
                This Event Is No Longer Active
              </h3>

              <p>
                Photo access is currently unavailable
                for this event.
              </p>

            </div>

          )}

          {/* ========================================
              MATCHING PHOTOS GALLERY
          ======================================== */}

          {searchCompleted && (

            <div
              ref={matchingGalleryRef}
              className="matching-gallery-section"
            >

              <div className="matching-gallery-header">

                <h2>
                  Your Matching Photos
                </h2>

                <p>
                  {matchingPhotos.length > 0
                    ? `We found ${
                        matchingPhotos.length
                      } photo${
                        matchingPhotos.length > 1
                          ? "s"
                          : ""
                      } matching your face.`
                    : "No matching photos were found for your selfie."}
                </p>

              </div>

              {matchingPhotos.length > 0 && (

                <div className="matching-photo-grid">

                  {matchingPhotos.map((photo) => (

                    <button
                      key={photo.photoId}
                      type="button"
                      className="matching-photo-card"
                      onClick={() =>
                        handleOpenMatchingPhoto(
                          photo
                        )
                      }
                    >

                      <img
                        src={photo.imageUrl}
                        alt={photo.filename}
                        className="matching-photo-thumbnail"
                        onLoad={scrollToMatchingGallery}
                      />

                      <div className="matching-photo-overlay">

                        <span>
                          View Photo
                        </span>

                      </div>

                    </button>

                  ))}

                </div>

              )}

            </div>

          )}

        </div>

        {/* ========================================
            PHOTO LIGHTBOX
        ======================================== */}

        {selectedMatchingPhoto && (

          <div
            className="photo-lightbox"
            onClick={handleCloseMatchingPhoto}
          >

            {/* CLOSE */}

            <button
              type="button"
              className="lightbox-close-button"
              onClick={handleCloseMatchingPhoto}
              aria-label="Close photo"
            >
              ✕
            </button>

            {/* PREVIOUS / NEXT */}

            {matchingPhotos.length > 1 && (

              <>

                <button
                  type="button"
                  className="lightbox-nav-button lightbox-prev-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePreviousMatchingPhoto();
                  }}
                  aria-label="Previous photo"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="lightbox-nav-button lightbox-next-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNextMatchingPhoto();
                  }}
                  aria-label="Next photo"
                >
                  ›
                </button>

              </>

            )}

            {/* LIGHTBOX CONTENT */}

            <div
              className="lightbox-content"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <img
                src={
                  selectedMatchingPhoto.imageUrl
                }
                alt={
                  selectedMatchingPhoto.filename
                }
                className="lightbox-image"
              />

              <div className="lightbox-info">

                <p className="lightbox-filename">
                  {
                    selectedMatchingPhoto.filename
                  }
                </p>

                <p className="lightbox-similarity">
                  Face Match:{" "}
                  {(
                    selectedMatchingPhoto.similarity *
                    100
                  ).toFixed(1)}
                  %
                </p>

                <a
                  href={getDownloadUrl(
                    selectedMatchingPhoto.imageUrl
                  )}
                  className="lightbox-download-button"
                >
                  ↓ Download Original Photo
                </a>

              </div>

            </div>

          </div>

        )}

        {/* ========================================
            FOOTER
        ======================================== */}

        <footer className="guest-event-footer">

          <span>
            © 2026 Wedding Photo Finder
          </span>

          <span>
            Built for beautiful memories.
          </span>

        </footer>

      </div>

    </main>
  );
};

export default GuestEventPage;