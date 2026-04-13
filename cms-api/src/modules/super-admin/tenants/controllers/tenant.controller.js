const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { controlDb } = require("../../../../config/env");
const {
  Tenant,
  TenantDatabase,
  Domain,
  TenantSubscriptionPlan,
  SubscriptionPlan,
  ProvisioningJob,
  TenantAdminSeed,
} = require("../../models");
const {
  provisionTenant,
  retryProvisionTenant,
  provisionUpdatedTenantDatabase,
} = require("../../../tenant/services/provision-tenant");
const {
  getTenantSequelizeByTenantId,
  closeTenantConnection,
} = require("../../../../core/tenant/get-tenant-sequelize");
const {
  getTenantModels,
} = require("../../../../core/tenant/tenant-model-registry");
const { ok, fail, notFound } = require("../../../../utils/response");
const {
  formatTenantDetail,
  formatTenantListItem,
  sanitizeTenantResponse,
} = require("../utils/sanitize-tenant-response");

function getTenantErrorMessage(error) {
  if (error?.name === "SequelizeUniqueConstraintError") {
    const field = error?.errors?.[0]?.path;

    if (field === "slug") {
      return "A tenant with this slug already exists.";
    }

    return "A tenant with the same details already exists.";
  }

  if (error?.name === "SequelizeValidationError") {
    return error.errors?.map((item) => item.message).join(", ");
  }

  return error.message;
}

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

async function createTenant(req, res) {
  try {
    const {
      // Required
      companyName,
      adminEmail,
      adminPassword,
      planId,
      dbType = "managed",

      // Optional
      slug,
      role = "owner",
      onboarding_source = "control_panel",
      dbName,
      dbHost,
      dbPort = 3306,
      dbUser,
      dbPassword,
      currentVersion = 0,
      hostname,
    } = req.body;

    if (!companyName || !adminEmail || !adminPassword || !planId) {
      return fail(
        res,
        "companyName, adminEmail, adminPassword, planId are required",
        400,
      );
    }

    if (!["managed", "own"].includes(dbType)) {
      return fail(res, "dbType must be either managed or own", 400);
    }

    if (dbType === "own" && (!dbName || !dbHost || !dbUser || !dbPassword)) {
      return fail(
        res,
        "dbName, dbHost, dbUser, dbPassword are required for own DB",
        400,
      );
    }

    const tenant = await provisionTenant({
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
    });

    return ok(
      res,
      sanitizeTenantResponse(tenant),
      "Tenant created successfully",
      201,
    );
  } catch (error) {
    const status =
      error?.statusCode ||
      (error?.name === "SequelizeUniqueConstraintError" ? 409 : 500);
    return fail(res, getTenantErrorMessage(error), status);
  }
}

