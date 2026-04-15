const router = require("express").Router();
const {
  createTenant,
  deleteTenant,
  getTenantDatabasePassword,
  getByIdTenant,
  listTenants,
  retryTenantProvisioning,
  runTenantMigrations,
  updateTenant,
  updateTenantStatus,
} = require("../controllers/tenant.controller");

router.get("/", listTenants);
router.get("/:id", getByIdTenant);
router.get("/:id/database-password", getTenantDatabasePassword);
router.post("/", createTenant);
router.post("/:id/retry-provisioning", retryTenantProvisioning);
router.post("/:id/run-migrations", runTenantMigrations);
router.put("/:id", updateTenant);
router.patch("/:id", updateTenantStatus);
router.delete("/:id", deleteTenant);

module.exports = router;
