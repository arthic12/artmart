import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Home.css";

const CATEGORIES = [
  { icon: "🎨", name: "Paintings" },
  { icon: "💻", name: "Digital Art" },
  { icon: "✏️", name: "Sketches" },
  { icon: "📷", name: "Photography" },
  { icon: "🗿", name: "Sculptures" },
  { icon: "🌀", name: "Abstract Art" },
  { icon: "💧", name: "Watercolor" },
  { icon: "🖌️", name: "Illustrations" },
  { icon: "🏺", name: "Pottery" },
  { icon: "🧵", name: "Textile Art" },
  { icon: "🖨️", name: "Printmaking" },
  { icon: "✒️", name: "Calligraphy" },
  { icon: "🧩", name: "Mixed Media" },
  { icon: "🪵", name: "Handicrafts" },
];

const priceText = (p) =>
  p !== undefined && p !== null ? `₹${Number(p).toLocaleString("en-IN")}` : "";

export default function Home() {
  const wallRef = useRef(null);
  const [showAll, setShowAll] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const visibleCategories = showAll ? CATEGORIES : CATEGORIES.slice(0, 6);
  const wallItems = artworks.slice(0, 5);
  const featuredItems = artworks.slice(0, 4);

  // Load real artworks with the same api helper the other pages use
  useEffect(() => {
    api("/artworks")
      .then((data) => {
        const list = Array.isArray(data) ? data : data.artworks || data.data || [];
        setArtworks(list);
      })
      .catch((err) => console.error("Could not load artworks:", err))
      .finally(() => setLoading(false));
  }, []);

  // Spotlight follows the cursor across the gallery wall
  const handleMove = (e) => {
    const el = wallRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <main className="hm">
      {/* HERO */}
      <section className="hm-hero">
        <div className="hm-hero-copy">
          <h1>Original art, straight from the artist's studio.</h1>
          <p>
            Browse paintings, prints, sculptures and digital work from
            independent artists. Every piece is signed, and every purchase
            goes to the person who made it.
          </p>
          <div className="hm-cta-row">
            <Link to="/explore" className="hm-btn hm-btn-gold">Explore artworks</Link>
            <Link to="/artists" className="hm-btn hm-btn-ghost">Meet the artists</Link>
          </div>
          <p className="hm-hint">Move your cursor over the wall to light up the work.</p>
        </div>

        <div
          className="hm-wall"
          ref={wallRef}
          onMouseMove={handleMove}
          aria-label="Gallery wall of featured artworks"
        >
          {wallItems.map((a, i) => (
            <Link
              to={`/artworks/${a._id}`}
              key={a._id}
              className={`hm-frame hm-f${i + 1}`}
            >
              <img className="hm-art" src={a.image} alt={a.title} />
              <div className="hm-plaque">
                <strong>{a.title}</strong>
                <span>{a.artist?.name || "Unknown artist"} · {priceText(a.price)}</span>
              </div>
            </Link>
          ))}
          {!loading && wallItems.length === 0 && (
            <p className="hm-empty">No artworks yet. Add one and it will appear here.</p>
          )}
          <div className="hm-spot" aria-hidden="true" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="hm-block">
        <div className="hm-head">
          <h2>Start with what you love</h2>
          <button
            type="button"
            className="hm-link"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
          >
            {showAll ? "Show fewer" : "See all categories"}
          </button>
        </div>
        <div className="hm-cats">
          {visibleCategories.map((c) => (
            <Link
              to={`/explore?category=${encodeURIComponent(c.name)}`}
              key={c.name}
              className="hm-cat"
            >
              <span className="hm-cat-icon">{c.icon}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="hm-block hm-block-tint">
        <div className="hm-head">
          <h2>New on the wall this week</h2>
          <Link to="/explore" className="hm-link">View all artworks</Link>
        </div>

        {loading && <p className="hm-note">Loading artworks…</p>}
        {!loading && featuredItems.length === 0 && (
          <p className="hm-note">No artworks to show yet.</p>
        )}

        <div className="hm-grid">
          {featuredItems.map((a) => (
            <Link to={`/artworks/${a._id}`} key={a._id} className="hm-card">
              <div className="hm-card-art">
                <img src={a.image} alt={a.title} />
                {a.category && <span className="hm-tag">{a.category}</span>}
              </div>
              <div className="hm-card-info">
                <h3>{a.title}</h3>
                <p>{a.artist?.name || "Unknown artist"}</p>
                <strong>{priceText(a.price)}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ARTIST CTA */}
      <section className="hm-sell">
        <h2>Make art? Open your own shop on ArtMart.</h2>
        <p>List your first piece in a few minutes. We handle the storefront, you keep the credit.</p>
        <Link to="/sell" className="hm-btn hm-btn-gold">Start selling</Link>
      </section>
    </main>
  );
}