async function listTenants(req, res) {
  try {
    const { search = "" } = req.query;
    const where = { isDeleted: false };

    if (search) {
      where[Op.or] = [
        { companyName: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
      ];
    }

    const tenants = await Tenant.findAll({
      where,
      attributes: [
        "id",
        "companyName",
        "slug",
        "status",
        "provisioningStep",
        "failureReason",
        "onboarding_source",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: TenantDatabase,
          as: "database",
          attributes: ["dbName", "dbType", "status", "currentVersion"],
        },
        {
          model: Domain,
          as: "domains",
          attributes: ["hostname", "type", "status", "sslStatus"],
        },
        {
          model: TenantSubscriptionPlan,
          as: "subscriptions",
          where: { isCurrent: true, isDeleted: false },
          attributes: ["status", "trial_end_at", "end_date", "isCurrent"],
          required: false,
          include: [
            {
              model: SubscriptionPlan,
              as: "plan",
              attributes: ["name", "code", "billing_cycle"],
            },
          ],
        },
        {
          model: ProvisioningJob,
          as: "provisioningJobs",
          attributes: [
            "id",
            "type",
            "step",
            "status",
            "attempts",
            "errorMessage",
            "startedAt",
            "finishedAt",
          ],
          where: { isDeleted: false },
          required: false,
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
      order: [["id", "DESC"]],
    });

    return ok(res, tenants.map(formatTenantListItem));
  } catch (error) {
    return fail(res, error.message);
  }
}

async function getByIdTenant(req, res) {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: TenantDatabase, as: "database" },
        { model: Domain, as: "domains" },
        { model: TenantAdminSeed, as: "adminSeed" },
        {
          model: TenantSubscriptionPlan,
          as: "subscriptions",
          where: { isDeleted: false },
          required: false,
          include: [{ model: SubscriptionPlan, as: "plan" }],
        },
        {
          model: ProvisioningJob,
          as: "provisioningJobs",
          where: { isDeleted: false },
          required: false,
          separate: true,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    const tenantData = tenant.toJSON();

    try {
      const sequelize = await getTenantSequelizeByTenantId(id);
      const { User } = getTenantModels(sequelize);
      const adminUser = await User.findOne({
        where: {
          role: { [Op.in]: ["owner", "admin", "editor"] },
          isDeleted: false,
        },
        order: [["createdAt", "ASC"]],
      });

      tenantData.adminUser = adminUser
        ? {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            status: adminUser.status,
          }
        : null;
    } catch (error) {
      tenantData.adminUser = null;
      tenantData.adminUserError = error.message;
    }

    return ok(res, formatTenantDetail(tenantData));
  } catch (error) {
    return fail(res, error.message);
  }
}

async function retryTenantProvisioning(req, res) {
  try {
    const { id } = req.params;

    const tenant = await retryProvisionTenant({
      tenantId: id,
    });

    return ok(
      res,
      sanitizeTenantResponse(tenant),
      "Tenant provisioning retried successfully",
      200,
    );
  } catch (error) {
    const status = error?.statusCode || 500;
    return fail(res, getTenantErrorMessage(error), status);
  }
}

async function updateTenant(req, res) {
  const tx = await Tenant.sequelize.transaction();
  let shouldRunProvisioning = false;

  try {
    const { id } = req.params;
    const {
      companyName,
      slug,
      adminEmail,
      adminPassword,
      planId,
      database,
      dbType,
      dbName,
      dbHost,
      dbPort,
      dbUser,
      dbPassword,
      currentVersion,
    } = req.body;

    const tenant = await Tenant.findOne({
      where: { id, isDeleted: false },
      transaction: tx,
    });

    if (!tenant) {
      await tx.rollback();
      return notFound(res, null, "Tenant not found", 404);
    }

    if (!companyName || !slug) {
      await tx.rollback();
      return fail(res, "companyName and slug are required", 400);
    }

    const existingSlug = await Tenant.findOne({
      where: {
        slug,
        id: { [Op.ne]: id },
        isDeleted: false,
      },
      transaction: tx,
    });

    if (existingSlug) {
      await tx.rollback();
      return fail(res, "A tenant with this slug already exists.", 409);
    }

    await Tenant.update(
      {
        companyName,
        slug,
      },
      { where: { id }, transaction: tx },
    );

    if (planId) {
      const plan = await SubscriptionPlan.findOne({
        where: { id: planId, status: "active", isDeleted: false },
        transaction: tx,
      });

      if (!plan) {
        await tx.rollback();
        return fail(res, "Active subscription plan not found", 400);
      }

      const currentSubscription = await TenantSubscriptionPlan.findOne({
        where: { tenantId: id, isCurrent: true, isDeleted: false },
        transaction: tx,
      });

      if (!currentSubscription) {
        const startDate = new Date();
        const trialDays = Number(plan.trial_days || 0);

        await TenantSubscriptionPlan.create(
          {
            tenantId: id,
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
      } else if (currentSubscription.planId !== plan.id) {
        const startDate = new Date();
        const trialDays = Number(plan.trial_days || 0);

        await TenantSubscriptionPlan.update(
          {
            planId: plan.id,
            start_date: startDate,
            end_date: getSubscriptionEndDate(startDate, plan.billing_cycle),
            trial_end_at: trialDays > 0 ? addDays(startDate, trialDays) : null,
            auto_renew: plan.billing_cycle !== "lifetime",
            amount: plan.price,
            status: trialDays > 0 ? "trial" : "active",
          },
          { where: { id: currentSubscription.id }, transaction: tx },
        );
      }
    }

    const adminSeed = await TenantAdminSeed.findOne({
      where: { tenantId: id, isDeleted: false },
      transaction: tx,
    });

    if (
      adminSeed &&
      adminSeed.status !== "seeded" &&
      (adminEmail || adminPassword)
    ) {
      const adminSeedPatch = {};

      if (adminEmail && adminEmail !== adminSeed.email) {
        adminSeedPatch.email = adminEmail;
      }

      if (adminPassword) {
        adminSeedPatch.passwordHash = await bcrypt.hash(adminPassword, 10);
      }

      if (Object.keys(adminSeedPatch).length) {
        await TenantAdminSeed.update(
          {
            ...adminSeedPatch,
            status: "pending",
            failureReason: null,
            failedAt: null,
            seededAt: null,
          },
          { where: { id: adminSeed.id }, transaction: tx },
        );
      }
    }

    const databasePayload = database || {
      dbType,
      dbName,
      dbHost,
      dbPort,
      dbUser,
      dbPassword,
      currentVersion,
    };

    const hasDatabasePayload =
      databasePayload &&
      [
        "dbType",
        "dbName",
        "dbHost",
        "dbPort",
        "dbUser",
        "dbPassword",
        "currentVersion",
      ].some((field) => databasePayload[field] !== undefined);

    if (hasDatabasePayload) {
      const tenantDatabase = await TenantDatabase.findOne({
        where: { tenantId: id, isDeleted: false },
        transaction: tx,
      });

      if (!tenantDatabase) {
        await tx.rollback();
        return notFound(res, null, "Tenant database config not found", 404);
      }

      const requestedDbType = databasePayload.dbType || tenantDatabase.dbType;

      if (requestedDbType && !["managed", "own"].includes(requestedDbType)) {
        await tx.rollback();
        return fail(res, "dbType must be either managed or own", 400);
      }

      if (requestedDbType === "managed" && tenantDatabase.dbType === "own") {
        await TenantDatabase.update(
          {
            dbName: getManagedDbName(slug, id),
            dbHost: controlDb.host,
            dbPort: controlDb.port,
            dbUser: controlDb.user,
            dbPassword: controlDb.password,
            dbType: "managed",
            provisionSource: "platform",
            currentVersion: 0,
            status: "pending",
            failureReason: null,
            lastConnectionTestAt: null,
            lastMigrationAt: null,
            verifiedAt: null,
            readyAt: null,
            failedAt: null,
          },
          { where: { id: tenantDatabase.id }, transaction: tx },
        );

        await closeTenantConnection(id);

        await Tenant.update(
          {
            provisioningStep: "db_config_updated",
            failureReason: "Database config updated. Provisioning will run.",
            failedAt: null,
          },
          { where: { id }, transaction: tx },
        );

        shouldRunProvisioning = true;
      } else if (requestedDbType === "own" || tenantDatabase.dbType === "own") {
        const isSwitchingToOwnDatabase =
          tenantDatabase.dbType !== "own" && requestedDbType === "own";
        const nextDbPassword =
          databasePayload.dbPassword &&
          databasePayload.dbPassword !== "********"
            ? databasePayload.dbPassword
            : isSwitchingToOwnDatabase
              ? null
              : tenantDatabase.dbPassword;

        if (
          !databasePayload.dbName ||
          !databasePayload.dbHost ||
          !databasePayload.dbUser ||
          !nextDbPassword
        ) {
          await tx.rollback();
          return fail(
            res,
            "dbName, dbHost, dbUser, dbPassword are required for own DB",
            400,
          );
        }

        await TenantDatabase.update(
          {
            dbName: databasePayload.dbName,
            dbHost: databasePayload.dbHost,
            dbPort: databasePayload.dbPort || tenantDatabase.dbPort || 3306,
            dbUser: databasePayload.dbUser,
            dbPassword: nextDbPassword,
            dbType: "own",
            provisionSource: "client",
            currentVersion:
              databasePayload.currentVersion ?? tenantDatabase.currentVersion,
            status: "pending",
            failureReason: null,
            lastConnectionTestAt: null,
            lastMigrationAt: null,
            verifiedAt: null,
            readyAt: null,
            failedAt: null,
          },
          { where: { id: tenantDatabase.id }, transaction: tx },
        );

        await closeTenantConnection(id);

        await Tenant.update(
          {
            provisioningStep: "db_config_updated",
            failureReason: "Database config updated. Provisioning will run.",
            failedAt: null,
          },
          { where: { id }, transaction: tx },
        );

        shouldRunProvisioning = true;
      }
    }

    await tx.commit();

    if (shouldRunProvisioning) {
      await provisionUpdatedTenantDatabase({ tenantId: id });
    }

    const updatedTenant = await Tenant.findOne({
      where: { id, isDeleted: false },
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

    return ok(
      res,
      sanitizeTenantResponse(updatedTenant),
      "Tenant updated successfully",
      200,
    );
  } catch (error) {
    if (!tx.finished) {
      await tx.rollback();
    }

    const status = error?.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return fail(res, getTenantErrorMessage(error), status);
  }
}

async function updateTenantStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const tenant = await Tenant.findOne({ where: { id, isDeleted: false } });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    await Tenant.update(
      { status: status === "active" ? "suspended" : "active" },
      { where: { id } },
    );

    return ok(res, null, "Tenant status updated successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function deleteTenant(req, res) {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findOne({ where: { id, isDeleted: false } });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    await Tenant.update({ isDeleted: true }, { where: { id } });

    return ok(res, null, "Tenant deleted successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

module.exports = {
  createTenant,
  listTenants,
  getByIdTenant,
  retryTenantProvisioning,
  updateTenant,
  updateTenantStatus,
  deleteTenant,
};
