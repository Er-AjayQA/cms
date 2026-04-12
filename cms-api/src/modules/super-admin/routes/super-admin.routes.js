const router = require("express").Router();
const { authSuperAdmin } = require("../middlewares/auth-super-admin");
const dashboardRoutes = require("../dashboard/routes/dashboard.routes");
const domainRoutes = require("../domains/routes/domain.routes");
const subscriptionRoutes = require("../subscriptions/routes/subscription.routes");
const tenantRoutes = require("../tenants/routes/tenant.routes");

router.use(authSuperAdmin);

router.use("/dashboard", dashboardRoutes);
router.use("/domains", domainRoutes);
router.use("/subscription-plans", subscriptionRoutes);
router.use("/tenants", tenantRoutes);

module.exports = router;

