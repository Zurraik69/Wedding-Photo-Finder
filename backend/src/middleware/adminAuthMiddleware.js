const requireAdmin = (req, res, next) => {
  // Check admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};

module.exports = requireAdmin;