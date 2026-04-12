const router = require("express").Router();
const {
  createDomain,
  deleteDomain,
  getByIdDomain,
  listDomains,
  updateDomain,
  updateDomainStatus,
} = require("../controllers/domain.controller");

router.get("/", listDomains);
router.get("/:id", getByIdDomain);
router.post("/", createDomain);
router.put("/:id", updateDomain);
router.patch("/:id", updateDomainStatus);
router.delete("/:id", deleteDomain);

module.exports = router;
