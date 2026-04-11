const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const {
  getTenantSequelizeByTenantId,
} = require("../../../core/tenant/get-tenant-sequelize");
const {
  getTenantModels,
} = require("../../../core/tenant/tenant-model-registry");
const { Domain, Tenant } = require("../../../models/control");
const { signToken } = require("../../../utils/jwt");
const { fail, ok } = require("../../../utils/response");

function normalizeHostname(hostname) {
  return hostname?.trim()?.split(":")[0]?.toLowerCase();
}

function getRequestHostname(req) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host;

  return normalizeHostname(host?.split(",")[0]);
}

async function resolveTenantForLogin(req) {
  const { tenantId, slug, hostname } = req.body;

  if (tenantId) {
    return Tenant.findOne({
      where: { id: tenantId, isDeleted: false },
    });
  }

  if (slug) {
    return Tenant.findOne({
      where: { slug, isDeleted: false },
    });
  }

  const resolvedHostname = normalizeHostname(hostname) || getRequestHostname(req);

  if (
    !resolvedHostname ||
    ["localhost", "127.0.0.1"].includes(resolvedHostname)
  ) {
    return null;
  }

  const domain = await Domain.findOne({
    where: {
      hostname: {
        [Op.in]: [
          resolvedHostname,
          resolvedHostname.replace(/^www\./, ""),
        ],
      },
      status: "active",
      isDeleted: false,
    },
    include: [{ model: Tenant, as: "tenant", where: { isDeleted: false } }],
  });

  return domain?.tenant || null;
}

async function loginTenantUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(res, "email and password are required", 400);
    }

    const tenant = await resolveTenantForLogin(req);

    if (!tenant) {
      return fail(res, "Tenant could not be resolved for login", 400);
    }

    if (tenant.status !== "active") {
      return fail(res, "Tenant is not active", 403);
    }

    const tenantId = tenant.id;

    const sequelize = await getTenantSequelizeByTenantId(tenantId);
    const { User } = getTenantModels(sequelize);

    const user = await User.findOne({ where: { email, status: "active" } });

    if (!user) {
      return fail(res, "Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return fail(res, "Invalid credentials", 401);
    }

    const token = signToken({
      id: user.id,
      tenantId,
      role: user.role,
      email: user.email,
      type: "tenant_user",
    });

    return ok(
      res,
      {
        token,
        user: {
          id: user.id,
          tenantId,
          tenantSlug: tenant.slug,
          companyName: tenant.companyName,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Tenant login successful",
    );
  } catch (error) {
    return fail(res, error.message);
  }
}

module.exports = { loginTenantUser };
