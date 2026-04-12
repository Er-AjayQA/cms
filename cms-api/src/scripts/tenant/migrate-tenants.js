const { controlSequelize } = require("../../core/superadmin/control-db");
const { getTenantSequelizeByTenantId } = require("../../core/tenant/get-tenant-sequelize");
const { runTenantMigrations } = require("../../core/tenant/tenant-migrations");
const { Tenant, TenantDatabase } = require("../../modules/super-admin/models");

async function migrateTenant(tenant) {
  const sequelize = await getTenantSequelizeByTenantId(tenant.id);
  await sequelize.authenticate();
  const executed = await runTenantMigrations(sequelize);

  await TenantDatabase.update(
    { status: "ready" },
    { where: { tenantId: tenant.id } },
  );
  await Tenant.update({ status: "active" }, { where: { id: tenant.id } });

  return executed;
}

async function run() {
  const [, , tenantIdArg] = process.argv;

  try {
    await controlSequelize.authenticate();

    const where = tenantIdArg ? { id: tenantIdArg } : {};
    const tenants = await Tenant.findAll({ where });

    if (!tenants.length) {
      throw new Error(
        tenantIdArg
          ? `Tenant not found for tenantId=${tenantIdArg}`
          : "No tenants found",
      );
    }

    for (const tenant of tenants) {
      console.log(`Migrating tenant ${tenant.id}...`);
      const executed = await migrateTenant(tenant);
      console.log(
        executed.length
          ? `Applied tenant migrations for ${tenant.id}: ${executed.join(", ")}`
          : `No pending tenant migrations for ${tenant.id}`,
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();


