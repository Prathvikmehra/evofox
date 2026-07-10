const express = require("express");
const cors = require("cors");
const config = require("./config");
const errorHandler = require("./middlewares/errorHandler");

const parseRoutes = require("./routes/parseRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");
const generateRoutes = require("./routes/generateRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", parseRoutes);
app.use("/api", analyzeRoutes);
app.use("/api", generateRoutes);

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`EchoMind backend running on port ${config.PORT}`);
});
