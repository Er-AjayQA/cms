const { SubscriptionPlan } = require("../../models");
const { Op } = require("sequelize");

const { ok, fail, notFound } = require("../../../../utils/response");

function getSubscriptionErrorMessage(error) {
  if (error?.name === "SequelizeUniqueConstraintError") {
    const field = error?.errors?.[0]?.path;

    if (field === "name") {
      return "A subscription plan with this name already exists.";
    }

    if (field === "code") {
      return "A subscription plan with this code already exists.";
    }

    return "A subscription plan with the same details already exists.";
  }

  if (error?.name === "SequelizeValidationError") {
    return error.errors?.map((item) => item.message).join(", ");
  }

  return error.message;
}

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
      description,
    } = req.body;

    if (!name || !code || !price || !billing_cycle) {
      return fail(res, "name, code, price, billing_cycle are required", 400);
    }

    const existingName = await SubscriptionPlan.findOne({ where: { name } });

    if (existingName) {
      return fail(
        res,
        "A subscription plan with this name already exists.",
        409,
      );
    }

    const existingCode = await SubscriptionPlan.findOne({ where: { code } });

    if (existingCode) {
      return fail(
        res,
        "A subscription plan with this code already exists.",
        409,
      );
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
      description,
    });

    return ok(res, plan, "Subscription Plan created successfully", 201);
  } catch (error) {
    const status = error?.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return fail(res, getSubscriptionErrorMessage(error), status);
  }
}

async function updateSubscription(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      price,
      billing_cycle,
      max_pages,
      max_users,
      max_storage_gb,
      trial_days,
      description,
    } = req.body;

    const isExisting = await SubscriptionPlan.findByPk(id);

    if (!isExisting) {
      return notFound(res, null, "Subscription Plan not found", 404);
    }

    if (!name || !code || !price || !billing_cycle) {
      return fail(res, "name, code, price, billing_cycle are required", 400);
    }

    const existingName = await SubscriptionPlan.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });

    if (existingName) {
      return fail(
        res,
        "A subscription plan with this name already exists.",
        409,
      );
    }

    const existingCode = await SubscriptionPlan.findOne({
      where: {
        code,
        id: { [Op.ne]: id },
      },
    });

    if (existingCode) {
      return fail(
        res,
        "A subscription plan with this code already exists.",
        409,
      );
    }

    await SubscriptionPlan.update(
      {
        name,
        code,
        price,
        billing_cycle,
        max_pages,
        max_users,
        max_storage_gb,
        trial_days,
        description,
      },
      { where: { id } },
    );

    return ok(res, null, "Subscription Plan updated successfully", 201);
  } catch (error) {
    const status = error?.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return fail(res, getSubscriptionErrorMessage(error), status);
  }
}

async function getAllSubscriptions(req, res) {
  try {
    const { search } = req.query;
    let whereCondition = { isDeleted: false };

    if (search?.trim()) {
      whereCondition = {
        ...whereCondition,
        name: {
          [Op.like]: `%${search}%`,
        },
      };
    }

    const plans = await SubscriptionPlan.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
    });

    return ok(res, plans);
  } catch (error) {
    return fail(res, error.message);
  }
}

async function getByIdSubscription(req, res) {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByPk(id);

    return ok(res, plan);
  } catch (error) {
    return fail(res, error.message);
  }
}

async function updateSubscriptionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const isExisting = await SubscriptionPlan.findByPk(id);

    if (!isExisting) {
      return notFound(res, null, "Subscription Plan not found", 404);
    }

    await SubscriptionPlan.update(
      {
        status: status === "active" ? "inactive" : "active",
      },
      { where: { id } },
    );

    return ok(res, null, "Status updated successfully", 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function deleteSubscription(req, res) {
  try {
    const { id } = req.params;

    const isExisting = await SubscriptionPlan.findByPk(id);

    if (!isExisting) {
      return notFound(res, null, "Subscription Plan not found", 404);
    }

    await SubscriptionPlan.update(
      {
        isDeleted: true,
      },
      { where: { id } },
    );

    return ok(res, null, "Subscription Plan deleted successfully", 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

module.exports = {
  createSubscription,
  getAllSubscriptions,
  getByIdSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionStatus,
};



