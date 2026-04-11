const { DataTypes } = require("sequelize");
const { controlSequelize } = require("../../core/db/control-db");

const Domain = controlSequelize.define(
  "Domain",
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
    hostname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: "Domain",
    tableName: "domains",
    timestamps: true,
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

module.exports = Domain;
