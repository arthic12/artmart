import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    api("/orders/my", { token: user.token })
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  return (
    <main className="od">
      <div className="od-wrap">
        <h1>My Orders</h1>

        {loading && <p className="od-note">Loading your orders…</p>}
        {error && <p className="od-err">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="od-card od-empty">
            <p>You have not placed any orders yet.</p>
            <Link to="/explore" className="od-btn">Browse Art</Link>
          </div>
        )}

        {orders.map((o) => (
          <div className="od-card" key={o._id}>
            <div className="od-head">
              <div>
                <span className="od-label">Order placed</span>
                <strong>{fmtDate(o.createdAt)}</strong>
              </div>
              <div>
                <span className="od-label">Total</span>
                <strong>{rupees(o.totalAmount)}</strong>
              </div>
              <div>
                <span className="od-label">Order ID</span>
                <strong>#{o._id.slice(-8).toUpperCase()}</strong>
              </div>
              <span className={`od-badge od-${o.status}`}>{o.status}</span>
            </div>

            {o.items.map((it, i) => (
              <div className="od-item" key={i}>
                <img src={it.image} alt="" />
                <div>
                  <strong>{it.title}</strong>
                  <span>Qty {it.quantity} · {rupees(it.price)}</span>
                </div>
              </div>
            ))}

            <Link to={`/orders/${o._id}`} className="od-btn">Track order</Link>
          </div>
        ))}
      </div>
    </main>
  );
}