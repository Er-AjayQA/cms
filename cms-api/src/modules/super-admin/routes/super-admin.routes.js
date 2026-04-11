const router = require("express").Router();
const {
  createTenant,
  deleteTenant,
  getByIdTenant,
  listTenants,
  updateTenant,
  updateTenantStatus,
} = require("../controllers/tenant.controller");
const {
  createSubscription,
  getAllSubscriptions,
  getByIdSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionStatus,
} = require("../controllers/subscription.controller");
const {
  createDomain,
  deleteDomain,
  getByIdDomain,
  listDomains,
  updateDomain,
  updateDomainStatus,
} = require("../controllers/domain.controller");
const { authSuperAdmin } = require("../../../middlewares/auth-super-admin");

// Super Admin Tenant Routes
router.get("/tenants", listTenants);
router.get("/tenants/:id", getByIdTenant);
router.post("/tenants", createTenant);
router.put("/tenants/:id", updateTenant);
router.patch("/tenants/:id", updateTenantStatus);
router.delete("/tenants/:id", deleteTenant);

// Subscription Plan Routes
router.get("/subscription-plans", getAllSubscriptions);
router.get("/subscription-plans/:id", getByIdSubscription);
router.post("/subscription-plans", createSubscription);
router.put("/subscription-plans/:id", updateSubscription);
router.patch("/subscription-plans/:id", updateSubscriptionStatus);
router.delete("/subscription-plans/:id", deleteSubscription);

// Domain Routes
router.get("/domains", listDomains);
router.get("/domains/:id", getByIdDomain);
router.post("/domains", createDomain);
router.put("/domains/:id", updateDomain);
router.patch("/domains/:id", updateDomainStatus);
router.delete("/domains/:id", deleteDomain);

module.exports = router;
