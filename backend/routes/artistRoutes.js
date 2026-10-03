const express = require("express");
const { getArtists, getArtistById } = require("../controllers/artistController");

const router = express.Router();

router.get("/", getArtists);
router.get("/:id", getArtistById);

module.exports = router;