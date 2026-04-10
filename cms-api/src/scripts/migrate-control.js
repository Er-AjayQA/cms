const { controlSequelize } = require("../core/db/control-db");
const { runControlMigrations } = require("../core/db/control-migrations");

async function run() {
  try {
    await controlSequelize.authenticate();
    const executed = await runControlMigrations();

    console.log(
      executed.length
        ? `Applied control migrations: ${executed.join(", ")}`
        : "No pending control migrations",
    );
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
