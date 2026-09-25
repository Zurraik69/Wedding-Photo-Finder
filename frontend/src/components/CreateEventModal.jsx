import React, { useState } from "react";
import "./CreateEventModal.css";

const CreateEventModal = ({ onClose, onEventCreated }) => {
  const [title, setTitle] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !brideName || !groomName || !eventDate || !venue) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            brideName,
            groomName,
            eventDate,
            venue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create event");
        return;
      }

      onEventCreated(data.event);
      onClose();
    } catch (error) {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-overlay">
      <div className="create-event-modal">
        <button
          className="modal-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="modal-header">
          <p className="card-eyebrow">NEW WEDDING EVENT</p>

          <h2>Create Wedding Event</h2>

          <p>
            Add the basic details of the wedding event to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="event-form-group">
            <label htmlFor="title">Event Title</label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Rahul & Priya Wedding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="event-form-row">
            <div className="event-form-group">
              <label htmlFor="brideName">Bride Name</label>

              <input
                id="brideName"
                type="text"
                placeholder="Bride's name"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
              />
            </div>

            <div className="event-form-group">
              <label htmlFor="groomName">Groom Name</label>

              <input
                id="groomName"
                type="text"
                placeholder="Groom's name"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
              />
            </div>
          </div>

          <div className="event-form-row">
            <div className="event-form-group">
              <label htmlFor="eventDate">Wedding Date</label>

              <input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="event-form-group">
              <label htmlFor="venue">Venue</label>

              <input
                id="venue"
                type="text"
                placeholder="Wedding venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="event-form-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-event-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;