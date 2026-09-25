import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import PhotographerDashboard from "./pages/PhotographerDashboard";
import MyEvents from "./pages/MyEvents";
import GuestEventPage from "./pages/GuestEventPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Photographer */}
        <Route path="/photographer" element={<PhotographerDashboard />} />

        <Route path="/photographer/events" element={<MyEvents />} />

        <Route path="/guest/event/:eventCode" element={<GuestEventPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
