const { Op } = require("sequelize");
const { Domain, Tenant } = require("../../models");
const { ok, fail, notFound } = require("../../../../utils/response");
const {
  checkSslStatus,
  generateDomainVerificationToken,
  getVerificationTxtHost,
  normalizeHostname,
  verifyDomainDns,
} = require("../services/domain-verification.service");

function getDomainErrorMessage(error) {
  if (error?.name === "SequelizeUniqueConstraintError") {
    return "A domain with this hostname already exists.";
  }

  if (error?.name === "SequelizeValidationError") {
    return error.errors?.map((item) => item.message).join(", ");
  }

  return error.message;
}

async function createDomain(req, res) {
  try {
    const { tenantId, hostname, type = "custom", isPrimary = false } = req.body;
    const normalizedHostname = normalizeHostname(hostname);

    if (!tenantId || !normalizedHostname) {
      return fail(res, "tenantId and hostname are required", 400);
    }

    const tenant = await Tenant.findOne({
      where: { id: tenantId, isDeleted: false },
    });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    const existingDomain = await Domain.findOne({
      where: { hostname: normalizedHostname, isDeleted: false },
    });

    if (existingDomain) {
      return fail(res, "A domain with this hostname already exists.", 409);
    }

    if (isPrimary) {
      await Domain.update(
        { isPrimary: false },
        { where: { tenantId, isDeleted: false } },
      );
    }

    const isSystemDomain = type === "system";
    const verificationToken = isSystemDomain
      ? null
      : generateDomainVerificationToken();

    const domain = await Domain.create({
      tenantId,
      hostname: normalizedHostname,
      type,
      isPrimary,
      status: isSystemDomain ? "verified" : "pending_dns",
      sslStatus: "pending",
      verificationToken,
      verifiedAt: isSystemDomain ? new Date() : null,
      failureReason: null,
    });

    return ok(res, domain, "Domain created successfully", 201);
  } catch (error) {
    const status = error?.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return fail(res, getDomainErrorMessage(error), status);
  }
}

