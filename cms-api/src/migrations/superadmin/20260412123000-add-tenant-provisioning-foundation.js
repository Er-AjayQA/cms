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
    await queryInterface.changeColumn("tenants", "status", {
      type: Sequelize.ENUM(
        "pending",
        "provisioning",
        "active",
        "failed",
        "suspended",
        "archived",
      ),
      allowNull: false,
      defaultValue: "pending",
    });

    await addColumnIfMissing(queryInterface, "tenants", "provisioningStep", {
      type: Sequelize.STRING,
    });
    await addColumnIfMissing(queryInterface, "tenants", "failureReason", {
      type: Sequelize.TEXT,
    });
    await addColumnIfMissing(queryInterface, "tenants", "failedAt", {
      type: Sequelize.DATE,
    });
    await addColumnIfMissing(queryInterface, "tenants", "activatedAt", {
      type: Sequelize.DATE,
    });
    await addColumnIfMissing(queryInterface, "tenants", "suspendedAt", {
      type: Sequelize.DATE,
    });
    await addColumnIfMissing(queryInterface, "tenants", "archivedAt", {
      type: Sequelize.DATE,
    });

    await queryInterface.changeColumn("tenant_databases", "status", {
      type: Sequelize.ENUM(
        "pending",
        "verifying",
        "creating",
        "migrating",
        "seeding",
        "ready",
        "failed",
      ),
      allowNull: false,
      defaultValue: "pending",
    });

    await addColumnIfMissing(queryInterface, "tenant_databases", "failureReason", {
      type: Sequelize.TEXT,
    });
    await addColumnIfMissing(
      queryInterface,
      "tenant_databases",
      "lastConnectionTestAt",
      {
        type: Sequelize.DATE,
      },
    );
    await addColumnIfMissing(queryInterface, "tenant_databases", "lastMigrationAt", {
      type: Sequelize.DATE,
    });
    await addColumnIfMissing(queryInterface, "tenant_databases", "verifiedAt", {
      type: Sequelize.DATE,
    });
    await addColumnIfMissing(queryInterface, "tenant_databases", "readyAt", {
      type: Sequelize.DATE,
    });
    await addColumnIfMissing(queryInterface, "tenant_databases", "failedAt", {
      type: Sequelize.DATE,
    });

    await queryInterface.changeColumn("domains", "status", {
      type: Sequelize.ENUM(
        "active",
        "inactive",
        "pending",
        "pending_dns",
        "verified",
        "failed",
        "disabled",
      ),
      allowNull: false,
      defaultValue: "pending_dns",
    });

    await queryInterface.bulkUpdate(
      "domains",
      { status: "verified" },
      { status: "active" },
    );
    await queryInterface.bulkUpdate(
      "domains",
      { status: "disabled" },
      { status: "inactive" },
    );

    await queryInterface.changeColumn("domains", "status", {
      type: Sequelize.ENUM(
        "pending",
        "pending_dns",
        "verified",
        "failed",
        "disabled",
      ),
      allowNull: false,
      defaultValue: "pending_dns",
    });

    await addColumnIfMissing(queryInterface, "domains", "verificationToken", {
      type: Sequelize.STRING,
    });
    await addColumnIfMissing(queryInterface, "domains", "sslStatus", {
      type: Sequelize.ENUM("pending", "active", "failed", "disabled"),
      allowNull: false,
      defaultValue: "pending",
    });
    await addColumnIfMissing(queryInterface, "domains", "failureReason", {
      type: Sequelize.TEXT,
    });
    await addColumnIfMissing(queryInterface, "domains", "verifiedAt", {
      type: Sequelize.DATE,
    });
    await addColumnIfMissing(queryInterface, "domains", "failedAt", {
      type: Sequelize.DATE,
    });
    await addColumnIfMissing(queryInterface, "domains", "disabledAt", {
      type: Sequelize.DATE,
    });

    const tables = await queryInterface.showAllTables();

    if (!tables.includes("provisioning_jobs")) {
      await queryInterface.createTable("provisioning_jobs", {
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
        tenantDatabaseId: {
          type: Sequelize.UUID,
          references: {
            model: "tenant_databases",
            key: "id",
          },
          onDelete: "SET NULL",
        },
        createdBy: {
          type: Sequelize.UUID,
          references: {
            model: "super_admins",
            key: "id",
          },
          onDelete: "SET NULL",
        },
        type: {
          type: Sequelize.ENUM(
            "tenant_create",
            "tenant_retry",
            "tenant_migration",
            "db_connection_test",
            "domain_verification",
          ),
          allowNull: false,
          defaultValue: "tenant_create",
        },
        status: {
          type: Sequelize.ENUM(
            "queued",
            "running",
            "succeeded",
            "failed",
            "cancelled",
          ),
          allowNull: false,
          defaultValue: "queued",
        },
        step: {
          type: Sequelize.STRING,
        },
        attempts: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        maxAttempts: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 3,
        },
        errorMessage: {
          type: Sequelize.TEXT,
        },
        metadata: {
          type: Sequelize.JSON,
        },
        startedAt: {
          type: Sequelize.DATE,
        },
        finishedAt: {
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
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes("provisioning_jobs")) {
      await queryInterface.dropTable("provisioning_jobs");
    }

    await removeColumnIfExists(queryInterface, "domains", "disabledAt");
    await removeColumnIfExists(queryInterface, "domains", "failedAt");
    await removeColumnIfExists(queryInterface, "domains", "verifiedAt");
    await removeColumnIfExists(queryInterface, "domains", "failureReason");
    await removeColumnIfExists(queryInterface, "domains", "sslStatus");
    await removeColumnIfExists(queryInterface, "domains", "verificationToken");

    await queryInterface.changeColumn("domains", "status", {
      type: Sequelize.ENUM(
        "active",
        "inactive",
        "pending",
        "pending_dns",
        "verified",
        "failed",
        "disabled",
      ),
      defaultValue: "active",
    });
    await queryInterface.bulkUpdate(
      "domains",
      { status: "active" },
      { status: "verified" },
    );
    await queryInterface.bulkUpdate(
      "domains",
      { status: "inactive" },
      { status: "disabled" },
    );
    await queryInterface.bulkUpdate(
      "domains",
      { status: "inactive" },
      {
        status: {
          [Sequelize.Op.in]: ["pending", "pending_dns", "failed"],
        },
      },
    );
    await queryInterface.changeColumn("domains", "status", {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: "active",
    });

    await removeColumnIfExists(queryInterface, "tenant_databases", "failedAt");
    await removeColumnIfExists(queryInterface, "tenant_databases", "readyAt");
    await removeColumnIfExists(queryInterface, "tenant_databases", "verifiedAt");
    await removeColumnIfExists(queryInterface, "tenant_databases", "lastMigrationAt");
    await removeColumnIfExists(
      queryInterface,
      "tenant_databases",
      "lastConnectionTestAt",
    );
    await removeColumnIfExists(queryInterface, "tenant_databases", "failureReason");

    await queryInterface.bulkUpdate(
      "tenant_databases",
      { status: "pending" },
      {
        status: {
          [Sequelize.Op.in]: ["verifying", "creating", "migrating", "seeding"],
        },
      },
    );

    await queryInterface.changeColumn("tenant_databases", "status", {
      type: Sequelize.ENUM("pending", "ready", "failed"),
      allowNull: false,
      defaultValue: "pending",
    });

    await removeColumnIfExists(queryInterface, "tenants", "archivedAt");
    await removeColumnIfExists(queryInterface, "tenants", "suspendedAt");
    await removeColumnIfExists(queryInterface, "tenants", "activatedAt");
    await removeColumnIfExists(queryInterface, "tenants", "failedAt");
    await removeColumnIfExists(queryInterface, "tenants", "failureReason");
    await removeColumnIfExists(queryInterface, "tenants", "provisioningStep");

    await queryInterface.bulkUpdate(
      "tenants",
      { status: "failed" },
      { status: "pending" },
    );
    await queryInterface.bulkUpdate(
      "tenants",
      { status: "suspended" },
      { status: "archived" },
    );
    await queryInterface.changeColumn("tenants", "status", {
      type: Sequelize.ENUM("provisioning", "active", "suspended", "failed"),
      allowNull: false,
      defaultValue: "provisioning",
    });
  },
};
