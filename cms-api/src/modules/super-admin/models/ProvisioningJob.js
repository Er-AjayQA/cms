const { DataTypes } = require("sequelize");
const { controlSequelize } = require("../../../core/superadmin/control-db");

const ProvisioningJob = controlSequelize.define(
  "ProvisioningJob",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    order_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tenantDatabaseId: {
      type: DataTypes.UUID,
    },
    createdBy: {
      type: DataTypes.UUID,
    },
    type: {
      type: DataTypes.ENUM(
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
      type: DataTypes.ENUM(
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
      type: DataTypes.STRING,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    errorMessage: {
      type: DataTypes.TEXT,
    },
    metadata: {
      type: DataTypes.JSON,
    },
    startedAt: {
      type: DataTypes.DATE,
    },
    finishedAt: {
      type: DataTypes.DATE,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    modelName: "ProvisioningJob",
    tableName: "provisioning_jobs",
    freezeTableName: true,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

module.exports = ProvisioningJob;
