const { Tenant, TenantDatabase } = require("../../../models/control");
const { provisionTenant } = require("../../tenant/services/provision-tenant");
const { ok, fail } = require("../../../utils/response");

async function createTenant(req, res) {
  try {
    const { companyName, slug, adminEmail, adminPassword } = req.body;

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
    });

    return ok(res, tenant, "Tenant created successfully", 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function listTenants(req, res) {
  try {
    const tenants = await Tenant.findAll({
      include: [{ model: TenantDatabase, as: "database" }],
      order: [["id", "DESC"]],
    });

    return ok(res, tenants);
  } catch (error) {
    return fail(res, error.message);
  }
}

module.exports = { createTenant, listTenants };
