const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const { controlDb, tenantBaseDomain } = require("../../../config/env");
const {
  getMysqlAdminConnection,
} = require("../../../core/superadmin/mysql-admin");
const {
  getTenantSequelizeByTenantId,
  closeTenantConnection,
} = require("../../../core/tenant/get-tenant-sequelize");
const {
  Tenant,
  Domain,
  TenantDatabase,
  TenantSubscriptionPlan,
  SubscriptionPlan,
  ProvisioningJob,
  TenantAdminSeed,
} = require("../../super-admin/models");
const { initTenantSchema } = require("./init-tenant-schema");
const { seedTenant } = require("./seed-tenant");
const {
  sanitizeTenantResponse,
} = require("../../super-admin/tenants/utils/sanitize-tenant-response");

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getSubscriptionEndDate(startDate, billingCycle) {
  const endDate = new Date(startDate);

  if (billingCycle === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
    return endDate;
  }

  if (billingCycle === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate;
  }

  return null;
}

function getManagedDbName(slug, tenantId) {
  const suffix = tenantId.replace(/-/g, "").slice(0, 8);
  return `cms_tenant_${slug.slice(0, 32)}_${suffix}`;
}

function normalizeHostname(hostname) {
  return hostname?.trim().toLowerCase();
}

async function updateProvisioningStep({
  tenantId,
  tenantDatabaseId,
  provisioningJobId,
  tenantStep,
  databaseStatus,
  jobStep,
  databasePatch = {},
}) {
  await Promise.all([
    Tenant.update(
      { provisioningStep: tenantStep },
      { where: { id: tenantId } },
    ),
    TenantDatabase.update(
      {
        status: databaseStatus,
        ...databasePatch,
      },
      { where: { id: tenantDatabaseId } },
    ),
    ProvisioningJob.update(
      { step: jobStep },
      { where: { id: provisioningJobId } },
    ),
  ]);
}

async function getTenantResponse(tenantId) {
  const tenant = await Tenant.findByPk(tenantId, {
    include: [
      { model: TenantDatabase, as: "database" },
      { model: Domain, as: "domains" },
      {
        model: TenantSubscriptionPlan,
        as: "subscriptions",
        where: { isCurrent: true, isDeleted: false },
        required: false,
        include: [{ model: SubscriptionPlan, as: "plan" }],
      },
      {
        model: ProvisioningJob,
        as: "provisioningJobs",
        where: { isDeleted: false },
        required: false,
        separate: true,
        limit: 5,
        order: [["createdAt", "DESC"]],
      },
    ],
  });

  return sanitizeTenantResponse(tenant);
}

async function executeProvisioning({
  tenant,
  tenantDatabase,
  provisioningJob,
  adminSeed,
}) {
  const shouldCreateManagedDatabase = tenantDatabase.dbType === "managed";

  await closeTenantConnection(tenant.id);

  const startedAt = new Date();
  await Promise.all([
    Tenant.update(
      {
        status: "provisioning",
        provisioningStep: "provisioning_started",
        failureReason: null,
        failedAt: null,
      },
      { where: { id: tenant.id } },
    ),
    ProvisioningJob.update(
      {
        status: "running",
        step: "provisioning_started",
        attempts: provisioningJob.attempts + 1,
        startedAt,
      },
      { where: { id: provisioningJob.id } },
    ),
  ]);

  if (shouldCreateManagedDatabase) {
    let adminConn;

    try {
      await updateProvisioningStep({
        tenantId: tenant.id,
        tenantDatabaseId: tenantDatabase.id,
        provisioningJobId: provisioningJob.id,
        tenantStep: "db_creating",
        databaseStatus: "creating",
        jobStep: "db_creating",
        databasePatch: {
          failureReason: null,
          failedAt: null,
        },
      });

      adminConn = await getMysqlAdminConnection();
      await adminConn.query(
        `CREATE DATABASE IF NOT EXISTS \`${tenantDatabase.dbName}\``,
      );
    } finally {
      await adminConn?.end();
    }
  } else {
    const verifiedAt = new Date();
    await updateProvisioningStep({
      tenantId: tenant.id,
      tenantDatabaseId: tenantDatabase.id,
      provisioningJobId: provisioningJob.id,
      tenantStep: "db_verifying",
      databaseStatus: "verifying",
      jobStep: "db_verifying",
      databasePatch: {
        failureReason: null,
        failedAt: null,
      },
    });

    const sequelize = await getTenantSequelizeByTenantId(tenant.id);
    await sequelize.authenticate();

    await TenantDatabase.update(
      {
        lastConnectionTestAt: verifiedAt,
        verifiedAt,
      },
      { where: { id: tenantDatabase.id } },
    );
  }

  await updateProvisioningStep({
    tenantId: tenant.id,
    tenantDatabaseId: tenantDatabase.id,
    provisioningJobId: provisioningJob.id,
    tenantStep: "db_migrating",
    databaseStatus: "migrating",
    jobStep: "db_migrating",
  });

  const migrationResult = await initTenantSchema(tenant.id);

  await updateProvisioningStep({
    tenantId: tenant.id,
    tenantDatabaseId: tenantDatabase.id,
    provisioningJobId: provisioningJob.id,
    tenantStep: "admin_seeding",
    databaseStatus: "seeding",
    jobStep: "admin_seeding",
    databasePatch: {
      currentVersion: migrationResult.currentVersion,
      lastMigrationAt: new Date(),
    },
  });

  await seedTenant({
    tenantId: tenant.id,
    adminEmail: adminSeed.email,
    adminPasswordHash: adminSeed.passwordHash,
    companyName: tenant.companyName,
    role: adminSeed.role,
  });

  const completedAt = new Date();
  await Promise.all([
    Tenant.update(
      {
        status: "active",
        provisioningStep: "completed",
        failureReason: null,
        failedAt: null,
        activatedAt: completedAt,
      },
      { where: { id: tenant.id } },
    ),
    TenantDatabase.update(
      {
        status: "ready",
        failureReason: null,
        failedAt: null,
        readyAt: completedAt,
      },
      { where: { id: tenantDatabase.id } },
    ),
    ProvisioningJob.update(
      {
        status: "succeeded",
        step: "completed",
        errorMessage: null,
        finishedAt: completedAt,
      },
      { where: { id: provisioningJob.id } },
    ),
    TenantAdminSeed.update(
      {
        status: "seeded",
        failureReason: null,
        failedAt: null,
        seededAt: completedAt,
      },
      { where: { id: adminSeed.id } },
    ),
  ]);

  return getTenantResponse(tenant.id);
}

