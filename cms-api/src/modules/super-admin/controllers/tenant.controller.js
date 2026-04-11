const { Op } = require("sequelize");
const { Tenant, TenantDatabase, Domain } = require("../../../models/control");
const { provisionTenant } = require("../../tenant/services/provision-tenant");
const { ok, fail, notFound } = require("../../../utils/response");

function getTenantErrorMessage(error) {
  if (error?.name === "SequelizeUniqueConstraintError") {
    const field = error?.errors?.[0]?.path;

    if (field === "slug") {
      return "A tenant with this slug already exists.";
    }

    return "A tenant with the same details already exists.";
  }

  if (error?.name === "SequelizeValidationError") {
    return error.errors?.map((item) => item.message).join(", ");
  }

  return error.message;
}

async function createTenant(req, res) {
  try {
    const {
      companyName,
      slug,
      adminEmail,
      adminPassword,
      subscription_status = "trial",
      onboarding_source = "platform",
    } = req.body;

    if (!companyName || !adminEmail || !adminPassword) {
      return fail(
        res,
        "companyName, adminEmail, adminPassword are required",
        400,
      );
    }

    const tenant = await provisionTenant({
      companyName,
      slug,
      adminEmail,
      adminPassword,
      subscription_status,
      onboarding_source,
    });

    return ok(res, tenant, "Tenant created successfully", 201);
  } catch (error) {
    const status = error?.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return fail(res, getTenantErrorMessage(error), status);
  }
}

async function listTenants(req, res) {
  try {
    const { search = "" } = req.query;
    const where = { isDeleted: false };

    if (search) {
      where[Op.or] = [
        { companyName: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
      ];
    }

    const tenants = await Tenant.findAll({
      where,
      include: [
        { model: TenantDatabase, as: "database" },
        { model: Domain, as: "domains" },
      ],
      order: [["id", "DESC"]],
    });

    return ok(res, tenants);
  } catch (error) {
    return fail(res, error.message);
  }
}

async function getByIdTenant(req, res) {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: TenantDatabase, as: "database" },
        { model: Domain, as: "domains" },
      ],
    });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    return ok(res, tenant);
  } catch (error) {
    return fail(res, error.message);
  }
}

async function updateTenant(req, res) {
  try {
    const { id } = req.params;
    const { companyName, slug, subscription_status, onboarding_source } =
      req.body;

    const tenant = await Tenant.findOne({ where: { id, isDeleted: false } });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    if (!companyName || !slug) {
      return fail(res, "companyName and slug are required", 400);
    }

    const existingSlug = await Tenant.findOne({
      where: {
        slug,
        id: { [Op.ne]: id },
        isDeleted: false,
      },
    });

    if (existingSlug) {
      return fail(res, "A tenant with this slug already exists.", 409);
    }

    await Tenant.update(
      {
        companyName,
        slug,
        subscription_status,
        onboarding_source,
      },
      { where: { id } },
    );

    return ok(res, null, "Tenant updated successfully", 200);
  } catch (error) {
    const status = error?.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return fail(res, getTenantErrorMessage(error), status);
  }
}

async function updateTenantStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const tenant = await Tenant.findOne({ where: { id, isDeleted: false } });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    await Tenant.update(
      { status: status === "active" ? "suspended" : "active" },
      { where: { id } },
    );

    return ok(res, null, "Tenant status updated successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function deleteTenant(req, res) {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findOne({ where: { id, isDeleted: false } });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    await Tenant.update({ isDeleted: true }, { where: { id } });

    return ok(res, null, "Tenant deleted successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

module.exports = {
  createTenant,
  listTenants,
  getByIdTenant,
  updateTenant,
  updateTenantStatus,
  deleteTenant,
};
