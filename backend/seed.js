require("dotenv").config();
const mongoose = require("mongoose");
const Artist = require("./models/Artist");
const Artwork = require("./models/Artwork");

// Placeholder image helper
const img = (seed) => `https://picsum.photos/seed/${seed}/800/600`;
const face = (seed) => `https://picsum.photos/seed/${seed}/400/400`;

const artistsData = [
  { name: "Priya Sharma", specialization: "Landscape & Seascape Painter", location: "Mumbai, India", bio: "Priya paints glowing coastlines and sunsets in oil, inspired by years of living by the sea.", profileImage: face("priya"), coverImage: img("priya-cover") },
  { name: "Arjun Nair", specialization: "Wildlife & Expressionist Painter", location: "Kochi, India", bio: "Arjun brings animals to life with bold colour and energetic brushwork.", profileImage: face("arjun"), coverImage: img("arjun-cover") },
  { name: "Sneha Rao", specialization: "Pencil & Charcoal Sketch Artist", location: "Bengaluru, India", bio: "Sneha captures quiet human emotion with delicate pencil and charcoal sketches.", profileImage: face("sneha"), coverImage: img("sneha-cover") },
  { name: "Karthik S", specialization: "Landscape Photographer", location: "Chennai, India", bio: "Karthik travels across mountains and forests to photograph nature at its calmest.", profileImage: face("karthik"), coverImage: img("karthik-cover") },
  { name: "Meera Joshi", specialization: "Abstract & Portrait Artist", location: "Jaipur, India", bio: "Meera mixes abstract shapes with portraiture, using vivid colour to show emotion.", profileImage: face("meera"), coverImage: img("meera-cover") },
  { name: "Ethan Wilson", specialization: "Landscape Painter", location: "Portland, USA", bio: "Ethan paints warm, golden landscapes inspired by the American West.", profileImage: face("ethan"), coverImage: img("ethan-cover") },
  { name: "Sophia Martin", specialization: "Abstract Artist", location: "Lisbon, Portugal", bio: "Sophia explores movement and water through flowing abstract compositions.", profileImage: face("sophia"), coverImage: img("sophia-cover") },
  { name: "Ananya Iyer", specialization: "Digital Artist", location: "Hyderabad, India", bio: "Ananya creates vibrant digital illustrations that blend fantasy and technology.", profileImage: face("ananya"), coverImage: img("ananya-cover") },
  { name: "Rohan Mehta", specialization: "Sculptor", location: "Pune, India", bio: "Rohan carves marble and casts bronze, drawing on classical forms.", profileImage: face("rohan"), coverImage: img("rohan-cover") },
  { name: "Kavya Menon", specialization: "Watercolor & Craft Artist", location: "Thrissur, India", bio: "Kavya paints delicate watercolor florals inspired by the gardens and backwaters of Kerala.", profileImage: face("kavya"), coverImage: img("kavya-cover") },
  { name: "Vikram Singh", specialization: "Street Photographer", location: "Delhi, India", bio: "Vikram photographs everyday street life, capturing fleeting moments in crowded Indian cities.", profileImage: face("vikram"), coverImage: img("vikram-cover") },
  { name: "Isabella Rossi", specialization: "Ceramic Artist", location: "Florence, Italy", bio: "Isabella shapes expressive ceramic sculptures that blend Italian tradition with modern form.", profileImage: face("isabella"), coverImage: img("isabella-cover") },
  { name: "Aditya Verma", specialization: "Digital Concept Artist", location: "Noida, India", bio: "Aditya designs detailed digital concept art filled with futuristic worlds and glowing cities.", profileImage: face("aditya"), coverImage: img("aditya-cover") },
  { name: "Lakshmi Narayanan", specialization: "Traditional Tanjore Painter", location: "Thanjavur, India", bio: "Lakshmi creates traditional Tanjore paintings with rich gold leaf work and devotional themes.", profileImage: face("lakshmi"), coverImage: img("lakshmi-cover") },
  { name: "Daniel Carter", specialization: "Portrait Sketch Artist", location: "Austin, USA", bio: "Daniel draws realistic charcoal portraits that capture personality in every line.", profileImage: face("daniel"), coverImage: img("daniel-cover") },
];

