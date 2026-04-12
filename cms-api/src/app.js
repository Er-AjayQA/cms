const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middlewares/error-handler");
const superAdminAuthRoutes = require("./modules/super-admin/auth/routes/auth.routes");
const superAdminRoutes = require("./modules/super-admin/routes/super-admin.routes");

const app = express();

app.use(cors());
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
  );
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

app.use("/api/super-admin/auth", superAdminAuthRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use(errorHandler);

module.exports = app;
