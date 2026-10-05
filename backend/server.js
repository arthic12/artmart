// Load the secrets from the .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Allow the React frontend to talk to this backend.
// localhost stays allowed so your laptop version keeps working.
const allowedOrigins = [
  "http://localhost:5173",
  "https://artmart-five.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools with no origin (like a browser opening the API directly)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
  })
);

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
  console.log(`Server running on port ${PORT}`);
});