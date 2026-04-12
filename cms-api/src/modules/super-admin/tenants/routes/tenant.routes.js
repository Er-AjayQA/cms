const router = require("express").Router();
const {
  createTenant,
  deleteTenant,
  getByIdTenant,
  listTenants,
  retryTenantProvisioning,
  updateTenant,
  updateTenantStatus,
} = require("../controllers/tenant.controller");

router.get("/", listTenants);
router.get("/:id", getByIdTenant);
router.post("/", createTenant);
router.post("/:id/retry-provisioning", retryTenantProvisioning);
router.put("/:id", updateTenant);
router.patch("/:id", updateTenantStatus);
router.delete("/:id", deleteTenant);

module.exports = router;
