const Cart = require("../models/Cart");

const getOrCreate = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// Recalculates the total from current artwork prices and saves
const refresh = async (cart) => {
  await cart.populate("items.artwork");
  cart.items = cart.items.filter((i) => i.artwork); // drop deleted artworks
  cart.totalPrice = cart.items.reduce(
    (sum, i) => sum + i.artwork.price * i.quantity,
    0
  );
  await cart.save();
  return cart;
};

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const cart = await getOrCreate(req.user._id);
    res.json(await refresh(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/cart   body: { artworkId, quantity }
const addToCart = async (req, res) => {
  try {
    const { artworkId, quantity = 1 } = req.body;
    if (!artworkId) {
      return res.status(400).json({ message: "artworkId is required" });
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "Quantity must be 1 or more" });
    }

    const cart = await getOrCreate(req.user._id);
    const existing = cart.items.find((i) => i.artwork.toString() === artworkId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({ artwork: artworkId, quantity: qty });
    }
    res.json(await refresh(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/cart/:artworkId   body: { quantity }
const updateCartItem = async (req, res) => {
  try {
    const qty = Number(req.body.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "Quantity must be 1 or more" });
    }

    const cart = await getOrCreate(req.user._id);
    const item = cart.items.find((i) => i.artwork.toString() === req.params.artworkId);
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }
    item.quantity = qty;
    res.json(await refresh(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/cart/:artworkId
const removeFromCart = async (req, res) => {
  try {
    const cart = await getOrCreate(req.user._id);
    cart.items = cart.items.filter((i) => i.artwork.toString() !== req.params.artworkId);
    res.json(await refresh(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreate(req.user._id);
    cart.items = [];
    res.json(await refresh(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };