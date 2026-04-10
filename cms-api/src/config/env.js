require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "secret",
  controlDb: {
    host: process.env.CONTROL_DB_HOST,
    port: Number(process.env.CONTROL_DB_PORT || 3306),
    name: process.env.CONTROL_DB_NAME,
    user: process.env.CONTROL_DB_USER,
    password: process.env.CONTROL_DB_PASSWORD,
  },
  defaultSuperAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || "admin@cms.com",
    password: process.env.SUPER_ADMIN_PASSWORD || "Admin@123",
  },
};
