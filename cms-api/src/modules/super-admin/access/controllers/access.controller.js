const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const {
  SuperAdmin,
  SuperAdminMenu,
  SuperAdminRole,
  SuperAdminRolePermission,
} = require("../../models");
const { ok, fail, notFound } = require("../../../../utils/response");
const {
  ensureDefaultSuperAdminAccess,
  getRolePermissions,
} = require("../services/superadmin-access.service");

function normalizeCode(value) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatRole(role) {
  const plain = role?.toJSON ? role.toJSON() : role;

  if (!plain) {
    return null;
  }

  return {
    id: plain.id,
    name: plain.name,
    code: plain.code,
    description: plain.description,
    status: plain.status,
    isSystem: plain.isSystem,
    permissions: plain.permissions?.map((permission) => ({
      id: permission.id,
      menuId: permission.menuId,
      canRead: Boolean(permission.canRead),
      canWrite: Boolean(permission.canWrite),
      menu: permission.menu
        ? {
            id: permission.menu.id,
            title: permission.menu.title,
            code: permission.menu.code,
            href: permission.menu.href,
            parentId: permission.menu.parentId,
            sortOrder: permission.menu.sortOrder,
            status: permission.menu.status,
          }
        : null,
    })),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

function formatUser(user) {
  const plain = user?.toJSON ? user.toJSON() : user;

  if (!plain) {
    return null;
  }

  return {
    id: plain.id,
    name: plain.name,
    email: plain.email,
    roleId: plain.roleId,
    role: plain.role
      ? {
          id: plain.role.id,
          name: plain.role.name,
          code: plain.role.code,
        }
      : null,
    status: plain.status,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

async function listMenus(req, res) {
  try {
    await ensureDefaultSuperAdminAccess();

    const menus = await SuperAdminMenu.findAll({
      where: { isDeleted: false },
      include: [{ model: SuperAdminMenu, as: "parent", required: false }],
      order: [
        ["parentId", "ASC"],
        ["sortOrder", "ASC"],
        ["title", "ASC"],
      ],
    });

    return ok(res, menus);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function listRoles(req, res) {
  try {
    await ensureDefaultSuperAdminAccess();

    const roles = await SuperAdminRole.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: SuperAdminRolePermission,
          as: "permissions",
          required: false,
          include: [{ model: SuperAdminMenu, as: "menu", required: false }],
        },
      ],
      order: [["order_by", "ASC"]],
    });

    return ok(res, roles.map(formatRole));
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function saveRolePermissions({ roleId, permissions, transaction }) {
  if (!Array.isArray(permissions)) {
    return;
  }

  for (const permission of permissions) {
    if (!permission.menuId) {
      continue;
    }

    const [record] = await SuperAdminRolePermission.findOrCreate({
      where: { roleId, menuId: permission.menuId },
      defaults: {
        canRead: Boolean(permission.canRead || permission.canWrite),
        canWrite: Boolean(permission.canWrite),
      },
      transaction,
    });

    await record.update(
      {
        canRead: Boolean(permission.canRead || permission.canWrite),
        canWrite: Boolean(permission.canWrite),
      },
      { transaction },
    );
  }
}

async function createRole(req, res) {
  const transaction = await SuperAdminRole.sequelize.transaction();

  try {
    const {
      name,
      code,
      description,
      status = "active",
      permissions = [],
    } = req.body;

    if (!name) {
      await transaction.rollback();
      return fail(res, "name is required", 400);
    }

    const roleCode = normalizeCode(code || name);
    const existing = await SuperAdminRole.findOne({
      where: { code: roleCode, isDeleted: false },
      transaction,
    });

    if (existing) {
      await transaction.rollback();
      return fail(res, "Role with this code already exists", 409);
    }

    const role = await SuperAdminRole.create(
      {
        name,
        code: roleCode,
        description,
        status,
        isSystem: false,
      },
      { transaction },
    );

    await saveRolePermissions({ roleId: role.id, permissions, transaction });
    await transaction.commit();

    return ok(res, role, "Role created successfully", 201);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    return fail(res, error.message, 500);
  }
}

async function updateRole(req, res) {
  const transaction = await SuperAdminRole.sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      name,
      code,
      description,
      status = "active",
      permissions = [],
    } = req.body;

    const role = await SuperAdminRole.findOne({
      where: { id, isDeleted: false },
      transaction,
    });

    if (!role) {
      await transaction.rollback();
      return notFound(res, null, "Role not found", 404);
    }

    if (!name) {
      await transaction.rollback();
      return fail(res, "name is required", 400);
    }

    const roleCode = normalizeCode(code || name);
    const existing = await SuperAdminRole.findOne({
      where: {
        code: roleCode,
        id: { [Op.ne]: id },
        isDeleted: false,
      },
      transaction,
    });

    if (existing) {
      await transaction.rollback();
      return fail(res, "Role with this code already exists", 409);
    }

    await role.update(
      {
        name,
        code: role.isSystem ? role.code : roleCode,
        description,
        status,
      },
      { transaction },
    );

    await saveRolePermissions({ roleId: role.id, permissions, transaction });
    await transaction.commit();

    return ok(res, role, "Role updated successfully", 200);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    return fail(res, error.message, 500);
  }
}

async function deleteRole(req, res) {
  try {
    const { id } = req.params;
    const role = await SuperAdminRole.findOne({
      where: { id, isDeleted: false },
    });

    if (!role) {
      return notFound(res, null, "Role not found", 404);
    }

    if (role.isSystem) {
      return fail(res, "System roles cannot be deleted", 400);
    }

    await role.update({ isDeleted: true });

    return ok(res, null, "Role deleted successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function listUsers(req, res) {
  try {
    const { search = "" } = req.query;
    const where = { isDeleted: false };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await SuperAdmin.findAll({
      where,
      attributes: ["id", "name", "email", "roleId", "status", "createdAt", "updatedAt"],
      include: [{ model: SuperAdminRole, as: "role", required: false }],
      order: [["order_by", "ASC"]],
    });

    return ok(res, users.map(formatUser));
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, roleId, status = "active" } = req.body;

    if (!name || !email || !password || !roleId) {
      return fail(res, "name, email, password and roleId are required", 400);
    }

    const existing = await SuperAdmin.findOne({
      where: { email, isDeleted: false },
    });

    if (existing) {
      return fail(res, "Super admin user with this email already exists", 409);
    }

    const role = await SuperAdminRole.findOne({
      where: { id: roleId, isDeleted: false, status: "active" },
    });

    if (!role) {
      return fail(res, "Active role not found", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await SuperAdmin.create({
      name,
      email,
      password_hash: passwordHash,
      roleId,
      status,
    });

    return ok(res, formatUser(user), "Super admin user created successfully", 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, roleId, status = "active" } = req.body;

    const user = await SuperAdmin.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      return notFound(res, null, "Super admin user not found", 404);
    }

    if (!name || !email || !roleId) {
      return fail(res, "name, email and roleId are required", 400);
    }

    const existing = await SuperAdmin.findOne({
      where: {
        email,
        id: { [Op.ne]: id },
        isDeleted: false,
      },
    });

    if (existing) {
      return fail(res, "Super admin user with this email already exists", 409);
    }

    const payload = { name, email, roleId, status };

    if (password) {
      payload.password_hash = await bcrypt.hash(password, 10);
    }

    await user.update(payload);

    return ok(res, null, "Super admin user updated successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      return fail(res, "You cannot delete your own user", 400);
    }

    const user = await SuperAdmin.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      return notFound(res, null, "Super admin user not found", 404);
    }

    await user.update({ isDeleted: true });

    return ok(res, null, "Super admin user deleted successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function getMyAccess(req, res) {
  try {
    const user = await SuperAdmin.findOne({
      where: { id: req.user.id, isDeleted: false },
      attributes: ["id", "name", "email", "roleId", "status"],
      include: [{ model: SuperAdminRole, as: "role", required: false }],
    });

    if (!user) {
      return notFound(res, null, "Super admin user not found", 404);
    }

    return ok(res, {
      user: formatUser(user),
      permissions: user.roleId ? await getRolePermissions(user.roleId) : [],
    });
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

module.exports = {
  createRole,
  createUser,
  deleteRole,
  deleteUser,
  getMyAccess,
  listMenus,
  listRoles,
  listUsers,
  updateRole,
  updateUser,
};
