const Tenant = require("./Tenant");
const TenantDatabase = require("./TenantDatabase");
const Domain = require("./Domain");
const SuperAdmin = require("./SuperAdmin");

Tenant.hasOne(TenantDatabase, { foreignKey: "tenantId", as: "database" });
TenantDatabase.belongsTo(Tenant, { foreignKey: "tenantId", as: "tenant" });

Tenant.hasMany(Domain, { foreignKey: "tenantId", as: "domains" });
Domain.belongsTo(Tenant, { foreignKey: "tenantId", as: "tenant" });

module.exports = {
  Tenant,
  TenantDatabase,
  Domain,
  SuperAdmin,
};
