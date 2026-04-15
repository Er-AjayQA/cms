const Tenant = require("./Tenant");
const TenantDatabase = require("./TenantDatabase");
const Domain = require("./Domain");
const SuperAdmin = require("./SuperAdmin");
const SuperAdminMenu = require("./SuperAdminMenu");
const SuperAdminRole = require("./SuperAdminRole");
const SuperAdminRolePermission = require("./SuperAdminRolePermission");
const SubscriptionPlan = require("./SubscriptionPlans");
const TenantSubscriptionPlan = require("./TenantSubscriptionPlans");
const ProvisioningJob = require("./ProvisioningJob");
const TenantAdminSeed = require("./TenantAdminSeed");

Tenant.hasOne(TenantDatabase, { foreignKey: "tenantId", as: "database" });
TenantDatabase.belongsTo(Tenant, { foreignKey: "tenantId", as: "tenant" });

Tenant.hasMany(Domain, { foreignKey: "tenantId", as: "domains" });
Domain.belongsTo(Tenant, { foreignKey: "tenantId", as: "tenant" });

Tenant.hasMany(TenantSubscriptionPlan, {
  foreignKey: "tenantId",
  as: "subscriptions",
});
TenantSubscriptionPlan.belongsTo(Tenant, {
  foreignKey: "tenantId",
  as: "tenant",
});

SubscriptionPlan.hasMany(TenantSubscriptionPlan, {
  foreignKey: "planId",
  as: "tenantSubscriptions",
});

TenantSubscriptionPlan.belongsTo(SubscriptionPlan, {
  foreignKey: "planId",
  as: "plan",
});

Tenant.hasOne(TenantAdminSeed, { foreignKey: "tenantId", as: "adminSeed" });
TenantAdminSeed.belongsTo(Tenant, { foreignKey: "tenantId", as: "tenant" });

Tenant.hasMany(ProvisioningJob, { foreignKey: "tenantId", as: "provisioningJobs" });
ProvisioningJob.belongsTo(Tenant, { foreignKey: "tenantId", as: "tenant" });

TenantDatabase.hasMany(ProvisioningJob, {
  foreignKey: "tenantDatabaseId",
  as: "provisioningJobs",
});
ProvisioningJob.belongsTo(TenantDatabase, {
  foreignKey: "tenantDatabaseId",
  as: "database",
});

SuperAdmin.hasMany(ProvisioningJob, {
  foreignKey: "createdBy",
  as: "provisioningJobs",
});
ProvisioningJob.belongsTo(SuperAdmin, {
  foreignKey: "createdBy",
  as: "creator",
});

SuperAdminRole.hasMany(SuperAdmin, { foreignKey: "roleId", as: "users" });
SuperAdmin.belongsTo(SuperAdminRole, { foreignKey: "roleId", as: "role" });

SuperAdminRole.hasMany(SuperAdminRolePermission, {
  foreignKey: "roleId",
  as: "permissions",
});
SuperAdminRolePermission.belongsTo(SuperAdminRole, {
  foreignKey: "roleId",
  as: "role",
});

SuperAdminMenu.hasMany(SuperAdminRolePermission, {
  foreignKey: "menuId",
  as: "permissions",
});
SuperAdminRolePermission.belongsTo(SuperAdminMenu, {
  foreignKey: "menuId",
  as: "menu",
});

SuperAdminMenu.hasMany(SuperAdminMenu, {
  foreignKey: "parentId",
  as: "children",
});
SuperAdminMenu.belongsTo(SuperAdminMenu, {
  foreignKey: "parentId",
  as: "parent",
});

module.exports = {
  Tenant,
  TenantDatabase,
  Domain,
  SuperAdmin,
  SuperAdminMenu,
  SuperAdminRole,
  SuperAdminRolePermission,
  SubscriptionPlan,
  TenantSubscriptionPlan,
  ProvisioningJob,
  TenantAdminSeed,
};

