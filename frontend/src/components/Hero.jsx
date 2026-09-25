import "./Hero.css";

import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const handlePhotographerRequest = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/photographer-request",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Request failed");
        return;
      }

      alert(data.message);
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-label">WEDDING MEMORIES</p>

        <h1>
          Your Memories,
          <br />
          One Scan Away.
        </h1>

        <p className="hero-description">
          Find and download your wedding photos with just a simple QR code.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">Find My Photos</button>

          <button
            className="secondary-btn"
            onClick={handlePhotographerRequest}
          >
            I'm a Photographer
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;