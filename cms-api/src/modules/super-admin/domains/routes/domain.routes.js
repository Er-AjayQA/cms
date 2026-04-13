const router = require("express").Router();
const {
  createDomain,
  deleteDomain,
  getByIdDomain,
  verifyDomain,
  checkDomainSsl,
  listDomains,
  updateDomain,
  updateDomainStatus,
  listDomainByIdTenant,
} = require("../controllers/domain.controller");

router.get("/", listDomains);
router.get("/byId-tenant/:id", listDomainByIdTenant);
router.get("/:id", getByIdDomain);
router.post("/", createDomain);
router.post("/:id/verify", verifyDomain);
router.post("/:id/check-ssl", checkDomainSsl);
router.put("/:id", updateDomain);
router.patch("/:id", updateDomainStatus);
router.delete("/:id", deleteDomain);

module.exports = router;
