const Subscriber = require("../models/Subscriber");
const sendEmail = require("../utils/sendEmail");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter/subscribe
exports.subscribe = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.json({ message: "You are already subscribed. Thank you!" });
    }

    await Subscriber.create({ email });

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to ArtMart",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#222">
            <h2 style="color:#b8893f;margin-top:0">Welcome to ArtMart</h2>
            <p>Thank you for subscribing. You will now hear about new artworks and artist stories, straight to your inbox.</p>
            <p><a href="http://localhost:5173/explore" style="display:inline-block;padding:12px 26px;background:#c8923f;color:#fff;border-radius:999px;text-decoration:none;font-weight:600">Explore artworks</a></p>
            <p style="color:#888;font-size:13px">Art for every heart.</p>
          </div>`,
      });
    } catch (mailErr) {
      // The subscription is saved even if the email fails
      console.error("Welcome email failed:", mailErr.message);
    }

    res.status(201).json({ message: "Thank you for subscribing! Check your inbox." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};