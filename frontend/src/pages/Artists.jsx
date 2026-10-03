import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Artists.css";

const photoOf = (a) => a.image || a.avatar || a.photo || a.profileImage || a.picture || "";

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      api("/artists"),
      api("/artworks").catch(() => []), // used only for counts and thumbnails
    ])
      .then(([a, w]) => {
        setArtists(Array.isArray(a) ? a : a.artists || a.data || []);
        setArtworks(Array.isArray(w) ? w : w.artworks || w.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group each artist's artworks by artist id
  const worksByArtist = useMemo(() => {
    const map = {};
    artworks.forEach((w) => {
      const id = w.artist?._id || w.artist;
      if (!id) return;
      (map[id] = map[id] || []).push(w);
    });
    return map;
  }, [artworks]);

  const shown = artists.filter((a) =>
    `${a.name} ${a.location || ""} ${a.speciality || ""}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <main className="ar">
      <section className="ar-top">
        <div className="ar-wrap">
          <h1>Meet the artists</h1>
          <p>The people behind every piece. Open a profile to see their full collection.</p>
          <input
            className="ar-search"
            type="search"
            placeholder="Search artists by name or place"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search artists"
          />
        </div>
      </section>

      <section className="ar-wrap ar-body">
        <p className="ar-count">
          {loading ? "Loading artists…" : `${shown.length} ${shown.length === 1 ? "artist" : "artists"}`}
        </p>

        {error && <p className="ar-note">{error}</p>}
        {!loading && !error && shown.length === 0 && (
          <p className="ar-note">No artists match “{query}”. Try a different name.</p>
        )}

        <div className="ar-grid">
          {shown.map((a) => {
            const works = worksByArtist[a._id] || [];
            const photo = photoOf(a);
            return (
              <Link to={`/artists/${a._id}`} key={a._id} className="ar-card">
                <div className="ar-head">
                  {photo ? (
                    <img className="ar-avatar" src={photo} alt={a.name} />
                  ) : (
                    <span className="ar-avatar ar-initial" aria-hidden="true">
                      {(a.name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <h3>{a.name}</h3>
                    {(a.location || a.speciality) && <p className="ar-sub">{a.location || a.speciality}</p>}
                  </div>
                </div>

                {a.bio && <p className="ar-bio">{a.bio}</p>}

                {works.length > 0 && (
                  <div className="ar-thumbs">
                    {works.slice(0, 3).map((w) => (
                      <img key={w._id} src={w.image} alt={w.title} loading="lazy" />
                    ))}
                  </div>
                )}

                <div className="ar-foot">
                  <span>{works.length} {works.length === 1 ? "artwork" : "artworks"}</span>
                  <strong>View profile</strong>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}