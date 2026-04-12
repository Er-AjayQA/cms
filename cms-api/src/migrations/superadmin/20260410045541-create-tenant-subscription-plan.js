"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes("tenant_subscription_plans")) {
      return;
    }

    await queryInterface.createTable("tenant_subscription_plans", {
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
      planId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "subscription_plans",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      trial_end_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      auto_renew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "INR",
      },
      status: {
        type: Sequelize.ENUM(
          "trial",
          "active",
          "past_due",
          "cancelled",
          "expired",
        ),
        defaultValue: "trial",
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
    await queryInterface.dropTable("tenant_subscription_plans");
  },
};
