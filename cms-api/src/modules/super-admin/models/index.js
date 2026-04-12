const Tenant = require("./Tenant");
const TenantDatabase = require("./TenantDatabase");
const Domain = require("./Domain");
const SuperAdmin = require("./SuperAdmin");
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

module.exports = {
  Tenant,
  TenantDatabase,
  Domain,
  SuperAdmin,
  SubscriptionPlan,
  TenantSubscriptionPlan,
  ProvisioningJob,
  TenantAdminSeed,
};

