function toPlain(value) {
  if (!value) {
    return value;
  }

  if (typeof value.toJSON === "function") {
    return value.toJSON();
  }

  return value;
}

function maskTenantDatabase(database) {
  if (!database) {
    return database;
  }

  return {
    ...database,
    dbPassword: database.dbPassword ? "********" : null,
  };
}

function sanitizeTenantResponse(payload) {
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeTenantResponse(item));
  }

  const tenant = toPlain(payload);

  if (!tenant || typeof tenant !== "object") {
    return tenant;
  }

  return {
    ...tenant,
    database: maskTenantDatabase(tenant.database),
  };
}

function formatTenantListItem(payload) {
  const tenant = sanitizeTenantResponse(payload);

  if (!tenant || typeof tenant !== "object") {
    return tenant;
  }

  const primaryDomain =
    tenant.domains?.find((domain) => domain.isPrimary) || tenant.domains?.[0];
  const currentSubscription =
    tenant.subscriptions?.find((subscription) => subscription.isCurrent) ||
    tenant.subscriptions?.[0];
  const latestProvisioningJob = tenant.provisioningJobs?.[0];

  return {
    id: tenant.id,
    companyName: tenant.companyName,
    slug: tenant.slug,
    status: tenant.status,
    provisioningStep: tenant.provisioningStep,
    failureReason: tenant.failureReason,
    database: tenant.database
      ? {
          dbType: tenant.database.dbType,
          status: tenant.database.status,
          currentVersion: tenant.database.currentVersion,
        }
      : null,
    primaryDomain: primaryDomain
      ? {
          hostname: primaryDomain.hostname,
          type: primaryDomain.type,
          status: primaryDomain.status,
          sslStatus: primaryDomain.sslStatus,
        }
      : null,
    subscription: currentSubscription
      ? {
          planName: currentSubscription.plan?.name || null,
          planCode: currentSubscription.plan?.code || null,
          status: currentSubscription.status,
          billingCycle: currentSubscription.plan?.billing_cycle || null,
          trialEndAt: currentSubscription.trial_end_at,
          endDate: currentSubscription.end_date,
        }
      : null,
    latestProvisioningJob: latestProvisioningJob
      ? {
          id: latestProvisioningJob.id,
          type: latestProvisioningJob.type,
          status: latestProvisioningJob.status,
          step: latestProvisioningJob.step,
          attempts: latestProvisioningJob.attempts,
          errorMessage: latestProvisioningJob.errorMessage,
          startedAt: latestProvisioningJob.startedAt,
          finishedAt: latestProvisioningJob.finishedAt,
        }
      : null,
    canRetry: tenant.status === "failed",
    canEditDatabase: tenant.database?.dbType === "own",
    needsDomainVerification:
      primaryDomain?.type === "custom" &&
      primaryDomain?.status === "pending_dns",
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

function formatDomain(domain) {
  if (!domain) {
    return null;
  }

  return {
    id: domain.id,
    hostname: domain.hostname,
    type: domain.type,
    isPrimary: domain.isPrimary,
    status: domain.status,
    sslStatus: domain.sslStatus,
    verificationToken: domain.verificationToken,
    failureReason: domain.failureReason,
    verifiedAt: domain.verifiedAt,
    failedAt: domain.failedAt,
    disabledAt: domain.disabledAt,
  };
}

function formatProvisioningJob(job) {
  if (!job) {
    return null;
  }

  return {
    id: job.id,
    type: job.type,
    status: job.status,
    step: job.step,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    errorMessage: job.errorMessage,
    metadata: job.metadata,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    createdAt: job.createdAt,
  };
}

function formatCurrentSubscription(subscription) {
  if (!subscription) {
    return null;
  }

  return {
    id: subscription.id,
    status: subscription.status,
    startDate: subscription.start_date,
    endDate: subscription.end_date,
    trialEndAt: subscription.trial_end_at,
    autoRenew: subscription.auto_renew,
    amount: subscription.amount,
    currency: subscription.currency,
    plan: subscription.plan
      ? {
          id: subscription.plan.id,
          name: subscription.plan.name,
          code: subscription.plan.code,
          price: subscription.plan.price,
          billingCycle: subscription.plan.billing_cycle,
          maxPages: subscription.plan.max_pages,
          maxUsers: subscription.plan.max_users,
          maxStorageGb: subscription.plan.max_storage_gb,
          trialDays: subscription.plan.trial_days,
          description: subscription.plan.description,
          status: subscription.plan.status,
        }
      : null,
  };
}

function formatTenantDetail(payload) {
  const tenant = sanitizeTenantResponse(payload);

  if (!tenant || typeof tenant !== "object") {
    return tenant;
  }

  const primaryDomain =
    tenant.domains?.find((domain) => domain.isPrimary) || tenant.domains?.[0];
  const currentSubscription =
    tenant.subscriptions?.find((subscription) => subscription.isCurrent) ||
    tenant.subscriptions?.[0];
  const latestProvisioningJob = tenant.provisioningJobs?.[0];

  return {
    id: tenant.id,
    companyName: tenant.companyName,
    slug: tenant.slug,
    onboardingSource: tenant.onboarding_source,
    status: tenant.status,
    provisioningStep: tenant.provisioningStep,
    failureReason: tenant.failureReason,
    failedAt: tenant.failedAt,
    activatedAt: tenant.activatedAt,
    suspendedAt: tenant.suspendedAt,
    archivedAt: tenant.archivedAt,
    database: tenant.database
      ? {
          id: tenant.database.id,
          dbName: tenant.database.dbName,
          dbHost: tenant.database.dbHost,
          dbPort: tenant.database.dbPort,
          dbUser: tenant.database.dbUser,
          dbPassword: tenant.database.dbPassword,
          dbType: tenant.database.dbType,
          provisionSource: tenant.database.provisionSource,
          currentVersion: tenant.database.currentVersion,
          status: tenant.database.status,
          failureReason: tenant.database.failureReason,
          lastConnectionTestAt: tenant.database.lastConnectionTestAt,
          lastMigrationAt: tenant.database.lastMigrationAt,
          verifiedAt: tenant.database.verifiedAt,
          readyAt: tenant.database.readyAt,
          failedAt: tenant.database.failedAt,
        }
      : null,
    domains: tenant.domains?.map(formatDomain) || [],
    primaryDomain: formatDomain(primaryDomain),
    currentSubscription: formatCurrentSubscription(currentSubscription),
    provisioningJobs:
      tenant.provisioningJobs?.map(formatProvisioningJob) || [],
    latestProvisioningJob: formatProvisioningJob(latestProvisioningJob),
    adminUser: tenant.adminUser || null,
    adminUserError: tenant.adminUserError || null,
    actions: {
      canRetry: tenant.status === "failed",
      canEditDatabase: tenant.database?.dbType === "own",
      canSuspend: tenant.status === "active",
      canActivate: tenant.status === "suspended",
      canArchive: ["active", "suspended", "failed"].includes(tenant.status),
      canVerifyDomain:
        primaryDomain?.type === "custom" &&
        ["pending_dns", "failed"].includes(primaryDomain.status),
    },
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

module.exports = {
  sanitizeTenantResponse,
  formatTenantListItem,
  formatTenantDetail,
};
