const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  // Links an Artist profile to the User account that owns it.
  // Seeded artists have no user, so this is optional (sparse).
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
  name: { type: String, required: true },
  bio: { type: String, default: "" },
  specialization: { type: String, default: "" },
  location: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  socialLinks: {
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    website: { type: String, default: "" },
  },
});

module.exports = mongoose.model("Artist", artistSchema);