async function provisionTenant({
  companyName,
  adminEmail,
  adminPassword,
  planId,
  dbType,
  slug,
  onboarding_source,
  role,
  dbName,
  dbHost,
  dbPort,
  dbUser,
  dbPassword,
  currentVersion,
  hostname,
}) {
  const tx = await Tenant.sequelize.transaction();

  let tenant;
  let tenantDatabase;
  let provisioningJob;
  let tenantDbName;
  const shouldCreateManagedDatabase = dbType === "managed";

  try {
    if (!["managed", "own"].includes(dbType)) {
      throw new Error("dbType must be either managed or own");
    }

    const normalizedSlug =
      slug || slugify(companyName, { lower: true, strict: true });

    const plan = await SubscriptionPlan.findOne({
      where: { id: planId, status: "active", isDeleted: false },
      transaction: tx,
    });

    if (!plan) {
      const error = new Error("Active subscription plan not found");
      error.statusCode = 400;
      throw error;
    }

    tenant = await Tenant.create(
      {
        companyName,
        slug: normalizedSlug,
        onboarding_source,
        status: "pending",
        provisioningStep: "tenant_created",
        failureReason: null,
        failedAt: null,
        activatedAt: null,
      },
      { transaction: tx },
    );

    const startDate = new Date();
    const trialDays = Number(plan.trial_days || 0);
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    await TenantSubscriptionPlan.create(
      {
        tenantId: tenant.id,
        planId: plan.id,
        start_date: startDate,
        end_date: getSubscriptionEndDate(startDate, plan.billing_cycle),
        trial_end_at: trialDays > 0 ? addDays(startDate, trialDays) : null,
        auto_renew: plan.billing_cycle !== "lifetime",
        amount: plan.price,
        currency: "INR",
        status: trialDays > 0 ? "trial" : "active",
        isCurrent: true,
      },
      { transaction: tx },
    );

    const adminSeed = await TenantAdminSeed.create(
      {
        tenantId: tenant.id,
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role,
        status: "pending",
        failureReason: null,
      },
      { transaction: tx },
    );

    if (shouldCreateManagedDatabase) {
      tenantDbName = getManagedDbName(normalizedSlug, tenant.id);

      tenantDatabase = await TenantDatabase.create(
        {
          tenantId: tenant.id,
          dbName: tenantDbName,
          dbHost: controlDb.host,
          dbPort: controlDb.port,
          dbUser: controlDb.user,
          dbPassword: controlDb.password,
          dbType: "managed",
          provisionSource: "platform",
          currentVersion: 0,
          status: "pending",
          failureReason: null,
        },
        { transaction: tx },
      );
    } else {
      tenantDbName = dbName;

      tenantDatabase = await TenantDatabase.create(
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
          status: "pending",
          failureReason: null,
        },
        { transaction: tx },
      );
    }

    const requestedHostname = normalizeHostname(hostname);
    const tenantHostname =
      requestedHostname || `${normalizedSlug}.${tenantBaseDomain}`.toLowerCase();

    await Domain.create(
      {
        tenantId: tenant.id,
        hostname: tenantHostname,
        type: requestedHostname ? "custom" : "system",
        isPrimary: true,
        status: requestedHostname ? "pending_dns" : "verified",
        sslStatus: "pending",
        failureReason: null,
        verifiedAt: requestedHostname ? null : new Date(),
      },
      { transaction: tx },
    );

    provisioningJob = await ProvisioningJob.create(
      {
        tenantId: tenant.id,
        tenantDatabaseId: tenantDatabase.id,
        type: "tenant_create",
        status: "queued",
        step: "records_created",
        attempts: 0,
        maxAttempts: 3,
        errorMessage: null,
        metadata: {
          dbType,
          hostname: tenantHostname,
          planId: plan.id,
        },
      },
      { transaction: tx },
    );

    await tx.commit();

    return await executeProvisioning({
      tenant,
      tenantDatabase,
      provisioningJob,
      adminSeed,
    });
  } catch (error) {
    if (!tx.finished) {
      await tx.rollback();
    }

    if (tenant?.id) {
      const failedAt = new Date();
      await Tenant.update(
        {
          status: "failed",
          failureReason: error.message,
          failedAt,
        },
        { where: { id: tenant.id } },
      ).catch(() => {});
      await TenantDatabase.update(
        {
          status: "failed",
          failureReason: error.message,
          failedAt,
        },
        { where: { tenantId: tenant.id } },
      ).catch(() => {});
      if (provisioningJob?.id) {
        await ProvisioningJob.update(
          {
            status: "failed",
            errorMessage: error.message,
            finishedAt: failedAt,
          },
          { where: { id: provisioningJob.id } },
        ).catch(() => {});
      }
      await TenantAdminSeed.update(
        {
          status: "failed",
          failureReason: error.message,
          failedAt,
        },
        { where: { tenantId: tenant.id } },
      ).catch(() => {});
    }

    throw error;
  }
}

