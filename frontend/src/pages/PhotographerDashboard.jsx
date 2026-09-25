import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import CreateEventModal from "../components/CreateEventModal";
import "./PhotographerDashboard.css";

const PhotographerDashboard = () => {
  const navigate = useNavigate();

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadingEventId, setUploadingEventId] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // Show only non-archived events
  const visibleEvents = events.filter(
    (event) => event.status !== "archived"
  );

  // Fetch photographer's events
  const fetchMyEvents = async () => {
    try {
      setEventsError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch events"
        );
      }

      setEvents(data.events);
    } catch (error) {
      console.error(
        "Fetch events error:",
        error.message
      );

      setEventsError(error.message);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleEventCreated = (newEvent) => {
    setEvents((previousEvents) => [
      newEvent,
      ...previousEvents,
    ]);

    alert(
      `Event created successfully!\n\nEvent Code: ${newEvent.eventCode}`
    );
  };

  // Select multiple photos
  const handlePhotoSelect = (eventId, event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setUploadError(
        `Only image files are allowed. "${invalidFile.name}" is not an image.`
      );
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (oversizedFile) {
      setUploadError(
        `"${oversizedFile.name}" is larger than 10 MB.`
      );
      return;
    }

    setUploadError("");

    setSelectedFiles((previousFiles) => ({
      ...previousFiles,
      [eventId]: files,
    }));
  };

  // Upload selected photos
  const handleUploadPhoto = async (eventId) => {
    const files = selectedFiles[eventId];

    if (!files || files.length === 0) {
      setUploadError("Please select at least one photo first.");
      return;
    }

    try {
      setUploadError("");
      setUploadingEventId(eventId);

      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("eventId", eventId);

      files.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch(
        "http://localhost:5000/api/photos",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload photos"
        );
      }

      alert(
        `${files.length} photo${
          files.length > 1 ? "s" : ""
        } uploaded successfully!`
      );

      setSelectedFiles((previousFiles) => {
        const updatedFiles = {
          ...previousFiles,
        };

        delete updatedFiles[eventId];

        return updatedFiles;
      });

      const input = document.getElementById(
        `photo-upload-${eventId}`
      );

      if (input) {
        input.value = "";
      }
    } catch (error) {
      console.error(
        "Upload photos error:",
        error.message
      );

      setUploadError(error.message);
    } finally {
      setUploadingEventId(null);
    }
  };

  // Remove selected photos
  const handleRemoveSelectedPhoto = (eventId) => {
    setSelectedFiles((previousFiles) => {
      const updatedFiles = {
        ...previousFiles,
      };

      delete updatedFiles[eventId];

      return updatedFiles;
    });

    const input = document.getElementById(
      `photo-upload-${eventId}`
    );

    if (input) {
      input.value = "";
    }

    setUploadError("");
  };

  // Mark event as completed
  const handleCompleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to complete event"
        );
        return;
      }

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          (event._id || event.id) === eventId
            ? {
                ...event,
                status: "completed",
              }
            : event
        )
      );

      alert(
        "Event marked as completed successfully!"
      );
    } catch (error) {
      console.error(
        "Complete event error:",
        error.message
      );

      alert("Unable to connect to server");
    }
  };

  // Cancel event
  const handleCancelEvent = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to cancel event"
        );
        return;
      }

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          (event._id || event.id) === eventId
            ? {
                ...event,
                status: "cancelled",
              }
            : event
        )
      );

      alert("Event cancelled successfully!");
    } catch (error) {
      console.error(
        "Cancel event error:",
        error.message
      );

      alert("Unable to connect to server");
    }
  };

  // Archive event
  const handleArchiveEvent = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to archive this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/archive`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to archive event"
        );
        return;
      }

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          (event._id || event.id) === eventId
            ? {
                ...event,
                status: "archived",
              }
            : event
        )
      );

      alert("Event archived successfully!");
    } catch (error) {
      console.error(
        "Archive event error:",
        error.message
      );

      alert("Unable to connect to server");
    }
  };

  const openCreateEventModal = () => {
    setShowCreateEvent(true);
  };

  const closeCreateEventModal = () => {
    setShowCreateEvent(false);
  };

  return (
    <main className="photographer-dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">

          <span className="logo-mark">
            W
          </span>

          <div>
            <h2>Wedding Photo Finder</h2>
            <span>Photographer Studio</span>
          </div>

        </div>

        <div className="dashboard-nav-links">

          <button className="nav-link active">
            Dashboard
          </button>

          <button className="nav-link">
            My Events
          </button>

          <button className="nav-link">
            Photos
          </button>

        </div>

        <div className="dashboard-profile">

          <div className="profile-avatar">
            {user
              ? user.name.charAt(0).toUpperCase()
              : "P"}
          </div>

          <div className="profile-info">

            <strong>
              {user
                ? user.name
                : "Photographer"}
            </strong>

            <span>Photographer</span>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            ↪
          </button>

        </div>

      </nav>

      {/* ================= MAIN CONTENT ================= */}

      <div className="dashboard-container">

        {/* ================= WELCOME ================= */}

        <section className="welcome-section">

          <div className="welcome-content">

            <p className="dashboard-eyebrow">
              PHOTOGRAPHER STUDIO
            </p>

            <h1>
              Good evening{" "}
              <span>
                {user
                  ? user.name
                  : "Photographer"}
              </span>
            </h1>

            <p className="welcome-description">
              Capture beautiful moments, manage your
              events, and keep every wedding memory
              beautifully organized.
            </p>

          </div>

          <button
            className="create-event-button"
            onClick={openCreateEventModal}
          >
            <span>+</span>
            Create New Event
          </button>

        </section>

        {/* ================= STATS ================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              ◇
            </div>

            <div className="stat-content">

              <span>Total Events</span>

              <strong>
                {visibleEvents.length}
              </strong>

            </div>

            <span className="stat-label">
              Your events
            </span>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ▧
            </div>

            <div className="stat-content">

              <span>Total Photos</span>

              <strong>
                0
              </strong>

            </div>

            <span className="stat-label">
              Uploaded
            </span>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ♧
            </div>

            <div className="stat-content">

              <span>Total Guests</span>

              <strong>
                0
              </strong>

            </div>

            <span className="stat-label">
              Photo viewers
            </span>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ✦
            </div>

            <div className="stat-content">

              <span>Active Events</span>

              <strong>
                {
                  visibleEvents.filter(
                    (event) =>
                      event.status === "active"
                  ).length
                }
              </strong>

            </div>

            <span className="stat-label">
              Currently active
            </span>

          </div>

        </section>

        {/* ================= CONTENT GRID ================= */}

        <section className="dashboard-content-grid">

          {/* ================= FEATURED CARD ================= */}

          <div className="featured-card">

            <div className="featured-content">

              <p className="card-eyebrow">
                START SOMETHING BEAUTIFUL
              </p>

              <h2>
                Create your next wedding event
              </h2>

              <p>
                Create an event for your couple,
                generate a unique event identity,
                and start uploading their precious
                memories.
              </p>

              <button
                className="featured-button"
                onClick={openCreateEventModal}
              >
                Create Wedding Event
                <span>→</span>
              </button>

            </div>

            <div className="featured-decoration">

              <div className="decoration-ring">
                <span>W</span>
              </div>

              <div className="decoration-dot dot-one"></div>
              <div className="decoration-dot dot-two"></div>
              <div className="decoration-dot dot-three"></div>

            </div>

          </div>

          {/* ================= QUICK ACTIONS ================= */}

          <div className="quick-actions-card">

            <div className="section-heading">

              <div>

                <p className="card-eyebrow">
                  QUICK ACCESS
                </p>

                <h2>
                  Quick Actions
                </h2>

              </div>

            </div>

            <button
              className="quick-action"
              onClick={openCreateEventModal}
            >

              <div className="quick-action-icon">
                ◇
              </div>

              <div>
                <strong>
                  Create Event
                </strong>

                <span>
                  Set up a new wedding
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

            <button className="quick-action">

              <div className="quick-action-icon">
                ▧
              </div>

              <div>
                <strong>
                  Manage Photos
                </strong>

                <span>
                  Upload & organize photos
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

            <button className="quick-action">

              <div className="quick-action-icon">
                ♧
              </div>

              <div>
                <strong>
                  View My Events
                </strong>

                <span>
                  Manage your weddings
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

          </div>

        </section>

        {/* ================= RECENT EVENTS ================= */}

        <section className="recent-events-section">

          <div className="recent-events-header">

            <div>

              <p className="card-eyebrow">
                YOUR WORKSPACE
              </p>

              <h2>
                Recent Events
              </h2>

            </div>

            <button className="view-all-button">
              View All →
            </button>

          </div>

          {uploadError && (
            <div className="upload-error-message">
              {uploadError}
            </div>
          )}

          {loadingEvents ? (

            <div className="empty-events-card">
              <p>
                Loading your events...
              </p>
            </div>

          ) : eventsError ? (

            <div className="empty-events-card">

              <h3>
                Unable to load events
              </h3>

              <p>
                {eventsError}
              </p>

              <button
                className="empty-create-button"
                onClick={fetchMyEvents}
              >
                Try Again
              </button>

            </div>

          ) : visibleEvents.length === 0 ? (

            <div className="empty-events-card">

              <div className="empty-event-icon">
                ◇
              </div>

              <h3>
                No active events
              </h3>

              <p>
                Your active, completed, and cancelled
                wedding events will appear here.
                Archived events are kept out of the
                main dashboard.
              </p>

              <button
                className="empty-create-button"
                onClick={openCreateEventModal}
              >
                + Create New Event
              </button>

            </div>

          ) : (

            <div className="recent-events-grid">

              {visibleEvents.map((event) => {

                const eventId =
                  event._id || event.id;

                const guestUrl =
                  `${window.location.origin}/guest/event/${event.eventCode}`;

                const selectedFile =
                  selectedFiles[eventId];

                const isUploading =
                  uploadingEventId === eventId;

                return (

                  <div
                    className="event-card"
                    key={eventId}
                  >

                    <div className="event-card-top">

                      <span className="event-status">
                        {event.status}
                      </span>

                      <span className="event-code">
                        {event.eventCode}
                      </span>

                    </div>

                    <h3>
                      {event.title}
                    </h3>

                    <p className="event-couple">
                      {event.brideName} &{" "}
                      {event.groomName}
                    </p>

                    <div className="event-details">

                      <span>
                        📅{" "}
                        {new Date(
                          event.eventDate
                        ).toLocaleDateString()}
                      </span>

                      <span>
                        📍 {event.venue}
                      </span>

                    </div>

                    {/* ================= EVENT QR ================= */}

                    {event.status === "active" && (

                      <div
                        className="event-qr-section"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "24px",
                          padding: "20px",
                          border: "1px solid #e8e1db",
                          borderRadius: "12px",
                          background: "#faf8f6",
                        }}
                      >

                        <div
                          style={{
                            padding: "10px",
                            background: "#ffffff",
                            borderRadius: "8px",
                            border: "1px solid #e8e1db",
                          }}
                        >

                          <QRCodeSVG
                            value={guestUrl}
                            size={150}
                            bgColor="#ffffff"
                            fgColor="#292421"
                            level="H"
                            includeMargin={true}
                          />

                        </div>

                        <strong
                          style={{
                            fontSize: "14px",
                            color: "#39312d",
                          }}
                        >
                          Guest QR Code
                        </strong>

                        <span
                          style={{
                            fontSize: "12px",
                            color: "#8a817c",
                            textAlign: "center",
                          }}
                        >
                          Scan to find wedding photos
                        </span>

                      </div>

                    )}

                    {/* ================= PHOTO UPLOAD ================= */}

                    {event.status === "active" && (

                      <div className="event-photo-upload-section">

                        <input
                          id={`photo-upload-${eventId}`}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            handlePhotoSelect(
                              eventId,
                              e
                            )
                          }
                          style={{
                            display: "none",
                          }}
                        />

                        <button
                          type="button"
                          className="upload-photos-button"
                          onClick={() =>
                            document
                              .getElementById(
                                `photo-upload-${eventId}`
                              )
                              ?.click()
                          }
                          disabled={isUploading}
                        >
                          📸 Choose Photos
                        </button>

                        {selectedFile &&
                          selectedFile.length > 0 && (

                            <div className="selected-photos-info">

                              <strong>
                                {selectedFile.length} photo
                                {selectedFile.length > 1
                                  ? "s"
                                  : ""}{" "}
                                selected
                              </strong>

                              <div className="selected-photo-list">
                                {selectedFile.map(
                                  (file, index) => (
                                    <span
                                      className="selected-photo-name"
                                      key={`${file.name}-${index}`}
                                    >
                                      {file.name}
                                    </span>
                                  )
                                )}
                              </div>

                              <button
                                type="button"
                                className="upload-selected-photo-button"
                                onClick={() =>
                                  handleUploadPhoto(
                                    eventId
                                  )
                                }
                                disabled={isUploading}
                              >
                                {isUploading
                                  ? "Uploading..."
                                  : `Upload ${
                                      selectedFile.length
                                    } Photo${
                                      selectedFile.length > 1
                                        ? "s"
                                        : ""
                                    }`}
                              </button>

                              {!isUploading && (
                                <button
                                  type="button"
                                  className="remove-selected-photos-button"
                                  onClick={() =>
                                    handleRemoveSelectedPhoto(
                                      eventId
                                    )
                                  }
                                >
                                  Clear Selection
                                </button>
                              )}

                            </div>

                          )}

                      </div>

                    )}

                    {/* ================= EVENT ACTIONS ================= */}

                    {event.status === "active" && (

                      <div className="event-actions">

                        <button
                          className="complete-event-button"
                          onClick={() =>
                            handleCompleteEvent(
                              eventId
                            )
                          }
                          disabled={isUploading}
                        >
                          Mark as Completed
                        </button>

                        <button
                          className="cancel-event-button"
                          onClick={() =>
                            handleCancelEvent(
                              eventId
                            )
                          }
                          disabled={isUploading}
                        >
                          Cancel Event
                        </button>

                      </div>

                    )}

                    {(event.status === "completed" ||
                      event.status === "cancelled") && (

                      <div className="event-actions">

                        <button
                          className="archive-event-button"
                          onClick={() =>
                            handleArchiveEvent(
                              eventId
                            )
                          }
                        >
                          Archive Event
                        </button>

                      </div>

                    )}

                  </div>

                );
              })}

            </div>

          )}

        </section>

      </div>

      {/* ================= FOOTER ================= */}

      <footer className="dashboard-footer">

        <span>
          © 2026 Wedding Photo Finder
        </span>

        <span>
          Built for beautiful memories.
        </span>

      </footer>

      {/* ================= CREATE EVENT MODAL ================= */}

      {showCreateEvent && (

        <CreateEventModal
          onClose={closeCreateEventModal}
          onEventCreated={handleEventCreated}
        />

      )}

    </main>
  );
};

export default PhotographerDashboard;