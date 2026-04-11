const { DataTypes } = require("sequelize");
const { controlSequelize } = require("../../core/db/control-db");

const TenantDatabase = controlSequelize.define(
  "TenantDatabase",
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
    dbName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    dbHost: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dbPort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3306,
    },
    dbUser: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dbPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dbType: {
      type: DataTypes.ENUM("managed", "own"),
      allowNull: false,
      defaultValue: "managed",
    },
    provisionSource: {
      type: DataTypes.ENUM("platform", "client"),
      allowNull: false,
      defaultValue: "platform",
    },
    currentVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("pending", "ready", "failed"),
      allowNull: false,
      defaultValue: "pending",
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
    modelName: "TenantDatabase",
    tableName: "tenant_databases",
    freezeTableName: true,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

module.exports = TenantDatabase;
