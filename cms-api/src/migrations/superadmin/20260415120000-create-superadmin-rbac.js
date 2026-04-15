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
    const tables = await queryInterface.showAllTables();

    if (!tables.includes("superadmin_roles")) {
      await queryInterface.createTable("superadmin_roles", {
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
        description: {
          type: Sequelize.TEXT,
        },
        status: {
          type: Sequelize.ENUM("active", "inactive"),
          allowNull: false,
          defaultValue: "active",
        },
        isSystem: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
    }

    if (!tables.includes("superadmin_menus")) {
      await queryInterface.createTable("superadmin_menus", {
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
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        href: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        parentId: {
          type: Sequelize.UUID,
          references: {
            model: "superadmin_menus",
            key: "id",
          },
          onDelete: "SET NULL",
        },
        sortOrder: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.ENUM("active", "inactive"),
          allowNull: false,
          defaultValue: "active",
        },
        isSystem: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
    }

    if (!tables.includes("superadmin_role_permissions")) {
      await queryInterface.createTable("superadmin_role_permissions", {
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
        roleId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "superadmin_roles",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        menuId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "superadmin_menus",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        canRead: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        canWrite: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
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

      await queryInterface.addIndex("superadmin_role_permissions", {
        fields: ["roleId", "menuId"],
        unique: true,
        name: "superadmin_role_permissions_role_menu_unique",
      });
    }

    await addColumnIfMissing(queryInterface, "super_admins", "roleId", {
      type: Sequelize.UUID,
      references: {
        model: "superadmin_roles",
        key: "id",
      },
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, "super_admins", "roleId");

    const tables = await queryInterface.showAllTables();
    if (tables.includes("superadmin_role_permissions")) {
      await queryInterface.dropTable("superadmin_role_permissions");
    }
    if (tables.includes("superadmin_menus")) {
      await queryInterface.dropTable("superadmin_menus");
    }
    if (tables.includes("superadmin_roles")) {
      await queryInterface.dropTable("superadmin_roles");
    }
  },
};
