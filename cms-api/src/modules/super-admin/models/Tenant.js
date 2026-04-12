const { DataTypes } = require("sequelize");
const { controlSequelize } = require("../../../core/superadmin/control-db");

const Tenant = controlSequelize.define(
  "Tenant",
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
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    onboarding_source: {
      type: DataTypes.ENUM("website", "control_panel"),
      allowNull: false,
      defaultValue: "control_panel",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "provisioning",
        "active",
        "failed",
        "suspended",
        "archived",
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    provisioningStep: {
      type: DataTypes.STRING,
    },
    failureReason: {
      type: DataTypes.TEXT,
    },
    failedAt: {
      type: DataTypes.DATE,
    },
    activatedAt: {
      type: DataTypes.DATE,
    },
    suspendedAt: {
      type: DataTypes.DATE,
    },
    archivedAt: {
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
    modelName: "Tenant",
    tableName: "tenants",
    freezeTableName: true,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

module.exports = Tenant;


