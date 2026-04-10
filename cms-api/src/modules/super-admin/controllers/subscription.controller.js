const {
  SubscriptionPlan,
  TenantSubscriptionPlan,
} = require("../../../models/control");

const { ok, fail } = require("../../../utils/response");

async function createSubscription(req, res) {
  try {
    const {
      name,
      code,
      price,
      billing_cycle,
      max_pages,
      max_users,
      max_storage_gb,
      trial_days,
    } = req.body;

    if (!name || !code || !price || !billing_cycle) {
      return fail(res, "name, code, price, billing_cycle are required", 400);
    }

    const plan = await SubscriptionPlan.create({
      name,
      code,
      price,
      billing_cycle,
      max_pages,
      max_users,
      max_storage_gb,
      trial_days,
    });

    return ok(res, plan, "Subscription Plan created successfully", 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function getAllSubscriptions(req, res) {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { isDeleted: false },
      order: [["id", "DESC"]],
    });

    return ok(res, plans);
  } catch (error) {
    return fail(res, error.message);
  }
}

module.exports = { createSubscription, getAllSubscriptions };
