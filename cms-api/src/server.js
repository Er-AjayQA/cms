const app = require("./app");
const { port } = require("./config/env");
const { controlSequelize } = require("./core/db/control-db");

async function startServer() {
  try {
    await controlSequelize.authenticate();
    console.log("Control DB connected");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
