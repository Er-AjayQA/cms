"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes("tenant_databases")) {
      return;
    }

    await queryInterface.createTable("tenant_databases", {
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
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "tenants",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      dbName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      dbHost: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dbPort: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3306,
      },
      dbUser: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dbPassword: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      currentVersion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("pending", "ready", "failed"),
        allowNull: false,
        defaultValue: "pending",
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tenant_databases");
  },
};
