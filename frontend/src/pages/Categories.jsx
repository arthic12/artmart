import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Categories.css";

const ICONS = {
  paintings: "🎨",
  "digital art": "💻",
  sketches: "✏️",
  photography: "📷",
  sculptures: "🗿",
  "abstract art": "🌀",
  watercolor: "💧",
  illustrations: "🖌️",
  pottery: "🏺",
  jewelry: "💎",
  "textile art": "🧵",
  printmaking: "🖨️",
  calligraphy: "✒️",
  "mixed media": "🧩",
  handicrafts: "🪵",
};

export default function Categories() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/artworks")
      .then((d) => setArtworks(Array.isArray(d) ? d : d.artworks || d.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group artworks by category. The cover is the top-rated piece; biggest categories come first.
  const categories = useMemo(() => {
    const map = {};
    artworks.forEach((a) => {
      if (!a.category) return;
      const c = (map[a.category] = map[a.category] || { name: a.category, count: 0, cover: a });
      c.count += 1;
      if ((a.rating || 0) > (c.cover.rating || 0)) c.cover = a;
    });
    return Object.values(map).sort((x, y) => y.count - x.count || x.name.localeCompare(y.name));
  }, [artworks]);

  return (
    <main className="ct">
      <section className="ct-top">
        <div className="ct-wrap">
          <h1>Browse by category</h1>
          <p>
            {loading
              ? "Loading categories…"
              : `${categories.length} categories and ${artworks.length} artworks. Pick one to see everything in it.`}
          </p>
        </div>
      </section>

      <section className="ct-wrap ct-body">
        {error && <p className="ct-note">{error}</p>}
        {!loading && !error && categories.length === 0 && <p className="ct-note">No categories yet.</p>}

        <div className="ct-grid">
          {categories.map((c, i) => (
            <Link
              key={c.name}
              to={`/explore?category=${encodeURIComponent(c.name)}`}
              className={`ct-tile ${i === 0 ? "ct-big" : ""}`}
            >
              <img src={c.cover.image} alt="" loading="lazy" />
              <span className="ct-icon" aria-hidden="true">{ICONS[c.name.toLowerCase()] || "🖼️"}</span>
              <div className="ct-label">
                <h3>{c.name}</h3>
                <span>{c.count} {c.count === 1 ? "artwork" : "artworks"}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}