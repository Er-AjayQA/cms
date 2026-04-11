const { DataTypes } = require("sequelize");
const { controlSequelize } = require("../../core/db/control-db");

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
    subscription_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    onboarding_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("provisioning", "active", "suspended", "failed"),
      allowNull: false,
      defaultValue: "provisioning",
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
