const router = require("express").Router();
const {
  loginSuperAdmin,
} = require("../controllers/super-admin-auth.controller");

router.post("/login", loginSuperAdmin);

module.exports = router;
