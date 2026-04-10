const mysql = require("mysql2/promise");
const { controlDb } = require("../../config/env");

async function getMysqlAdminConnection() {
  return mysql.createConnection({
    host: controlDb.host,
    port: controlDb.port,
    user: controlDb.user,
    password: controlDb.password,
    multipleStatements: true,
  });
}

module.exports = { getMysqlAdminConnection };
