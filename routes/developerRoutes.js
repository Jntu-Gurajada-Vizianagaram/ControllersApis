const express = require("express");
const { requireRoles } = require("../middleware/auth");

const router = express.Router();
const legacyDeveloperAccess = requireRoles("Admin", "Developer");

const legacyResponse = (req, res) => {
  res.status(410).json({
    message: "Legacy developer route is preserved for compatibility. Use the current /api routes.",
    replacement: "/api",
  });
};

router.use(legacyDeveloperAccess);

router.get("/metrics", legacyResponse);
router.get("/sites/status", legacyResponse);
router.get("/api/timings", legacyResponse);

module.exports = router;
