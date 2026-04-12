const slugify = require("slugify");
const { controlDb } = require("../../../config/env");
const { getMysqlAdminConnection } = require("../../../core/superadmin/mysql-admin");
const { Tenant, TenantDatabase } = require("../../super-admin/models");
const { initTenantSchema } = require("./init-tenant-schema");
const { seedTenant } = require("./seed-tenant");

async function provisionTenant({
  companyName,
  slug,
  adminEmail,
  adminPassword,
  subscription_status = "trial",
  onboarding_source = "control_panel",
  role = "owner",
  dbType = "managed",
  dbName,
  dbHost,
  dbPort,
  dbUser,
  dbPassword,
  currentVersion,
}) {
  const tx = await Tenant.sequelize.transaction();

  let tenant;
  let tenantDbName;
  let shouldCreateManagedDatabase = false;

  try {
    if (!["managed", "own"].includes(dbType)) {
      throw new Error("dbType must be either managed or own");
    }

    const normalizedSlug =
      slug || slugify(companyName, { lower: true, strict: true });

    tenant = await Tenant.create(
      {
        companyName,
        slug: normalizedSlug,
        subscription_status,
        onboarding_source,
        status: "provisioning",
      },
      { transaction: tx },
    );

    if (dbType === "own") {
      tenantDbName = dbName;

      await TenantDatabase.create(
        {
          tenantId: tenant.id,
          dbName: tenantDbName,
          dbHost,
          dbPort,
          dbUser,
          dbPassword,
          dbType: "own",
          provisionSource: "client",
          currentVersion,
          status: "ready",
        },
        { transaction: tx },
      );
    }

    if (dbType === "managed") {
      tenantDbName = `cms_tenant_${tenant.id}`;
      shouldCreateManagedDatabase = true;

      await TenantDatabase.create(
        {
          tenantId: tenant.id,
          dbName: tenantDbName,
          dbHost: controlDb.host,
          dbPort: controlDb.port,
          dbUser: controlDb.user,
          dbPassword: controlDb.password,
          dbType: "managed",
          provisionSource: "platform",
          currentVersion: 1,
          status: "pending",
        },
        { transaction: tx },
      );
    }

    await tx.commit();

    if (shouldCreateManagedDatabase) {
      let adminConn;

      try {
        adminConn = await getMysqlAdminConnection();
        await adminConn.query(
          `CREATE DATABASE IF NOT EXISTS \`${tenantDbName}\``,
        );
      } finally {
        await adminConn?.end();
      }
    }

    await initTenantSchema(tenant.id);

    await seedTenant({
      tenantId: tenant.id,
      adminEmail,
      adminPassword,
      companyName,
      role,
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



