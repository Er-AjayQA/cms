const { DataTypes } = require("sequelize");

function defineTenantUser(sequelize) {
  return sequelize.define(
    "User",
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
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("owner", "admin", "editor"),
        allowNull: false,
        defaultValue: "owner",
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
      tableName: "users",
      timestamps: true,
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );
}

module.exports = defineTenantUser;
