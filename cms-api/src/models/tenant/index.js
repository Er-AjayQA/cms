const defineTenantUser = require("./User");
const defineSite = require("./Site");
const definePage = require("./Page");
const defineMenu = require("./Menu");
const defineDummy = require("./Dummy");

function loadTenantModels(sequelize) {
  const User = defineTenantUser(sequelize);
  const Site = defineSite(sequelize);
  const Page = definePage(sequelize);
  const Menu = defineMenu(sequelize);
  const Dummy = defineDummy(sequelize);

  Site.hasMany(Page, { foreignKey: "siteId", as: "pages" });
  Page.belongsTo(Site, { foreignKey: "siteId", as: "site" });

  Site.hasMany(Menu, { foreignKey: "siteId", as: "menus" });
  Menu.belongsTo(Site, { foreignKey: "siteId", as: "site" });

  return { User, Site, Page, Menu, Dummy };
}

module.exports = { loadTenantModels };
