const path = require("path");
const {
  getMigrationStatus,
  runMigrations,
} = require("../shared/migration-runner");

const tenantMigrationsDir = path.join(__dirname, "../../migrations/tenant");
const tenantMetaTableName = "TenantMigrationsMeta";

async function runTenantMigrations(sequelize) {
  return runMigrations({
    sequelize,
    migrationsDir: tenantMigrationsDir,
    metaTableName: tenantMetaTableName,
  });
}

async function getTenantMigrationStatus(sequelize) {
  return getMigrationStatus({
    sequelize,
    migrationsDir: tenantMigrationsDir,
    metaTableName: tenantMetaTableName,
  });
}

module.exports = { getTenantMigrationStatus, runTenantMigrations };

