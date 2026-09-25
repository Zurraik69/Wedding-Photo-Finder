import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingPhotographers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/admin/photographers/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch requests");
      }

      setPhotographers(data.photographers);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPhotographers();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/admin/photographers/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Approval failed");
        return;
      }

      alert(data.message);

      fetchPendingPhotographers();
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/admin/photographers/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Rejection failed");
        return;
      }

      alert(data.message);

      fetchPendingPhotographers();
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  if (loading) {
    return <p>Loading photographer requests...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Photographer Approval Requests</p>

      {photographers.length === 0 ? (
        <p>No pending photographer requests.</p>
      ) : (
        <div>
          {photographers.map((photographer) => (
            <div key={photographer._id}>
              <h3>{photographer.name}</h3>

              <p>{photographer.email}</p>

              <p>Status: {photographer.photographerStatus}</p>

              <button onClick={() => handleApprove(photographer._id)}>
                Approve
              </button>

              <button onClick={() => handleReject(photographer._id)}>
                Reject
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;