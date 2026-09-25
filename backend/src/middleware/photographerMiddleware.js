const requireApprovedPhotographer = (req, res, next) => {
  // Check photographer role
  if (req.user.role !== "photographer") {
    return res.status(403).json({
      message: "Photographer access required",
    });
  }

  // Check photographer approval
  if (req.user.photographerStatus !== "approved") {
    return res.status(403).json({
      message: "Photographer approval required",
    });
  }

  next();
};

module.exports = requireApprovedPhotographer;