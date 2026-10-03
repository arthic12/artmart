// Load the secrets from the .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Allow the React frontend to talk to this backend
app.use(cors({ origin: "http://localhost:5173" }));

// Allow the server to read JSON data sent from the frontend
app.use(express.json());

// A simple test route
app.get("/", (req, res) => {
  res.json({ message: "ArtMart API is running" });
});

// API routes
app.use("/api/artworks", require("./routes/artworkRoutes"));
app.use("/api/artists", require("./routes/artistRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});