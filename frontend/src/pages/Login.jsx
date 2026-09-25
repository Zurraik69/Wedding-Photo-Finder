import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
      setError("Email is required");
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password === "") {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    if (!/[!@#$%^&*]/.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log("LOGIN USER:", data.user);

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save logged-in user information
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect admin to Admin Dashboard
      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (
        data.user.role === "photographer" &&
        data.user.photographerStatus === "approved"
      ) {
        navigate("/photographer");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <p className="login-label">PHOTOGRAPHER</p>

        <h1>Welcome Back</h1>

        <p className="login-description">
          Login to manage your wedding events and photos.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="register-link-text">
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
