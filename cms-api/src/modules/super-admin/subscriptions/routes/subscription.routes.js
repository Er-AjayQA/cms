const router = require("express").Router();
const {
  createSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getByIdSubscription,
  updateSubscription,
  updateSubscriptionStatus,
} = require("../controllers/subscription.controller");

router.get("/", getAllSubscriptions);
router.get("/:id", getByIdSubscription);
router.post("/", createSubscription);
router.put("/:id", updateSubscription);
router.patch("/:id", updateSubscriptionStatus);
router.delete("/:id", deleteSubscription);

module.exports = router;
