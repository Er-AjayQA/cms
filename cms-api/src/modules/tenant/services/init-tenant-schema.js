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
  const executed = await runTenantMigrations(sequelize);
  const [rows] = await sequelize.query(
    "SELECT COUNT(*) AS migrationCount FROM `TenantMigrationsMeta`",
  );

  return {
    models,
    executed,
    currentVersion: Number(rows?.[0]?.migrationCount || 0),
  };
}

module.exports = { initTenantSchema };
