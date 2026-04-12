const { Op } = require("sequelize");
const { Domain, Tenant } = require("../../models");
const { ok, fail, notFound } = require("../../../../utils/response");

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
    const { tenantId, hostname, type, isPrimary = false } = req.body;

    if (!tenantId || !hostname) {
      return fail(res, "tenantId and hostname are required", 400);
    }

    const tenant = await Tenant.findOne({
      where: { id: tenantId, isDeleted: false },
    });

    if (!tenant) {
      return notFound(res, null, "Tenant not found", 404);
    }

    const existingDomain = await Domain.findOne({
      where: { hostname, isDeleted: false },
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

    const domain = await Domain.create({
      tenantId,
      hostname,
      type,
      isPrimary,
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
    const { tenantId, hostname, type, isPrimary = false } = req.body;

    if (!tenantId || !hostname) {
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
        hostname,
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

    await Domain.update(
      {
        tenantId,
        hostname,
        type,
        isPrimary,
      },
      { where: { id } },
    );

    return ok(res, null, "Domain updated successfully", 200);
  } catch (error) {
    const status = error?.name === "SequelizeUniqueConstraintError" ? 409 : 500;
    return fail(res, getDomainErrorMessage(error), status);
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
  updateDomain,
  updateDomainStatus,
  deleteDomain,
};



