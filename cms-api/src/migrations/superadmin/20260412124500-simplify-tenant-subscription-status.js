"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate(
      "tenants",
      { subscription_status: "trial" },
      {
        subscription_status: {
          [Sequelize.Op.notIn]: ["trial", "active", "expired", "cancelled"],
        },
      },
    );

    await queryInterface.changeColumn("tenants", "subscription_status", {
      type: Sequelize.ENUM("trial", "active", "expired", "cancelled"),
      allowNull: false,
      defaultValue: "trial",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("tenants", "subscription_status", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
