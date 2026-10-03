import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ArtworkDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    api(`/artworks/${id}`)
      .then((data) => setArtwork(data.artwork || data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!user) return navigate("/login");
    try {
      await api("/cart", {
        method: "POST",
        token: user.token,
        body: { artworkId: artwork._id, quantity },
      });
      alert("Added to cart");
    } catch (err) {
      alert(err.message);
    }
  };

  const addToWishlist = async () => {
    if (!user) return navigate("/login");
    try {
      await api(`/wishlist/${artwork._id}`, { method: "POST", token: user.token });
      alert("Added to wishlist");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="container">Loading artwork...</p>;
  if (error) return <p className="container error">{error}</p>;
  if (!artwork) return <p className="container">Artwork not found.</p>;

  const artist = artwork.artist;

  const rows = [
    ["Category", artwork.category],
    ["Medium", artwork.medium],
    ["Size", artwork.size],
  ].filter(([, value]) => value);

  return (
    <div className="container">
      <Link to="/explore" style={{ display: "inline-block", margin: "16px 0" }}>
        ← Back to Explore
      </Link>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "40px",
          alignItems: "flex-start",
          marginBottom: "40px",
        }}
      >
        <img
          src={artwork.image}
          alt={artwork.title}
          style={{
            width: "100%",
            maxWidth: "560px",
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />

        <div style={{ flex: 1, minWidth: "280px" }}>
          <p style={{ color: "#b8893f", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
            {artwork.category}
          </p>
          <h1 style={{ margin: "6px 0" }}>{artwork.title}</h1>

          {artist && (
            <p style={{ margin: "4px 0 12px" }}>
              by{" "}
              <Link to={`/artists/${artist._id}`} style={{ fontWeight: 600 }}>
                {artist.name}
              </Link>
            </p>
          )}

          <p style={{ margin: "0 0 12px" }}>
            ★ {artwork.rating} ({artwork.numReviews} reviews)
          </p>

          <h2 style={{ margin: "0 0 16px" }}>₹ {Number(artwork.price).toLocaleString("en-IN")}</h2>

          {artwork.description && (
            <p style={{ lineHeight: 1.6, maxWidth: "520px" }}>{artwork.description}</p>
          )}

          <table style={{ borderCollapse: "collapse", marginTop: "16px" }}>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: "6px 24px 6px 0", color: "#777" }}>{label}</td>
                  <td style={{ padding: "6px 0", fontWeight: 600 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quantity + buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
              >
                −
              </button>
              <span style={{ minWidth: "28px", textAlign: "center" }}>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{ padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
              >
                +
              </button>
            </div>

            <button
              className="add"
              onClick={addToCart}
              style={{ width: "auto", padding: "12px 28px" }}
            >
              🛒 Add to Cart
            </button>

            <button
              onClick={addToWishlist}
              style={{
                padding: "12px 20px",
                background: "#fff",
                border: "1px solid #b8893f",
                color: "#b8893f",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ♡ Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}