async function retryProvisionTenant({
  tenantId,
}) {
  const tenant = await Tenant.findOne({
    where: { id: tenantId, isDeleted: false },
  });

  if (!tenant) {
    const error = new Error("Tenant not found");
    error.statusCode = 404;
    throw error;
  }

  if (tenant.status !== "failed") {
    const error = new Error("Only failed tenants can be retried");
    error.statusCode = 400;
    throw error;
  }

  const tenantDatabase = await TenantDatabase.findOne({
    where: { tenantId, isDeleted: false },
  });

  if (!tenantDatabase) {
    const error = new Error("Tenant database config not found");
    error.statusCode = 400;
    throw error;
  }

  const adminSeed = await TenantAdminSeed.findOne({
    where: { tenantId, isDeleted: false },
    order: [["createdAt", "DESC"]],
  });

  if (!adminSeed) {
    const error = new Error("Admin seed config not found");
    error.statusCode = 400;
    throw error;
  }

  const provisioningJob = await ProvisioningJob.create({
    tenantId: tenant.id,
    tenantDatabaseId: tenantDatabase.id,
    type: "tenant_retry",
    status: "queued",
    step: "records_loaded",
    attempts: 0,
    maxAttempts: 3,
    errorMessage: null,
    metadata: {
      dbType: tenantDatabase.dbType,
      retryOfTenantId: tenant.id,
    },
  });

  try {
    return await executeProvisioning({
      tenant,
      tenantDatabase,
      provisioningJob,
      adminSeed,
    });
  } catch (error) {
    const failedAt = new Date();

    await Tenant.update(
      {
        status: "failed",
        failureReason: error.message,
        failedAt,
      },
      { where: { id: tenant.id } },
    ).catch(() => {});

    await TenantDatabase.update(
      {
        status: "failed",
        failureReason: error.message,
        failedAt,
      },
      { where: { id: tenantDatabase.id } },
    ).catch(() => {});

    await ProvisioningJob.update(
      {
        status: "failed",
        errorMessage: error.message,
        finishedAt: failedAt,
      },
      { where: { id: provisioningJob.id } },
    ).catch(() => {});

    await TenantAdminSeed.update(
      {
        status: "failed",
        failureReason: error.message,
        failedAt,
      },
      { where: { id: adminSeed.id } },
    ).catch(() => {});

    throw error;
  }
}

module.exports = { provisionTenant, retryProvisionTenant };
