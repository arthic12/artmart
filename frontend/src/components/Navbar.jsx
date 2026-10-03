import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Load data once, so suggestions appear instantly while typing
  useEffect(() => {
    api("/artworks")
      .then((d) => setArtworks(Array.isArray(d) ? d : d.artworks || []))
      .catch(() => {});
    api("/artists")
      .then((d) => setArtists(Array.isArray(d) ? d : d.artists || []))
      .catch(() => {});
  }, []);

  // Close the dropdown when clicking outside the search box
  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const q = query.trim().toLowerCase();
  const categoryNames = [...new Set(artworks.map((a) => a.category))].filter(Boolean);

  const suggestions = q
    ? [
        ...categoryNames
          .filter((c) => c.toLowerCase().includes(q))
          .slice(0, 2)
          .map((c) => ({ type: "Category", label: c, to: `/explore?category=${encodeURIComponent(c)}` })),
        ...artists
          .filter((a) => a.name.toLowerCase().includes(q))
          .slice(0, 3)
          .map((a) => ({ type: "Artist", label: a.name, to: `/artists/${a._id}` })),
        ...artworks
          .filter((a) => a.title.toLowerCase().includes(q))
          .slice(0, 5)
          .map((a) => ({ type: "Artwork", label: a.title, to: `/artworks/${a._id}` })),
      ]
    : [];

  const go = (to) => {
    navigate(to);
    setOpen(false);
    setQuery("");
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <svg className="logo-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="ArtMart logo">
            <rect x="2" y="2" width="60" height="60" rx="16" fill="#1F2A44" />
            <rect x="7" y="7" width="50" height="50" rx="11" fill="none" stroke="#B8893F" strokeWidth="1.5" opacity="0.7" />
            <path d="M32 47 C14 35 15 21 24 19.5 C28.5 18.8 31 21.5 32 24 C33 21.5 35.5 18.8 40 19.5 C49 21 50 35 32 47 Z" fill="#B8893F" />
            <path d="M22 24 C25 22.5 28 24 29 27" fill="none" stroke="#F8F0E5" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            <circle cx="46" cy="16" r="3.2" fill="#E07A5F" />
            <circle cx="51" cy="23" r="2.4" fill="#81B29A" />
            <circle cx="41" cy="12" r="2" fill="#F8F0E5" />
          </svg>
          <span className="logo-text">
            ArtMart<small>Art for Every Heart</small>
          </span>
        </Link>

        <div className="search-wrap" ref={boxRef}>
          <input
            className="search"
            placeholder="Search for artworks, artists, categories..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                go(`/explore?search=${encodeURIComponent(query.trim())}`);
              }
              if (e.key === "Escape") setOpen(false);
            }}
          />

          {open && q && (
            <div className="suggestions">
              {suggestions.length > 0 ? (
                suggestions.map((s, i) => (
                  <div key={i} className="suggestion" onClick={() => go(s.to)}>
                    <span>{s.label}</span>
                    <small>{s.type}</small>
                  </div>
                ))
              ) : (
                <div className="suggestion no-result">No results found</div>
              )}
            </div>
          )}
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/artists">Artists</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/about">About</Link>
        </nav>

        <div className="nav-right">
          <Link to="/wishlist" title="Wishlist" className="nav-wishlist">♥</Link>
          <Link to="/cart" title="Cart">🛒</Link>
          {user ? (
            <>
              <Link to="/profile" className="nav-user" title="My Profile">
                <span className="nav-avatar">{(user.name || "?").charAt(0).toUpperCase()}</span>
              </Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login / Sign Up</Link>
          )}
        </div>
      </div>
    </header>
  );
}