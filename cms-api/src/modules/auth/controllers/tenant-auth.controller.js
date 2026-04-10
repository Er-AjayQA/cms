const bcrypt = require("bcryptjs");
const {
  getTenantSequelizeByTenantId,
} = require("../../../core/tenant/get-tenant-sequelize");
const {
  getTenantModels,
} = require("../../../core/tenant/tenant-model-registry");
const { signToken } = require("../../../utils/jwt");
const { fail, ok } = require("../../../utils/response");

async function loginTenantUser(req, res) {
  try {
    const { tenantId, email, password } = req.body;

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
