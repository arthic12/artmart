const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  artworks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }],
});

module.exports = mongoose.model("Wishlist", wishlistSchema);