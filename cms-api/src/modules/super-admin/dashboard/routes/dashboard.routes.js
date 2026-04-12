const router = require("express").Router();
const { getDashboardDetails } = require("../controllers/dashboard.controller");

router.get("/", getDashboardDetails);

module.exports = router;
