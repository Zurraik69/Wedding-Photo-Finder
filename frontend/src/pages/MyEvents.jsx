import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyEvents.css";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch events");
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error("Fetch events error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this archived event?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/delete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete event");
      }

      // Remove deleted event from the current page
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );

      alert("Event deleted successfully");
    } catch (error) {
      console.error("Delete event error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  const archivedEvents = events.filter(
    (event) => event.status === "archived"
  );

  return (
    <div className="my-events-page">
      {/* Navbar */}
      <nav className="my-events-navbar">
        <div className="my-events-logo">
          Wedding Photo Finder
        </div>

        <div className="my-events-nav-links">
          <Link to="/photographer">Dashboard</Link>
          <Link to="/photographer/events">My Events</Link>
          <a href="#">Photos</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="my-events-container">
        <div className="my-events-header">
          <div>
            <h1>My Events</h1>
            <p>View your archived events</p>
          </div>

          <Link to="/photographer" className="back-dashboard-btn">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="my-events-message">
            Loading events...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="my-events-message error-message">
            {error}
          </div>
        )}

        {/* Events */}
        {!loading && !error && (
          <>
            <div className="archived-events-count">
              {archivedEvents.length} Archived Event
              {archivedEvents.length !== 1 ? "s" : ""}
            </div>

            {archivedEvents.length === 0 ? (
              <div className="my-events-message">
                No archived events found.
              </div>
            ) : (
              <div className="my-events-grid">
                {archivedEvents.map((event) => (
                  <div className="my-event-card" key={event._id}>
                    <div className="my-event-card-header">
                      <h2>{event.title}</h2>

                      <span className="archived-badge">
                        Archived
                      </span>
                    </div>

                    <div className="my-event-details">
                      <p>
                        <strong>👰 Bride:</strong>{" "}
                        {event.brideName}
                      </p>

                      <p>
                        <strong>🤵 Groom:</strong>{" "}
                        {event.groomName}
                      </p>

                      <p>
                        <strong>📅 Date:</strong>{" "}
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>

                      <p>
                        <strong>📍 Venue:</strong>{" "}
                        {event.venue}
                      </p>

                      <p>
                        <strong>🔑 Event Code:</strong>{" "}
                        {event.eventCode}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      className="delete-event-btn"
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      Delete Event
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MyEvents;