const { DataTypes } = require("sequelize");

function definePage(sequelize) {
  return sequelize.define(
    "Page",
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("draft", "published"),
        allowNull: false,
        defaultValue: "draft",
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
      tableName: "pages",
      timestamps: true,
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );
}

module.exports = definePage;
