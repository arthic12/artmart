const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [
    {
      artwork: { type: mongoose.Schema.Types.ObjectId, ref: "Artwork", required: true },
      quantity: { type: Number, default: 1, min: 1 },
    },
  ],
  totalPrice: { type: Number, default: 0 },
});

module.exports = mongoose.model("Cart", cartSchema);