// Each artwork names its artist; we swap the name for the real database ID below
const artworksData = [
  { title: "Serene Sunset", artist: "Priya Sharma", category: "Paintings", price: 8500, featured: true, rating: 4.8, numReviews: 124, medium: "Oil on canvas", size: "24 x 36 in", description: "A calm evening at sea, with a lone boat drifting under a burning orange sky.", image: img("serene-sunset") },
  { title: "Majestic Elephant", artist: "Arjun Nair", category: "Paintings", price: 6200, featured: true, rating: 4.7, numReviews: 98, medium: "Acrylic on canvas", size: "30 x 30 in", description: "A colourful, expressive portrait of an elephant full of pattern and life.", image: img("majestic-elephant") },
  { title: "Thoughts", artist: "Sneha Rao", category: "Sketches", price: 4800, featured: true, rating: 4.9, numReviews: 156, medium: "Graphite on paper", size: "12 x 16 in", description: "A thoughtful profile drawn with soft, detailed pencil strokes.", image: img("thoughts") },
  { title: "Mountain Bliss", artist: "Karthik S", category: "Photography", price: 7500, featured: true, rating: 4.6, numReviews: 87, medium: "Fine art print", size: "20 x 30 in", description: "A turquoise mountain lake surrounded by pine forest, photographed at dawn.", image: img("mountain-bliss") },
  { title: "Colors of Life", artist: "Meera Joshi", category: "Abstract Art", price: 9200, featured: true, rating: 4.8, numReviews: 112, medium: "Mixed media", size: "36 x 36 in", description: "Two faces made of bold, overlapping colour, celebrating human connection.", image: img("colors-of-life") },
  { title: "Golden Sunset", artist: "Ethan Wilson", category: "Paintings", price: 6200, featured: false, rating: 4.5, numReviews: 64, medium: "Oil on canvas", size: "24 x 30 in", description: "Golden light spilling across an open landscape at the end of the day.", image: img("golden-sunset") },
  { title: "Ocean Dreams", artist: "Sophia Martin", category: "Abstract Art", price: 8500, featured: false, rating: 4.7, numReviews: 71, medium: "Acrylic on canvas", size: "30 x 40 in", description: "Layers of blue and teal that capture the movement of waves.", image: img("ocean-dreams") },
  { title: "Neon Dreamer", artist: "Ananya Iyer", category: "Digital Art", price: 5400, featured: false, rating: 4.6, numReviews: 58, medium: "Digital illustration", size: "Digital print, 18 x 24 in", description: "A glowing portrait set in a neon-lit city of the future.", image: img("neon-dreamer") },
  { title: "Cyber Bloom", artist: "Ananya Iyer", category: "Digital Art", price: 4200, featured: false, rating: 4.4, numReviews: 40, medium: "Digital illustration", size: "Digital print, 16 x 20 in", description: "Flowers made of light and circuitry, growing in a digital garden.", image: img("cyber-bloom") },
  { title: "Marble Grace", artist: "Rohan Mehta", category: "Sculptures", price: 15000, featured: false, rating: 4.9, numReviews: 33, medium: "Carved marble", size: "18 in tall", description: "A classical bust carved by hand in white marble.", image: img("marble-grace") },
  { title: "Bronze Stag", artist: "Rohan Mehta", category: "Sculptures", price: 18500, featured: false, rating: 4.8, numReviews: 27, medium: "Cast bronze", size: "22 in tall", description: "A proud stag cast in bronze with a rich, dark finish.", image: img("bronze-stag") },
  { title: "Silent Gaze", artist: "Sneha Rao", category: "Sketches", price: 3800, featured: false, rating: 4.7, numReviews: 45, medium: "Charcoal on paper", size: "11 x 14 in", description: "A quiet charcoal portrait with deep shadows and soft light.", image: img("silent-gaze") },
  { title: "Misty Mornings", artist: "Karthik S", category: "Photography", price: 5200, featured: false, rating: 4.5, numReviews: 52, medium: "Fine art print", size: "16 x 24 in", description: "Morning mist rolling over a forest valley.", image: img("misty-mornings") },
  { title: "Rhythm in Red", artist: "Meera Joshi", category: "Abstract Art", price: 7800, featured: false, rating: 4.6, numReviews: 39, medium: "Acrylic on canvas", size: "30 x 30 in", description: "Energetic red and gold shapes that seem to dance across the canvas.", image: img("rhythm-in-red") },

];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear old data so running this file twice doesn't create duplicates
    await Artwork.deleteMany();
    await Artist.deleteMany();

    const createdArtists = await Artist.insertMany(artistsData);

    // Build a lookup: artist name -> artist database ID
    const artistIdByName = {};
    createdArtists.forEach((artist) => {
      artistIdByName[artist.name] = artist._id;
    });

    const artworksWithIds = artworksData.map((artwork) => ({
      ...artwork,
      artist: artistIdByName[artwork.artist],
    }));

    await Artwork.insertMany(artworksWithIds);

    console.log(`Seeded ${createdArtists.length} artists and ${artworksWithIds.length} artworks`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
