const router = require("express").Router();
const { authSuperAdmin } = require("../middlewares/auth-super-admin");
const {
  requireSuperAdminPermission,
} = require("../middlewares/authorize-super-admin");
const accessRoutes = require("../access/routes/access.routes");
const dashboardRoutes = require("../dashboard/routes/dashboard.routes");
const domainRoutes = require("../domains/routes/domain.routes");
const subscriptionRoutes = require("../subscriptions/routes/subscription.routes");
const tenantRoutes = require("../tenants/routes/tenant.routes");

router.use(authSuperAdmin);

router.use("/access", requireSuperAdminPermission("access_control"), accessRoutes);
router.use("/dashboard", requireSuperAdminPermission("dashboard"), dashboardRoutes);
router.use("/domains", requireSuperAdminPermission("domains"), domainRoutes);
router.use(
  "/subscription-plans",
  requireSuperAdminPermission("subscription_plans"),
  subscriptionRoutes,
);
router.use("/tenants", requireSuperAdminPermission("tenants"), tenantRoutes);

module.exports = router;

