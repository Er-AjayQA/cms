const router = require("express").Router();
const {
  createTenant,
  listTenants,
} = require("../controllers/tenant.controller");
const { authSuperAdmin } = require("../../../middlewares/auth-super-admin");

router.get("/tenants", authSuperAdmin, listTenants);
router.post("/tenants", authSuperAdmin, createTenant);

module.exports = router;
