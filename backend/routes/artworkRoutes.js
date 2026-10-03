const express = require("express");
const {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} = require("../controllers/artworkController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getArtworks);
router.get("/:id", getArtworkById);

// Only logged-in artists and admins can change artworks
router.post("/", protect, restrictTo("artist", "admin"), createArtwork);
router.put("/:id", protect, restrictTo("artist", "admin"), updateArtwork);
router.delete("/:id", protect, restrictTo("artist", "admin"), deleteArtwork);

module.exports = router;