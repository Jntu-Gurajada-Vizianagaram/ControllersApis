const express = require("express");
const { requireRoles } = require("../middleware/auth");

const router = express.Router();
const legacyWebAccess = requireRoles("Admin", "Developer", "WebAdmin");

const legacyResponse = (req, res) => {
  res.status(410).json({
    message: "Legacy webadmin route is preserved for compatibility. Use the current /api/webadmin routes.",
    replacement: "/api/webadmin",
  });
};

router.use(legacyWebAccess);

router.get("/content", legacyResponse);
router.post("/content", legacyResponse);
router.put("/content/:id", legacyResponse);
router.delete("/content/:id", legacyResponse);

module.exports = router;
