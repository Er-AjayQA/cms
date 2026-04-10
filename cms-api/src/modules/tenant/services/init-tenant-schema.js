const {
  getTenantSequelizeByTenantId,
} = require("../../../core/tenant/get-tenant-sequelize");
const {
  getTenantModels,
} = require("../../../core/tenant/tenant-model-registry");
const { runTenantMigrations } = require("../../../core/tenant/tenant-migrations");

async function initTenantSchema(tenantId) {
  const sequelize = await getTenantSequelizeByTenantId(tenantId);
  const models = getTenantModels(sequelize);

  await sequelize.authenticate();
  await runTenantMigrations(sequelize);

  return models;
}

module.exports = { initTenantSchema };
