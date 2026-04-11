const { Op } = require("sequelize");
const { Tenant, TenantDatabase, Domain } = require("../../../models/control");
const { provisionTenant } = require("../../tenant/services/provision-tenant");
const {
  getTenantSequelizeByTenantId,
} = require("../../../core/tenant/get-tenant-sequelize");
const {
  getTenantModels,
} = require("../../../core/tenant/tenant-model-registry");
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

async function getDashboardDetails(req, res) {
  try {
    const totalTenants = await Tenant.count();
    const activeTenants = await Tenant.count({ where: { status: "active" } });
    const suspendedTenants = await Tenant.count({
      where: { status: "suspended" },
    });
    const totalDatabases = await TenantDatabase.count();
    const allTenants = await Tenant.findAll({
      where: { isDeleted: false },
      include: [
        { model: TenantDatabase, as: "database" },
        { model: Domain, as: "domains" },
      ],
      order: [["id", "DESC"]],
    });

    let result = {
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalDatabases,
      allTenants,
    };

    return ok(res, result);
  } catch (error) {
    return fail(res, error.message);
  }
}

module.exports = {
  getDashboardDetails,
};
