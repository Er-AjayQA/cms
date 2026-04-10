"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes("subscription_plans")) {
      return;
    }

    await queryInterface.createTable("subscription_plans", {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      billing_cycle: {
        type: Sequelize.ENUM("monthly", "yearly", "lifetime"),
        allowNull: false,
        defaultValue: "monthly",
      },

      max_pages: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      max_users: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      max_storage_gb: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      trial_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("subscription_plans");
  },
};
