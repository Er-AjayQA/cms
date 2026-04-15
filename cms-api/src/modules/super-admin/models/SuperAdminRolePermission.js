const { DataTypes } = require("sequelize");
const { controlSequelize } = require("../../../core/superadmin/control-db");

const SuperAdminRolePermission = controlSequelize.define(
  "SuperAdminRolePermission",
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
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    menuId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    canRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canWrite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    modelName: "SuperAdminRolePermission",
    tableName: "superadmin_role_permissions",
    freezeTableName: true,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [{ unique: true, fields: ["roleId", "menuId"] }],
  },
);

module.exports = SuperAdminRolePermission;
