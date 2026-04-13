const { Op } = require("sequelize");
const {
  Tenant,
  TenantDatabase,
  Domain,
  TenantSubscriptionPlan,
  SubscriptionPlan,
  ProvisioningJob,
} = require("../../models");
const {
  provisionTenant,
  retryProvisionTenant,
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
      onboarding_source = "control_panel",
      role = "owner",
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

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    const tenantData = tenant.toJSON();

    try {
      const sequelize = await getTenantSequelizeByTenantId(id);
      const { User } = getTenantModels(sequelize);
      const adminUser = await User.findOne({
        where: {
          role: { [Op.in]: ["owner", "admin"] },
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

  try {
    const { id } = req.params;
    const {
      companyName,
      slug,
      database,
      dbName,
      dbHost,
      dbPort,
      dbUser,
      dbPassword,
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

    const databasePayload = database || {
      dbName,
      dbHost,
      dbPort,
      dbUser,
      dbPassword,
    };

    const hasDatabasePayload =
      databasePayload &&
      ["dbName", "dbHost", "dbPort", "dbUser", "dbPassword"].some(
        (field) => databasePayload[field] !== undefined,
      );

    if (hasDatabasePayload) {
      const tenantDatabase = await TenantDatabase.findOne({
        where: { tenantId: id, isDeleted: false },
        transaction: tx,
      });

      if (!tenantDatabase) {
        await tx.rollback();
        return notFound(res, null, "Tenant database config not found", 404);
      }

      if (tenantDatabase.dbType !== "own") {
        await tx.rollback();
        return fail(res, "Managed database config cannot be edited", 400);
      }

      const nextDbPassword =
        databasePayload.dbPassword && databasePayload.dbPassword !== "********"
          ? databasePayload.dbPassword
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
          failureReason: "Database config updated. Retry provisioning.",
          failedAt: null,
        },
        { where: { id }, transaction: tx },
      );
    }

    await tx.commit();

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
