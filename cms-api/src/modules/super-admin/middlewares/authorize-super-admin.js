const {
  SuperAdmin,
  SuperAdminMenu,
  SuperAdminRole,
  SuperAdminRolePermission,
} = require("../models");
const { fail } = require("../../../utils/response");
const {
  hasPermission,
} = require("../access/services/superadmin-access.service");

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function requireSuperAdminPermission(menuCode) {
  return async (req, res, next) => {
    try {
      const admin = await SuperAdmin.findOne({
        where: { id: req.user?.id, isDeleted: false },
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
                include: [
                  {
                    model: SuperAdminMenu,
                    as: "menu",
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!admin || admin.status !== "active") {
        return fail(res, "Forbidden", 403);
      }

      const action = WRITE_METHODS.has(req.method) ? "write" : "read";

      if (!hasPermission({ admin, menuCode, action })) {
        return fail(res, "You do not have permission for this action", 403);
      }

      req.superAdmin = admin;
      next();
    } catch (error) {
      return fail(res, error.message, 500);
    }
  };
}

module.exports = { requireSuperAdminPermission };
