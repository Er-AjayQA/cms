const router = require("express").Router();

const superAdminAuthRoutes = require("../modules/auth/routes/super-admin-auth.routes");
const tenantAuthRoutes = require("../modules/auth/routes/tenant-auth.routes");
const superAdminRoutes = require("../modules/super-admin/routes/super-admin.routes");

router.use("/super-admin/auth", superAdminAuthRoutes);
router.use("/tenant/auth", tenantAuthRoutes);
router.use("/super-admin", superAdminRoutes);

module.exports = router;