async function listDomains(req, res) {
  try {
    const { search = "" } = req.query;
    const where = { isDeleted: false };

    if (search) {
      where[Op.or] = [
        { hostname: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
      ];
    }

    const domains = await Domain.findAll({
      where,
      include: [{ model: Tenant, as: "tenant" }],
      order: [["id", "DESC"]],
    });

    return ok(res, domains);
  } catch (error) {
    return fail(res, error.message);
  }
}

async function listDomainByIdTenant(req, res) {
  try {
    const { id } = req.params;
    const where = { tenantId: id, isDeleted: false };

    const tenant = await Tenant.findOne({
      where: { id, isDeleted: false },
    });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    const domains = await Domain.findAll({
      where,
      order: [["id", "DESC"]],
    });

    return ok(res, {
      tenant,
      domains: domains.map((domain) => ({
        ...domain.toJSON(),
        verificationTxtHost: getVerificationTxtHost(domain.hostname),
      })),
    });
  } catch (error) {
    return fail(res, error.message);
  }
}

async function getByIdDomain(req, res) {
  try {
    const { id } = req.params;
    const domain = await Domain.findOne({
      where: { id, isDeleted: false },
      include: [{ model: Tenant, as: "tenant" }],
    });

    if (!domain) {
      return notFound(res, null, "Domain not found", 404);
    }

    return ok(res, domain);
  } catch (error) {
    return fail(res, error.message);
  }
}

async function updateDomain(req, res) {
  try {
    const { id } = req.params;
    const { tenantId, hostname, type = "custom", isPrimary = false } = req.body;
    const normalizedHostname = normalizeHostname(hostname);

    if (!tenantId || !normalizedHostname) {
      return fail(res, "tenantId and hostname are required", 400);
    }

    const domain = await Domain.findOne({ where: { id, isDeleted: false } });

    if (!domain) {
      return notFound(res, null, "Domain not found", 404);
    }

    const tenant = await Tenant.findOne({
      where: { id: tenantId, isDeleted: false },
    });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    const existingDomain = await Domain.findOne({
      where: {
        hostname: normalizedHostname,
        id: { [Op.ne]: id },
        isDeleted: false,
      },
    });

    if (existingDomain) {
      return fail(res, "A domain with this hostname already exists.", 409);
    }

    if (isPrimary) {
      await Domain.update(
        { isPrimary: false },
        { where: { tenantId, id: { [Op.ne]: id }, isDeleted: false } },
      );
    }

    const isSystemDomain = type === "system";
    const hostnameChanged = domain.hostname !== normalizedHostname;

    await Domain.update(
      {
        tenantId,
        hostname: normalizedHostname,
        type,
        isPrimary,
        ...(hostnameChanged || domain.type !== type
          ? {
              status: isSystemDomain ? "verified" : "pending_dns",
              sslStatus: "pending",
              verificationToken: isSystemDomain
                ? null
                : generateDomainVerificationToken(),
              verifiedAt: isSystemDomain ? new Date() : null,
              failedAt: null,
              failureReason: null,
            }
          : {}),
      },
      { where: { id } },
    );

    return ok(res, null, "Domain updated successfully", 200);
  } catch (error) {
    const status = error?.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return fail(res, getDomainErrorMessage(error), status);
  }
}

async function verifyDomain(req, res) {
  try {
    const { id } = req.params;
    const domain = await Domain.findOne({ where: { id, isDeleted: false } });

    if (!domain) {
      return notFound(res, null, "Domain not found", 404);
    }

    if (domain.type === "system") {
      await Domain.update(
        {
          status: "verified",
          verifiedAt: domain.verifiedAt || new Date(),
          failureReason: null,
          failedAt: null,
        },
        { where: { id } },
      );

      return ok(res, null, "System domain is already verified", 200);
    }

    const result = await verifyDomainDns(domain);

    await Domain.update(
      result.verified
        ? {
            status: "verified",
            verifiedAt: new Date(),
            failureReason: null,
            failedAt: null,
          }
        : {
            status: "pending_dns",
            failureReason: result.error,
          },
      { where: { id } },
    );

    return ok(
      res,
      {
        txtHost: result.txtHost,
        records: result.records || [],
      },
      result.verified
        ? "Domain verified successfully"
        : "Domain verification record was not found",
      200,
    );
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function checkDomainSsl(req, res) {
  try {
    const { id } = req.params;
    const domain = await Domain.findOne({ where: { id, isDeleted: false } });

    if (!domain) {
      return notFound(res, null, "Domain not found", 404);
    }

    const result = await checkSslStatus(domain);

    await Domain.update(
      result.active
        ? {
            sslStatus: "active",
            failureReason: null,
            failedAt: null,
          }
        : {
            sslStatus: "failed",
            failureReason: result.error,
            failedAt: new Date(),
          },
      { where: { id } },
    );

    return ok(
      res,
      result,
      result.active ? "SSL is active" : "SSL check failed",
      200,
    );
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function updateDomainStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const domain = await Domain.findOne({ where: { id, isDeleted: false } });

    if (!domain) {
      return notFound(res, null, "Domain not found", 404);
    }

    await Domain.update(
      { status: status === "active" ? "inactive" : "active" },
      { where: { id } },
    );

    return ok(res, null, "Domain status updated successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function deleteDomain(req, res) {
  try {
    const { id } = req.params;
    const domain = await Domain.findOne({ where: { id, isDeleted: false } });

    if (!domain) {
      return notFound(res, null, "Domain not found", 404);
    }

    await Domain.update({ isDeleted: true }, { where: { id } });

    return ok(res, null, "Domain deleted successfully", 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

module.exports = {
  createDomain,
  listDomains,
  getByIdDomain,
  verifyDomain,
  checkDomainSsl,
  updateDomain,
  updateDomainStatus,
  deleteDomain,
  listDomainByIdTenant,
};
