const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // every cart route needs login

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.put("/:artworkId", updateCartItem);
router.delete("/:artworkId", removeFromCart);

module.exports = router;