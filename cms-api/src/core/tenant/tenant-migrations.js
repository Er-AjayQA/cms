const path = require("path");
const { runMigrations } = require("../db/migration-runner");

async function runTenantMigrations(sequelize) {
  return runMigrations({
    sequelize,
    migrationsDir: path.join(__dirname, "../../migrations/tenant"),
    metaTableName: "TenantMigrationsMeta",
  });
}

module.exports = { runTenantMigrations };
