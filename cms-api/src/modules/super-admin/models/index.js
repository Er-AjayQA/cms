const Tenant = require("./Tenant");
const TenantDatabase = require("./TenantDatabase");
const Domain = require("./Domain");
const SuperAdmin = require("./SuperAdmin");
const SubscriptionPlan = require("./SubscriptionPlans");
const TenantSubscriptionPlan = require("./TenantSubscriptionPlans");

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

module.exports = {
  Tenant,
  TenantDatabase,
  Domain,
  SuperAdmin,
  SubscriptionPlan,
  TenantSubscriptionPlan,
};

