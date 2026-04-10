const path = require("path");
const { controlSequelize } = require("./control-db");
const { runMigrations } = require("./migration-runner");

async function runControlMigrations() {
  return runMigrations({
    sequelize: controlSequelize,
    migrationsDir: path.join(__dirname, "../../migrations"),
    metaTableName: "SequelizeMeta",
  });
}

module.exports = { runControlMigrations };
