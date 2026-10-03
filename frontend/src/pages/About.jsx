import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./About.css";

const VALUES = [
  {
    title: "Artists come first",
    text: "Every piece is listed by the person who made it, with their name and story beside it. Buying here supports them directly.",
  },
  {
    title: "Art for every budget",
    text: "From small prints to large originals, there is something for every wall and every wallet. Prices are shown clearly, with no surprises.",
  },
  {
    title: "Easy to browse, easy to trust",
    text: "Filter by category, read ratings from other buyers and see who made each work before you decide.",
  },
];

const STEPS = [
  { title: "Discover", text: "Browse by category or meet the artists and follow work you like." },
  { title: "Choose", text: "Save favourites to your wishlist, then add the pieces you want to your cart." },
  { title: "Bring it home", text: "Check out and the artwork is on its way to your space." },
];

export default function About() {
  const [counts, setCounts] = useState({ artworks: 0, artists: 0, categories: 0 });

  // Real numbers from your own data
  useEffect(() => {
    Promise.all([api("/artworks").catch(() => []), api("/artists").catch(() => [])]).then(([w, a]) => {
      const works = Array.isArray(w) ? w : w.artworks || w.data || [];
      const artists = Array.isArray(a) ? a : a.artists || a.data || [];
      setCounts({
        artworks: works.length,
        artists: artists.length,
        categories: new Set(works.map((x) => x.category).filter(Boolean)).size,
      });
    });
  }, []);

  return (
    <main className="ab">
      <section className="ab-top">
        <div className="ab-wrap">
          <h1>Art for every heart.</h1>
          <p>
            ArtMart is a place where independent artists share their work and people find
            pieces they love enough to live with.
          </p>
          <div className="ab-cta">
            <Link to="/explore" className="ab-btn ab-gold">Explore artworks</Link>
            <Link to="/artists" className="ab-btn ab-ghost">Meet the artists</Link>
            <Link to="/sell" className="ab-btn ab-gold">Start selling</Link>
          </div>
        </div>
      </section>

      <section className="ab-wrap ab-stats" aria-label="ArtMart in numbers">
        <div><strong>{counts.artworks}</strong><span>artworks</span></div>
        <div><strong>{counts.artists}</strong><span>artists</span></div>
        <div><strong>{counts.categories}</strong><span>categories</span></div>
      </section>

      <section className="ab-wrap ab-story">
        <h2>Why we built ArtMart</h2>
        <p>
          Good art is often hard to find and harder to buy. Talented artists work quietly while
          buyers scroll through generic prints. We wanted a simple, friendly marketplace that
          connects the two, so that more people can own something made by a real person.
        </p>
      </section>

      <section className="ab-band">
        <div className="ab-wrap">
          <h2>What we believe</h2>
          <div className="ab-values">
            {VALUES.map((v) => (
              <article key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-wrap ab-how">
        <h2>How it works</h2>
        <ol className="ab-steps">
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ab-sell">
        <h2>Make art? Share it here.</h2>
        <p>Create an account and list your first piece in a few minutes.</p>
        <Link to="/register" className="ab-btn ab-gold">Start selling</Link>
      </section>
    </main>
  );
}