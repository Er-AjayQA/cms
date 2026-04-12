"use strict";

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName);

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

async function removeColumnIfExists(queryInterface, tableName, columnName) {
  const table = await queryInterface.describeTable(tableName);

  if (table[columnName]) {
    await queryInterface.removeColumn(tableName, columnName);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await removeColumnIfExists(queryInterface, "tenants", "subscription_status");

    await queryInterface.bulkUpdate(
      "tenant_subscription_plans",
      { status: "expired" },
      { status: "past_due" },
    );

    await queryInterface.changeColumn("tenant_subscription_plans", "status", {
      type: Sequelize.ENUM("trial", "active", "expired", "cancelled"),
      allowNull: false,
      defaultValue: "trial",
    });

    await addColumnIfMissing(queryInterface, "tenant_subscription_plans", "isCurrent", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addIndex("tenant_subscription_plans", ["tenantId", "isCurrent"], {
      name: "tenant_subscription_plans_tenant_id_is_current",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "tenant_subscription_plans",
      "tenant_subscription_plans_tenant_id_is_current",
    );

    await removeColumnIfExists(queryInterface, "tenant_subscription_plans", "isCurrent");

    await queryInterface.changeColumn("tenant_subscription_plans", "status", {
      type: Sequelize.ENUM(
        "trial",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ),
      defaultValue: "trial",
    });

    await addColumnIfMissing(queryInterface, "tenants", "subscription_status", {
      type: Sequelize.ENUM("trial", "active", "expired", "cancelled"),
      allowNull: false,
      defaultValue: "trial",
    });
  },
};
