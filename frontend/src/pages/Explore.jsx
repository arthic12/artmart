import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Explore.css";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("newest");
  const [toast, setToast] = useState("");

  useEffect(() => {
    api("/artworks")
      .then((d) => setArtworks(Array.isArray(d) ? d : d.artworks || d.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(artworks.map((a) => a.category))].filter(Boolean).sort(),
    [artworks]
  );

  const shown = useMemo(() => {
    let list = artworks.filter((a) => {
      if (category && a.category !== category) return false;
      if (search) {
        const text = `${a.title} ${a.artist?.name || ""} ${a.category || ""}`.toLowerCase();
        if (!text.includes(search)) return false;
      }
      return true;
    });
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "newest")
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [artworks, category, search, sort]);

  const pickCategory = (name) => {
    const next = new URLSearchParams(searchParams);
    if (name) next.set("category", name);
    else next.delete("category");
    setSearchParams(next);
  };

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const addToCart = async (a) => {
    if (!user) return navigate("/login");
    try {
      await api("/cart", { method: "POST", token: user.token, body: { artworkId: a._id, quantity: 1 } });
      flash(`${a.title} added to cart`);
    } catch (err) {
      flash(err.message);
    }
  };

  const addToWishlist = async (a) => {
    if (!user) return navigate("/login");
    try {
      await api(`/wishlist/${a._id}`, { method: "POST", token: user.token });
      flash(`${a.title} added to wishlist`);
    } catch (err) {
      flash(err.message);
    }
  };

  return (
    <main className="ex">
      <section className="ex-top">
        <div className="ex-wrap">
          <h1>Explore artworks</h1>
          <p>Original work from independent artists. Filter by category or sort by price.</p>

          <div className="ex-chips" role="tablist" aria-label="Categories">
            <button className={`ex-chip ${!category ? "on" : ""}`} onClick={() => pickCategory("")}>
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`ex-chip ${category === c ? "on" : ""}`}
                onClick={() => pickCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="ex-wrap ex-body">
        <div className="ex-bar">
          <span className="ex-count">
            {loading ? "Loading…" : `${shown.length} ${shown.length === 1 ? "artwork" : "artworks"}`}
            {search && ` for “${searchParams.get("search")}”`}
          </span>
          <label className="ex-sort">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="ex-note">{error}</p>}
        {!loading && !error && shown.length === 0 && (
          <div className="ex-empty">
            <h2>Nothing matches yet</h2>
            <p>Try another category or clear your search.</p>
            <button className="ex-add" onClick={() => setSearchParams({})}>Show all artworks</button>
          </div>
        )}

        <div className="ex-grid">
          {shown.map((a) => (
            <article className="ex-card" key={a._id}>
              <Link to={`/artworks/${a._id}`} className="ex-img">
                <img src={a.image} alt={a.title} loading="lazy" />
              </Link>
              <button
                className="ex-heart"
                onClick={() => addToWishlist(a)}
                aria-label={`Add ${a.title} to wishlist`}
              >
                ♡
              </button>
              <div className="ex-info">
                <span className="ex-cat">{a.category}</span>
                <h3><Link to={`/artworks/${a._id}`}>{a.title}</Link></h3>
                <p className="ex-by">by {a.artist?.name || "Unknown artist"}</p>
                <div className="ex-meta">
                  <strong>₹{Number(a.price).toLocaleString("en-IN")}</strong>
                  {a.rating ? <span>★ {a.rating} ({a.numReviews})</span> : null}
                </div>
                <button className="ex-add" onClick={() => addToCart(a)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {toast && <div className="ex-toast" role="status">{toast}</div>}
    </main>
  );
}