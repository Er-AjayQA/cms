"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes("menus")) {
      return;
    }

    await queryInterface.createTable("menus", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      order_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
      },
      siteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "sites",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      location: {
        type: Sequelize.ENUM("header", "footer", "sidebar"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
};
