"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes("tenant_admin_seeds")) {
      return;
    }

    await queryInterface.createTable("tenant_admin_seeds", {
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
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("owner", "admin"),
        allowNull: false,
        defaultValue: "owner",
      },
      status: {
        type: Sequelize.ENUM("pending", "seeded", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      failureReason: {
        type: Sequelize.TEXT,
      },
      seededAt: {
        type: Sequelize.DATE,
      },
      failedAt: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("tenant_admin_seeds", ["tenantId"], {
      name: "tenant_admin_seeds_tenant_id",
    });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes("tenant_admin_seeds")) {
      await queryInterface.dropTable("tenant_admin_seeds");
    }
  },
};
