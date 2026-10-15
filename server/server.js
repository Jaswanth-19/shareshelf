const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();
const PORT = 5000;

app.use(express.json());

// Home test route
app.get("/", (req, res) => {
  res.json({
    message: "ShareShelf backend is running successfully!",
  });
});

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

// Start server after connecting to MongoDB
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ShareShelf server running at http://localhost:${PORT}`);
  });
}

startServer();