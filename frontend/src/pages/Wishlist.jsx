import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api("/wishlist", { token: user.token })
      .then((data) => setArtworks(data.artworks || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const removeItem = async (artworkId) => {
    try {
      const data = await api(`/wishlist/${artworkId}`, { method: "DELETE", token: user.token });
      setArtworks(data.artworks || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const moveToCart = async (artworkId) => {
    try {
      await api("/cart", { method: "POST", token: user.token, body: { artworkId, quantity: 1 } });
      const data = await api(`/wishlist/${artworkId}`, { method: "DELETE", token: user.token });
      setArtworks(data.artworks || []);
      alert("Moved to cart");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container page-box">Loading wishlist...</div>;
  if (error) return <div className="container page-box">{error}</div>;

  return (
    <div className="container page-box">
      <h2 className="page-title">My Wishlist</h2>

      {artworks.length === 0 ? (
        <div className="empty-box">
          <p>Your wishlist is empty.</p>
          <Link to="/" className="gold-btn">Browse Artworks</Link>
        </div>
      ) : (
        artworks.map((art) => (
          <div className="row-item" key={art._id}>
            <img src={art.image} alt={art.title} />
            <div className="row-info">
              <h3>{art.title}</h3>
              <div className="row-sub">{art.category}</div>
              <div className="price">₹ {art.price.toLocaleString("en-IN")}</div>
            </div>
            <button className="gold-btn" onClick={() => moveToCart(art._id)}>Move to Cart</button>
            <button className="remove-btn" onClick={() => removeItem(art._id)}>Remove</button>
          </div>
        ))
      )}
    </div>
  );
}