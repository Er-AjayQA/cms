const { DataTypes } = require("sequelize");

function defineMenu(sequelize) {
  return sequelize.define(
    "Menu",
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
      siteId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.ENUM("header", "footer", "sidebar"),
        allowNull: false,
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
      tableName: "menus",
      timestamps: true,
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );
}

module.exports = defineMenu;
