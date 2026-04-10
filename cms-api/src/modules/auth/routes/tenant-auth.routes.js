const router = require("express").Router();
const { loginTenantUser } = require("../controllers/tenant-auth.controller");

router.post("/login", loginTenantUser);

module.exports = router;
