const bcrypt = require("bcryptjs");
const {
  getTenantSequelizeByTenantId,
} = require("../../../core/tenant/get-tenant-sequelize");
const {
  getTenantModels,
} = require("../../../core/tenant/tenant-model-registry");

async function seedTenant({
  tenantId,
  adminEmail,
  adminPassword,
  adminPasswordHash,
  companyName,
  role,
}) {
  const sequelize = await getTenantSequelizeByTenantId(tenantId);
  const { User, Site, Page, Menu } = getTenantModels(sequelize);

  const transaction = await sequelize.transaction();

  try {
    const passwordHash =
      adminPasswordHash || (await bcrypt.hash(adminPassword, 10));

    const [owner] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name: companyName,
        email: adminEmail,
        password_hash: passwordHash,
        role: role,
        status: "active",
      },
      transaction,
    });

    const [site] = await Site.findOrCreate({
      where: { name: `${companyName} Website` },
      defaults: {
        name: `${companyName} Website`,
        primaryDomain: null,
        status: "active",
      },
      transaction,
    });

    const existingPages = await Page.count({
      where: { siteId: site.id },
      transaction,
    });
    if (!existingPages) {
      await Page.bulkCreate(
        [
          {
            siteId: site.id,
            title: "Home",
            slug: "/",
            status: "draft",
          },
          {
            siteId: site.id,
            title: "About",
            slug: "/about",
            status: "draft",
          },
        ],
        { transaction },
      );
    }

    const existingMenus = await Menu.count({
      where: { siteId: site.id },
      transaction,
    });
    if (!existingMenus) {
      await Menu.bulkCreate(
        [
          { siteId: site.id, name: "Header Menu", location: "header" },
          { siteId: site.id, name: "Footer Menu", location: "footer" },
        ],
        { transaction },
      );
    }

    await transaction.commit();

    return { owner, site };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = { seedTenant };
