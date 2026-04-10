const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/error-handler");

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

app.use("/api", routes);
app.use(errorHandler);

module.exports = app;
