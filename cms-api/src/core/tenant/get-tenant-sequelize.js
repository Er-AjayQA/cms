const { Sequelize } = require("sequelize");
const { TenantDatabase } = require("../../modules/super-admin/models");

const tenantConnectionCache = new Map();

async function getTenantSequelizeByTenantId(tenantId) {
  if (tenantConnectionCache.has(tenantId)) {
    return tenantConnectionCache.get(tenantId);
  }

  const dbConfig = await TenantDatabase.findOne({ where: { tenantId } });

  if (!dbConfig) {
    throw new Error(`Tenant DB config not found for tenantId=${tenantId}`);
  }

  const sequelize = new Sequelize(
    dbConfig.dbName,
    dbConfig.dbUser,
    dbConfig.dbPassword,
    {
      host: dbConfig.dbHost,
      port: dbConfig.dbPort,
      dialect: "mysql",
      logging: false,
    },
  );

  tenantConnectionCache.set(tenantId, sequelize);
  return sequelize;
}

async function closeAllTenantConnections() {
  for (const sequelize of tenantConnectionCache.values()) {
    await sequelize.close();
  }
  tenantConnectionCache.clear();
}

module.exports = {
  getTenantSequelizeByTenantId,
  closeAllTenantConnections,
};

