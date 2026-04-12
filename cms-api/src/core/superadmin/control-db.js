const { Sequelize } = require("sequelize");
const { controlDb } = require("../../config/env");

const controlSequelize = new Sequelize(
  controlDb.name,
  controlDb.user,
  controlDb.password,
  {
    host: controlDb.host,
    port: controlDb.port,
    dialect: "mysql",
    logging: false,
  },
);

module.exports = { controlSequelize };
