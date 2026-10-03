import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api("/cart", { token: user.token })
      .then(setCart)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const changeQty = async (artworkId, quantity) => {
    if (quantity < 1) return;
    try {
      setCart(await api(`/cart/${artworkId}`, { method: "PUT", token: user.token, body: { quantity } }));
    } catch (err) {
      alert(err.message);
    }
  };

  const removeItem = async (artworkId) => {
    try {
      setCart(await api(`/cart/${artworkId}`, { method: "DELETE", token: user.token }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container page-box">Loading cart...</div>;
  if (error) return <div className="container page-box">{error}</div>;

  const items = cart?.items || [];

  return (
    <div className="container page-box">
      <h2 className="page-title">My Cart</h2>

      {items.length === 0 ? (
        <div className="empty-box">
          <p>Your cart is empty.</p>
          <Link to="/" className="gold-btn">Browse Artworks</Link>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <div className="row-item" key={item.artwork._id}>
              <img src={item.artwork.image} alt={item.artwork.title} />
              <div className="row-info">
                <h3>{item.artwork.title}</h3>
                <div className="row-sub">{item.artwork.category}</div>
                <div className="price">₹ {item.artwork.price.toLocaleString("en-IN")}</div>
              </div>
              <div className="qty">
                <button onClick={() => changeQty(item.artwork._id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => changeQty(item.artwork._id, item.quantity + 1)}>+</button>
              </div>
              <div className="row-total">
                ₹ {(item.artwork.price * item.quantity).toLocaleString("en-IN")}
              </div>
              <button className="remove-btn" onClick={() => removeItem(item.artwork._id)}>Remove</button>
            </div>
          ))}

          <div className="cart-total">
            <span>Total</span>
            <strong>₹ {Number(cart.totalPrice).toLocaleString("en-IN")}</strong>
          </div>

          <Link
            to="/checkout"
            style={{
              display: "inline-block",
              marginTop: 16,
              padding: "14px 32px",
              background: "#c8923f",
              color: "#fff",
              borderRadius: 999,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Proceed to checkout
          </Link>
        </>
      )}
    </div>
  );
}