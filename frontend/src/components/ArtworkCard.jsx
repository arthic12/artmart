import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ArtworkCard({ artwork }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const image = artwork.image || (artwork.images && artwork.images[0]);
  const artist = artwork.artistName || (artwork.artist && artwork.artist.name) || "";
  const rating = Number(artwork.rating) || 0;
  const numReviews = Number(artwork.numReviews) || 0;
  const detailPath = `/artworks/${artwork._id}`;

  const addToCart = async () => {
    if (!user) return navigate("/login");
    try {
      await api("/cart", { method: "POST", token: user.token, body: { artworkId: artwork._id, quantity: 1 } });
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

  return (
    <div className="card">
      <Link to={detailPath}>
        <img src={image} alt={artwork.title} />
      </Link>
      <button className="heart" onClick={addToWishlist}>♡</button>
      {artwork.category && <div className="category-tag">{artwork.category}</div>}
      <Link to={detailPath} style={{ color: "inherit", textDecoration: "none" }}>
        <h3>{artwork.title}</h3>
      </Link>
      {artist && <div className="by">by {artist}</div>}
      <div className="rating">
        {numReviews > 0 ? `★ ${rating.toFixed(1)} (${numReviews})` : "No reviews yet"}
      </div>
      <div className="price">₹ {Number(artwork.price).toLocaleString("en-IN")}</div>
      <button className="add" onClick={addToCart}>🛒 Add to Cart</button>
    </div>
  );
}