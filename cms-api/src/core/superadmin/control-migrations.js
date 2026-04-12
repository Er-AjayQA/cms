const path = require("path");
const { controlSequelize } = require("./control-db");
const { runMigrations } = require("../shared/migration-runner");

async function runControlMigrations() {
  return runMigrations({
    sequelize: controlSequelize,
    migrationsDir: path.join(__dirname, "../../migrations/superadmin"),
    metaTableName: "SequelizeMeta",
  });
}

module.exports = { runControlMigrations };

