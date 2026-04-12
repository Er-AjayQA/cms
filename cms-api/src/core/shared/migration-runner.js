const fs = require("fs");
const path = require("path");

async function ensureMetaTable(sequelize, metaTableName) {
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS \`${metaTableName}\` (
      name VARCHAR(255) NOT NULL PRIMARY KEY
    )`,
  );
}

async function getAppliedMigrations(sequelize, metaTableName) {
  const [rows] = await sequelize.query(
    `SELECT name FROM \`${metaTableName}\` ORDER BY name ASC`,
  );
  return new Set(rows.map((row) => row.name));
}

function getMigrationFiles(migrationsDir) {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".js"))
    .sort();
}

async function runMigrations({
  sequelize,
  migrationsDir,
  metaTableName = "SequelizeMeta",
}) {
  await ensureMetaTable(sequelize, metaTableName);

  const applied = await getAppliedMigrations(sequelize, metaTableName);
  const migrationFiles = getMigrationFiles(migrationsDir);
  const executed = [];

  for (const file of migrationFiles) {
    if (applied.has(file)) {
      continue;
    }

    const migrationPath = path.join(migrationsDir, file);
    delete require.cache[require.resolve(migrationPath)];
    const migration = require(migrationPath);

    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    await sequelize.query(
      `INSERT INTO \`${metaTableName}\` (name) VALUES (?)`,
      { replacements: [file] },
    );

    executed.push(file);
  }

  return executed;
}

module.exports = { runMigrations };
