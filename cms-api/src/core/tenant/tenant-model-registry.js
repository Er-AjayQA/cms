const { loadTenantModels } = require("../../models/tenant");

const registry = new WeakMap();

function getTenantModels(sequelize) {
  if (registry.has(sequelize)) {
    return registry.get(sequelize);
  }

  const models = loadTenantModels(sequelize);
  registry.set(sequelize, models);
  return models;
}

module.exports = { getTenantModels };
