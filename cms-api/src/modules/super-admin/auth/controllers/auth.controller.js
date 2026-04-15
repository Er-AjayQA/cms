const bcrypt = require("bcryptjs");
const {
  SuperAdmin,
  SuperAdminMenu,
  SuperAdminRole,
  SuperAdminRolePermission,
} = require("../../models");
const { signToken } = require("../../../../utils/jwt");
const { ok, fail } = require("../../../../utils/response");
const {
  ensureDefaultSuperAdminAccess,
  getRolePermissions,
} = require("../../access/services/superadmin-access.service");

async function loginSuperAdmin(req, res) {
  try {
    const { email, password } = req.body;

    await ensureDefaultSuperAdminAccess();

    const admin = await SuperAdmin.findOne({
      where: { email, isDeleted: false },
      include: [
        {
          model: SuperAdminRole,
          as: "role",
          required: false,
          include: [
            {
              model: SuperAdminRolePermission,
              as: "permissions",
              required: false,
              include: [{ model: SuperAdminMenu, as: "menu", required: false }],
            },
          ],
        },
      ],
    });
    if (!admin) {
      return fail(res, "Invalid credentials", 401);
    }

    if (admin.status !== "active") {
      return fail(res, "Super admin user is inactive", 403);
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return fail(res, "Invalid credentials", 401);
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      type: "super_admin",
    });

    return ok(
      res,
      {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
            ? {
                id: admin.role.id,
                name: admin.role.name,
                code: admin.role.code,
              }
            : null,
          permissions: admin.roleId ? await getRolePermissions(admin.roleId) : [],
        },
      },
      "Login successful",
    );
  } catch (error) {
    return fail(res, error.message);
  }
}

module.exports = { loginSuperAdmin };


