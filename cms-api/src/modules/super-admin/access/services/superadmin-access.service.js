const {
  SuperAdminMenu,
  SuperAdminRole,
  SuperAdminRolePermission,
} = require("../../models");

const DEFAULT_SUPERADMIN_MENUS = [
  { title: "Dashboard", code: "dashboard", href: "/superadmin", sortOrder: 10 },
  { title: "Tenants", code: "tenants", href: "/superadmin/tenant", sortOrder: 20 },
  { title: "Domains", code: "domains", href: "/superadmin/domains", sortOrder: 30 },
  {
    title: "Subscription Manager",
    code: "subscription_plans",
    href: "/superadmin/subscription-plans",
    sortOrder: 40,
  },
  {
    title: "Access Control",
    code: "access_control",
    href: "/superadmin/access-control",
    sortOrder: 50,
  },
];

function formatPermission(permission) {
  return {
    id: permission.id,
    menuId: permission.menuId,
    menuCode: permission.menu?.code,
    menuTitle: permission.menu?.title,
    href: permission.menu?.href,
    canRead: Boolean(permission.canRead),
    canWrite: Boolean(permission.canWrite),
  };
}

async function ensureDefaultSuperAdminAccess() {
  const menus = [];

  for (const menu of DEFAULT_SUPERADMIN_MENUS) {
    const [record] = await SuperAdminMenu.findOrCreate({
      where: { code: menu.code },
      defaults: {
        ...menu,
        status: "active",
        isSystem: true,
      },
    });

    menus.push(record);
  }

  const [role] = await SuperAdminRole.findOrCreate({
    where: { code: "super_admin" },
    defaults: {
      name: "Super Admin",
      code: "super_admin",
      description: "Full platform access.",
      status: "active",
      isSystem: true,
    },
  });

  for (const menu of menus) {
    const [permission] = await SuperAdminRolePermission.findOrCreate({
      where: { roleId: role.id, menuId: menu.id },
      defaults: {
        canRead: true,
        canWrite: true,
      },
    });

    if (!permission.canRead || !permission.canWrite) {
      await permission.update({ canRead: true, canWrite: true });
    }
  }

  return { role, menus };
}

async function getRolePermissions(roleId) {
  if (!roleId) {
    return [];
  }

  const permissions = await SuperAdminRolePermission.findAll({
    where: { roleId },
    include: [
      {
        model: SuperAdminMenu,
        as: "menu",
        where: { isDeleted: false },
        required: true,
      },
    ],
    order: [[{ model: SuperAdminMenu, as: "menu" }, "sortOrder", "ASC"]],
  });

  return permissions.map(formatPermission);
}

function hasPermission({ admin, menuCode, action }) {
  if (!admin) {
    return false;
  }

  if (!admin.roleId || admin.role?.code === "super_admin") {
    return true;
  }

  if (admin.role?.status !== "active") {
    return false;
  }

  const permissions = admin.role?.permissions || [];
  const permission = permissions.find(
    (item) =>
      item.menu?.code === menuCode &&
      item.menu?.status === "active" &&
      !item.menu?.isDeleted,
  );

  if (!permission) {
    return false;
  }

  return action === "write"
    ? Boolean(permission.canWrite)
    : Boolean(permission.canRead || permission.canWrite);
}

module.exports = {
  DEFAULT_SUPERADMIN_MENUS,
  ensureDefaultSuperAdminAccess,
  getRolePermissions,
  hasPermission,
};
