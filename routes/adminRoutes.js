const express = require("express");
const { requireRoles } = require("../middleware/auth");

const router = express.Router();
const legacyAdminAccess = requireRoles("Admin", "Developer");

const legacyResponse = (req, res) => {
  res.status(410).json({
    message: "Legacy admin route is preserved for compatibility. Use the current /api/admins routes.",
    replacement: "/api/admins",
  });
};

router.use(legacyAdminAccess);

router.get("/dashboard", legacyResponse);
router.post("/users", legacyResponse);
router.put("/users/:id", legacyResponse);
router.delete("/users/:id", legacyResponse);

router.get("/admins", legacyResponse);
router.post("/admins", legacyResponse);
router.put("/admins/:id", legacyResponse);
router.delete("/admins/:id", legacyResponse);

module.exports = router;
