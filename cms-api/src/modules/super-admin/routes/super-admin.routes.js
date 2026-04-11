const router = require("express").Router();
const {
  createTenant,
  listTenants,
} = require("../controllers/tenant.controller");
const {
  createSubscription,
  getAllSubscriptions,
  getByIdSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionStatus,
} = require("../controllers/subscription.controller");
const { authSuperAdmin } = require("../../../middlewares/auth-super-admin");

// Super Admin Tenant Routes
router.get("/tenants", listTenants);
router.post("/tenants", createTenant);

// Subscription Plan Routes
router.get("/subscription-plans", getAllSubscriptions);
router.get("/subscription-plans/:id", getByIdSubscription);
router.post("/subscription-plans", createSubscription);
router.put("/subscription-plans/:id", updateSubscription);
router.patch("/subscription-plans/:id", updateSubscriptionStatus);
router.delete("/subscription-plans/:id", deleteSubscription);

module.exports = router;
