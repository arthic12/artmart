const Wishlist = require("../models/Wishlist");

const getOrCreate = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, artworks: [] });
  return wishlist;
};

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreate(req.user._id);
    await wishlist.populate("artworks");
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/wishlist/:artworkId
const addToWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreate(req.user._id);
    const id = req.params.artworkId;
    if (!wishlist.artworks.some((a) => a.toString() === id)) {
      wishlist.artworks.push(id);
      await wishlist.save();
    }
    await wishlist.populate("artworks");
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/wishlist/:artworkId
const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreate(req.user._id);
    wishlist.artworks = wishlist.artworks.filter(
      (a) => a.toString() !== req.params.artworkId
    );
    await wishlist.save();
    await wishlist.populate("artworks");
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };