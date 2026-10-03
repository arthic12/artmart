const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Links this artwork to an Artist document
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
  category: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  medium: { type: String, default: "" }, // e.g. "Oil on canvas"
  size: { type: String, default: "" },   // e.g. "24 x 36 in"
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }, // also used for "Popular" sorting
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Artwork", artworkSchema);