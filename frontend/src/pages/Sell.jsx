import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Sell.css";

const DEFAULT_CATEGORIES = ["Paintings", "Digital Art", "Sketches", "Photography", "Sculptures", "Abstract Art", "Jewelry"];

const STEPS = [
  { title: "Create your account", text: "Sign up or log in. It takes a minute." },
  { title: "List your artwork", text: "Add a photo, a title, a price and a short description." },
  { title: "Reach buyers", text: "Your piece appears on Explore and on your artist page." },
];

const empty = { title: "", category: "", price: "", medium: "", size: "", image: "", description: "" };

export default function Sell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Offer the categories that already exist in your store
  useEffect(() => {
    api("/artworks")
      .then((d) => {
        const list = Array.isArray(d) ? d : d.artworks || d.data || [];
        const found = [...new Set(list.map((a) => a.category))].filter(Boolean);
        if (found.length) setCategories([...new Set([...found, ...DEFAULT_CATEGORIES])].sort());
      })
      .catch(() => {});
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setBusy(true);
    try {
      const saved = await api("/artworks", {
        method: "POST",
        token: user.token,
        body: { ...form, price: Number(form.price) },
      });
      const art = saved.artwork || saved;
      setForm(empty);
      setMessage({ type: "ok", text: "Your artwork is listed." });
      if (art?._id) setTimeout(() => navigate(`/artworks/${art._id}`), 900);
    } catch (err) {
      setMessage({ type: "err", text: err.message || "Could not list this artwork." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="sl">
      <section className="sl-top">
        <div className="sl-wrap">
          <h1>Sell your art on ArtMart</h1>
          <p>Put your work in front of people who are looking for something made by a real person.</p>
        </div>
      </section>

      <section className="sl-wrap sl-steps">
        {STEPS.map((s, i) => (
          <div key={s.title} className="sl-step">
            <span className="sl-num">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </section>

      <section className="sl-wrap sl-formwrap">
        {!user ? (
          <div className="sl-gate">
            <h2>Log in to list your first piece</h2>
            <p>You need an account before you can add artwork.</p>
            <div className="sl-row">
              <Link to="/register" className="sl-btn sl-gold">Create account</Link>
              <Link to="/login" className="sl-btn sl-dark">Log in</Link>
            </div>
          </div>
        ) : (
          <form className="sl-form" onSubmit={submit}>
            <h2>List an artwork</h2>

            <label>Title
              <input required value={form.title} onChange={set("title")} placeholder="e.g. Monsoon Hour" />
            </label>

            <div className="sl-two">
              <label>Category
                <select required value={form.category} onChange={set("category")}>
                  <option value="">Choose one</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Price (₹)
                <input required type="number" min="1" value={form.price} onChange={set("price")} />
              </label>
            </div>

            <div className="sl-two">
              <label>Medium
                <input value={form.medium} onChange={set("medium")} placeholder="e.g. Oil on canvas" />
              </label>
              <label>Size
                <input value={form.size} onChange={set("size")} placeholder='e.g. 24 x 36 in' />
              </label>
            </div>

            <label>Image link
              <input required type="url" value={form.image} onChange={set("image")} placeholder="https://..." />
            </label>
            {form.image && <img className="sl-preview" src={form.image} alt="Preview of your artwork" />}

            <label>Description
              <textarea rows="4" value={form.description} onChange={set("description")} placeholder="Tell buyers about this piece" />
            </label>

            {message.text && <p className={`sl-msg ${message.type}`} role="status">{message.text}</p>}
            <button className="sl-btn sl-gold" disabled={busy}>{busy ? "Listing…" : "List artwork"}</button>
          </form>
        )}
      </section>
    </main>
  );
}