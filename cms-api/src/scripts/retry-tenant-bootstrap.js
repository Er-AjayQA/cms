const { controlSequelize } = require("../core/db/control-db");
const { getMysqlAdminConnection } = require("../core/db/mysql-admin");
const { Tenant, TenantDatabase } = require("../models/control");
const { initTenantSchema } = require("../modules/tenant/services/init-tenant-schema");
const { seedTenant } = require("../modules/tenant/services/seed-tenant");

async function run() {
  const [, , tenantId, adminEmail, adminPassword] = process.argv;

  if (!tenantId || !adminEmail || !adminPassword) {
    console.error(
      "Usage: node src/scripts/retry-tenant-bootstrap.js <tenantId> <adminEmail> <adminPassword>",
    );
    process.exit(1);
  }

  try {
    await controlSequelize.authenticate();

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found for tenantId=${tenantId}`);
    }

    const tenantDb = await TenantDatabase.findOne({ where: { tenantId } });
    if (!tenantDb) {
      throw new Error(`Tenant database config not found for tenantId=${tenantId}`);
    }

    await Tenant.update({ status: "provisioning" }, { where: { id: tenantId } });
    await TenantDatabase.update(
      { status: "pending" },
      { where: { tenantId } },
    );

    const adminConn = await getMysqlAdminConnection();
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${tenantDb.dbName}\``);
    await adminConn.end();

    await initTenantSchema(tenantId);

    await seedTenant({
      tenantId,
      adminEmail,
      adminPassword,
      companyName: tenant.companyName,
    });

    await Tenant.update({ status: "active" }, { where: { id: tenantId } });
    await TenantDatabase.update(
      { status: "ready" },
      { where: { tenantId } },
    );

    console.log("Tenant bootstrap retried successfully");
    console.log("tenantId:", tenantId);
    process.exit(0);
  } catch (error) {
    await Tenant.update({ status: "failed" }, { where: { id: tenantId } }).catch(
      () => {},
    );
    await TenantDatabase.update(
      { status: "failed" },
      { where: { tenantId } },
    ).catch(() => {});

    console.error(error);
    process.exit(1);
  }
}

run();
