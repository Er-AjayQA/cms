const slugify = require("slugify");
const { controlDb } = require("../../../config/env");
const { getMysqlAdminConnection } = require("../../../core/db/mysql-admin");
const { Tenant, TenantDatabase } = require("../../../models/control");
const { initTenantSchema } = require("./init-tenant-schema");
const { seedTenant } = require("./seed-tenant");

async function provisionTenant({
  companyName,
  slug,
  adminEmail,
  adminPassword,
}) {
  const tx = await Tenant.sequelize.transaction();

  let tenant;

  try {
    const normalizedSlug =
      slug || slugify(companyName, { lower: true, strict: true });

    tenant = await Tenant.create(
      {
        companyName,
        slug: normalizedSlug,
        status: "provisioning",
      },
      { transaction: tx },
    );

    const dbName = `cms_tenant_${tenant.id}`;

    await TenantDatabase.create(
      {
        tenantId: tenant.id,
        dbName,
        dbHost: controlDb.host,
        dbPort: controlDb.port,
        dbUser: controlDb.user,
        dbPassword: controlDb.password,
        currentVersion: 1,
        status: "pending",
      },
      { transaction: tx },
    );

    await tx.commit();

    const adminConn = await getMysqlAdminConnection();
    await adminConn.query(`CREATE DATABASE \`${dbName}\``);
    await adminConn.end();

    await initTenantSchema(tenant.id);

    await seedTenant({
      tenantId: tenant.id,
      adminEmail,
      adminPassword,
      companyName,
    });

    await Tenant.update({ status: "active" }, { where: { id: tenant.id } });

    await TenantDatabase.update(
      { status: "ready" },
      { where: { tenantId: tenant.id } },
    );

    return tenant;
  } catch (error) {
    if (!tx.finished) {
      await tx.rollback();
    }

    if (tenant?.id) {
      await Tenant.update(
        { status: "failed" },
        { where: { id: tenant.id } },
      ).catch(() => {});
      await TenantDatabase.update(
        { status: "failed" },
        { where: { tenantId: tenant.id } },
      ).catch(() => {});
    }

    throw error;
  }
}

module.exports = { provisionTenant };
