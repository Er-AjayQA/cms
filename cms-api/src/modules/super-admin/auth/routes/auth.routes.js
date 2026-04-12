const router = require("express").Router();
const {
  loginSuperAdmin,
} = require("../controllers/auth.controller");

router.post("/login", loginSuperAdmin);

module.exports = router;

