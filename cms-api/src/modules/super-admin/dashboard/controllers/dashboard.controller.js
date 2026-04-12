const {
  Tenant,
  TenantDatabase,
  Domain,
  TenantSubscriptionPlan,
  ProvisioningJob,
} = require("../../models");
const { ok, fail } = require("../../../../utils/response");

async function countByStatus(Model, statuses, baseWhere = {}) {
  const entries = await Promise.all(
    statuses.map(async (status) => [
      status,
      await Model.count({ where: { ...baseWhere, status } }),
    ]),
  );

  return Object.fromEntries(entries);
}

function formatRecentJob(job) {
  return {
    id: job.id,
    tenantId: job.tenantId,
    companyName: job.tenant?.companyName || null,
    slug: job.tenant?.slug || null,
    type: job.type,
    status: job.status,
    step: job.step,
    attempts: job.attempts,
    errorMessage: job.errorMessage,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    createdAt: job.createdAt,
  };
}

function formatFailedTenant(tenant) {
  const latestJob = tenant.provisioningJobs?.[0] || null;

  return {
    id: tenant.id,
    companyName: tenant.companyName,
    slug: tenant.slug,
    status: tenant.status,
    provisioningStep: tenant.provisioningStep,
    failureReason: tenant.failureReason,
    latestJobStatus: latestJob?.status || null,
    latestJobError: latestJob?.errorMessage || null,
    failedAt: tenant.failedAt,
  };
}

function formatPendingDomain(domain) {
  return {
    id: domain.id,
    tenantId: domain.tenantId,
    companyName: domain.tenant?.companyName || null,
    slug: domain.tenant?.slug || null,
    hostname: domain.hostname,
    status: domain.status,
    sslStatus: domain.sslStatus,
  };
}

function formatFailedDatabase(database) {
  return {
    id: database.id,
    tenantId: database.tenantId,
    companyName: database.tenant?.companyName || null,
    slug: database.tenant?.slug || null,
    dbType: database.dbType,
    status: database.status,
    failureReason: database.failureReason,
    failedAt: database.failedAt,
  };
}

async function getDashboardDetails(req, res) {
  try {
    const tenantWhere = { isDeleted: false };
    const databaseWhere = { isDeleted: false };
    const domainWhere = { isDeleted: false };
    const subscriptionWhere = { isDeleted: false, isCurrent: true };
    const jobWhere = { isDeleted: false };

    const [
      tenantStatuses,
      databaseStatuses,
      domainStatuses,
      subscriptionStatuses,
      jobStatuses,
      totalTenants,
      totalDatabases,
      managedDatabases,
      ownDatabases,
      totalDomains,
      totalSubscriptions,
      totalJobs,
      recentProvisioningJobs,
      failedTenants,
      pendingDomains,
      failedDatabases,
    ] = await Promise.all([
      countByStatus(
        Tenant,
        ["pending", "provisioning", "active", "failed", "suspended", "archived"],
        tenantWhere,
      ),
      countByStatus(
        TenantDatabase,
        ["pending", "verifying", "creating", "migrating", "seeding", "ready", "failed"],
        databaseWhere,
      ),
      countByStatus(
        Domain,
        ["pending", "pending_dns", "verified", "failed", "disabled"],
        domainWhere,
      ),
      countByStatus(
        TenantSubscriptionPlan,
        ["trial", "active", "expired", "cancelled"],
        subscriptionWhere,
      ),
      countByStatus(
        ProvisioningJob,
        ["queued", "running", "succeeded", "failed", "cancelled"],
        jobWhere,
      ),
      Tenant.count({ where: tenantWhere }),
      TenantDatabase.count({ where: databaseWhere }),
      TenantDatabase.count({ where: { ...databaseWhere, dbType: "managed" } }),
      TenantDatabase.count({ where: { ...databaseWhere, dbType: "own" } }),
      Domain.count({ where: domainWhere }),
      TenantSubscriptionPlan.count({ where: subscriptionWhere }),
      ProvisioningJob.count({ where: jobWhere }),
      ProvisioningJob.findAll({
        where: jobWhere,
        include: [
          {
            model: Tenant,
            as: "tenant",
            attributes: ["companyName", "slug"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      }),
      Tenant.findAll({
        where: { ...tenantWhere, status: "failed" },
        attributes: [
          "id",
          "companyName",
          "slug",
          "status",
          "provisioningStep",
          "failureReason",
          "failedAt",
        ],
        include: [
          {
            model: ProvisioningJob,
            as: "provisioningJobs",
            where: jobWhere,
            required: false,
            separate: true,
            limit: 1,
            order: [["createdAt", "DESC"]],
          },
        ],
        order: [["failedAt", "DESC"]],
        limit: 5,
      }),
      Domain.findAll({
        where: { ...domainWhere, status: "pending_dns" },
        attributes: ["id", "tenantId", "hostname", "status", "sslStatus"],
        include: [
          {
            model: Tenant,
            as: "tenant",
            attributes: ["companyName", "slug"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      TenantDatabase.findAll({
        where: { ...databaseWhere, status: "failed" },
        attributes: [
          "id",
          "tenantId",
          "dbType",
          "status",
          "failureReason",
          "failedAt",
        ],
        include: [
          {
            model: Tenant,
            as: "tenant",
            attributes: ["companyName", "slug"],
          },
        ],
        order: [["failedAt", "DESC"]],
        limit: 5,
      }),
    ]);

    return ok(res, {
      tenants: {
        total: totalTenants,
        ...tenantStatuses,
      },
      databases: {
        total: totalDatabases,
        managed: managedDatabases,
        own: ownDatabases,
        ...databaseStatuses,
      },
      domains: {
        total: totalDomains,
        pending: domainStatuses.pending,
        pendingDns: domainStatuses.pending_dns,
        verified: domainStatuses.verified,
        failed: domainStatuses.failed,
        disabled: domainStatuses.disabled,
      },
      subscriptions: {
        total: totalSubscriptions,
        ...subscriptionStatuses,
      },
      provisioningJobs: {
        total: totalJobs,
        ...jobStatuses,
      },
      attention: {
        failedTenants: failedTenants.map(formatFailedTenant),
        pendingDomains: pendingDomains.map(formatPendingDomain),
        failedDatabases: failedDatabases.map(formatFailedDatabase),
      },
      recentProvisioningJobs: recentProvisioningJobs.map(formatRecentJob),
    });
  } catch (error) {
    return fail(res, error.message);
  }
}

module.exports = {
  getDashboardDetails,
};
