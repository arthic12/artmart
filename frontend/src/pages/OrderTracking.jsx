import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const STEPS = [
  { key: "Pending", label: "Order placed", sub: "We have received your order." },
  { key: "Confirmed", label: "Confirmed", sub: "The artist is preparing your artwork." },
  { key: "Shipped", label: "Shipped", sub: "Your artwork is on its way." },
  { key: "Delivered", label: "Delivered", sub: "Your artwork has arrived." },
];

export default function OrderTracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return navigate("/login");
    api(`/orders/${id}`, { token: user.token })
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const cancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setBusy(true);
    try {
      setOrder(await api(`/orders/${id}/cancel`, { method: "PUT", token: user.token }));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="od"><div className="od-wrap"><p className="od-note">Loading…</p></div></main>;
  if (error) return <main className="od"><div className="od-wrap"><p className="od-err">{error}</p><Link to="/orders" className="od-btn">Back to orders</Link></div></main>;

  const cancelled = order.status === "Cancelled";
  const current = STEPS.findIndex((s) => s.key === order.status);
  const a = order.shippingAddress;

  return (
    <main className="od">
      <div className="od-wrap">
        <Link to="/orders" className="od-back">← Back to my orders</Link>
        <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
        <p className="od-note">Placed on {fmtDate(order.createdAt)}</p>

        <div className="od-card">
          <h2>Tracking</h2>
          {cancelled ? (
            <p className="od-cancelled">This order was cancelled.</p>
          ) : (
            <ol className="od-steps">
              {STEPS.map((s, i) => (
                <li key={s.key} className={i < current ? "done" : i === current ? "now" : ""}>
                  <span className="od-dot">{i <= current ? "✓" : ""}</span>
                  <div>
                    <strong>{s.label}</strong>
                    <small>{s.sub}</small>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {["Pending", "Confirmed"].includes(order.status) && (
            <button className="od-btn od-outline" onClick={cancel} disabled={busy}>
              {busy ? "Cancelling…" : "Cancel order"}
            </button>
          )}
        </div>

        <div className="od-grid">
          <div className="od-card">
            <h2>Items</h2>
            {order.items.map((it, i) => (
              <div className="od-item" key={i}>
                <img src={it.image} alt="" />
                <div>
                  <strong>{it.title}</strong>
                  <span>Qty {it.quantity} · {rupees(it.price)}</span>
                </div>
                <b>{rupees(it.price * it.quantity)}</b>
              </div>
            ))}
            <div className="od-total"><span>Total</span><strong>{rupees(order.totalAmount)}</strong></div>
          </div>

          <div className="od-card">
            <h2>Delivery address</h2>
            <p className="od-addr">
              <strong>{a.fullName}</strong><br />
              {a.address}<br />
              {a.city}, {a.state} {a.pincode}<br />
              Phone: {a.phone}
            </p>
            <h2>Payment</h2>
            <p className="od-addr">
              {order.paymentMethod}
              {order.paymentMethod === "UPI" && order.upiId ? ` (${order.upiId})` : ""}
              <br />
              Status: {order.paymentStatus === "paid" ? "Paid" : "Pending"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}