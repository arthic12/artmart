const Artwork = require("../models/Artwork");
const Artist = require("../models/Artist");

// Finds the Artist profile for a logged-in user, or creates one the first time they sell
const getOrCreateArtist = async (user) => {
  let artist = await Artist.findOne({ user: user._id });
  if (!artist) {
    artist = await Artist.create({ user: user._id, name: user.name });
  }
  return artist;
};

// GET /api/artworks
const getArtworks = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, featured, artist, limit } = req.query;
    const filter = {};

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = { $regex: safeSearch, $options: "i" };

      // Also find artists whose name matches, so searching an artist's name shows their artworks
      const matchingArtists = await Artist.find({ name: regex }).select("_id");

      filter.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { artist: { $in: matchingArtists.map((a) => a._id) } },
      ];
    }
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (artist) filter.artist = artist;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popular: { numReviews: -1 },
    };

    let query = Artwork.find(filter)
      .populate("artist", "name profileImage")
      .sort(sortOptions[sort] || sortOptions.newest);

    if (limit) query = query.limit(Number(limit));

    const artworks = await query;
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/artworks/:id
const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate("artist");
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/artworks  (logged-in users)
const createArtwork = async (req, res) => {
  try {
    const artist = await getOrCreateArtist(req.user);

    // artist always comes from the server, never from the form
    const { artist: _ignored, ...data } = req.body;
    const artwork = await Artwork.create({ ...data, artist: artist._id });

    res.status(201).json(artwork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/artworks/:id  (owner or admin)
const updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate("artist", "user");
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    const isOwner = artwork.artist?.user && String(artwork.artist.user) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only edit your own artworks" });
    }

    const { artist: _ignored, ...data } = req.body;
    Object.assign(artwork, data, { artist: artwork.artist._id });
    await artwork.save();

    res.json(artwork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/artworks/:id  (owner or admin)
const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate("artist", "user");
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    const isOwner = artwork.artist?.user && String(artwork.artist.user) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own artworks" });
    }

    await artwork.deleteOne();
    res.json({ message: "Artwork deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getArtworks, getArtworkById, createArtwork, updateArtwork, deleteArtwork };