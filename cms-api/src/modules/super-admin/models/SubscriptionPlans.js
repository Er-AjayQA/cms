const { DataTypes } = require("sequelize");
const { controlSequelize } = require("../../../core/superadmin/control-db");

const SubscriptionPlan = controlSequelize.define(
  "SubscriptionPlan",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    billing_cycle: {
      type: DataTypes.ENUM("monthly", "yearly", "lifetime"),
      allowNull: false,
      defaultValue: "monthly",
    },
    max_pages: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    max_storage_gb: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    trial_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
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
    modelName: "SubscriptionPlan",
    tableName: "subscription_plans",
    timestamps: true,
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

module.exports = SubscriptionPlan;


