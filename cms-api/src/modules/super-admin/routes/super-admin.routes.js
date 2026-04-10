const router = require("express").Router();
const {
  createTenant,
  listTenants,
} = require("../controllers/tenant.controller");
const { authSuperAdmin } = require("../../../middlewares/auth-super-admin");

router.get("/tenants", listTenants);
router.post("/tenants", createTenant);

module.exports = router;
