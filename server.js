const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const errorHandler = require("./middleware/error");
// Load env vars
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./config/db");

//Connect to DB
connectDB();

// Route files
const bootcamps = require("./routes/bootcamps");

const app = express();

app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/bootcamps", bootcamps);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Err: ${err.message}`);
  server.close(() => process.exit(1));
});
