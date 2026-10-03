import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Footer.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const subscribe = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await api("/newsletter/subscribe", {
        method: "POST",
        body: { email },
      });
      setMessage(res.message || "Thanks for subscribing. Look out for our next update.");
      setDone(true);
      setEmail("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="ft">
      <div className="ft-inner">
        <div className="ft-brand">
          <Link to="/" className="ft-logo">ArtMart</Link>
          <p>Art for every heart. Original work from independent artists, sent to your door.</p>
        </div>

        <nav className="ft-col" aria-label="Quick links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/artists">Artists</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/about">About</Link>
          <Link to="/sell">Sell your art</Link>
        </nav>

        <nav className="ft-col" aria-label="Customer support">
          <h4>Customer Support</h4>
          <Link to="/help/contact">Contact Us</Link>
          <Link to="/help/faqs">FAQs</Link>
          <Link to="/help/shipping">Shipping Policy</Link>
          <Link to="/help/returns">Return Policy</Link>
        </nav>

        <div className="ft-col">
          <h4>Stay Connected</h4>
          <p className="ft-note">New artworks and artist stories, straight to your inbox.</p>
          {done ? (
            <p className="ft-thanks" role="status">{message}</p>
          ) : (
            <>
              <form className="ft-form" onSubmit={subscribe}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-label="Email address"
                />
                <button type="submit" disabled={sending}>
                  {sending ? "Subscribing…" : "Subscribe"}
                </button>
              </form>
              {error && (
                <p role="alert" style={{ marginTop: 8, color: "#ff9c94", fontSize: 14 }}>
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="ft-bottom">
        <span>© {new Date().getFullYear()} ArtMart. All rights reserved.</span>
        <span>Art Connects People</span>
      </div>
    </footer>
  );
}