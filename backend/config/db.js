const mongoose = require("mongoose");

// This function connects our app to MongoDB
const connectDB = async () => {
  try {
    // MONGO_URI comes from the .env file
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    // If the connection fails, show the reason and stop the server
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;