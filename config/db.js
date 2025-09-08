const mongoose = require("mongoose");
const DB = process.env.MONGO_URI;
mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process if DB fails
  }
};

module.exports = connectDB;
