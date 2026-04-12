const bcrypt = require("bcryptjs");
const { controlSequelize } = require("../../core/superadmin/control-db");
const { runControlMigrations } = require("../../core/superadmin/control-migrations");
const { defaultSuperAdmin } = require("../../config/env");
const { SuperAdmin } = require("../../modules/super-admin/models");

async function run() {
  try {
    await controlSequelize.authenticate();
    await runControlMigrations();

    const existing = await SuperAdmin.findOne({
      where: { email: defaultSuperAdmin.email },
    });

    if (existing) {
      console.log("Super admin already exists");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(defaultSuperAdmin.password, 10);

    await SuperAdmin.create({
      name: "Super Admin",
      email: defaultSuperAdmin.email,
      password_hash: passwordHash,
    });

    console.log("Super admin created successfully");
    console.log("email:", defaultSuperAdmin.email);
    console.log("password:", defaultSuperAdmin.password);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();


