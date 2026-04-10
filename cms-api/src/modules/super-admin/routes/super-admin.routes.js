const router = require("express").Router();
const {
  createTenant,
  listTenants,
} = require("../controllers/tenant.controller");
const {
  createSubscription,
  getAllSubscriptions,
} = require("../controllers/subscription.controller");
const { authSuperAdmin } = require("../../../middlewares/auth-super-admin");

// Super Admin Tenant Routes
router.get("/tenants", listTenants);
router.post("/tenants", createTenant);

// Subscription Plan Routes
router.get("/subscription-plans", getAllSubscriptions);
router.post("/subscription-plans", createSubscription);

module.exports = router;
