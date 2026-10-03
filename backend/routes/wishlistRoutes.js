const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // every wishlist route needs login

router.get("/", getWishlist);
router.post("/:artworkId", addToWishlist);
router.delete("/:artworkId", removeFromWishlist);

module.exports = router;