const { DataTypes } = require("sequelize");
const { controlSequelize } = require("../../core/db/control-db");

const TenantSubscriptionPlan = controlSequelize.define(
  "TenantSubscriptionPlan",
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
    planId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    trial_end_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    auto_renew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },

    currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "INR",
    },
    status: {
      type: DataTypes.ENUM(
        "trial",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ),
      defaultValue: "trial",
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
    modelName: "TenantSubscriptionPlan",
    tableName: "tenant_subscription_plans",
    timestamps: true,
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

module.exports = TenantSubscriptionPlan;
