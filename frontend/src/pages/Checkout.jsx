import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

const emptyAddress = { fullName: "", phone: "", address: "", city: "", state: "", pincode: "" };
const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

const PAYMENT_OPTIONS = [
  { value: "Cash on delivery", label: "Cash on delivery", sub: "You pay when your artwork arrives." },
  { value: "UPI", label: "UPI", sub: "Google Pay, PhonePe, Paytm or any UPI app." },
];

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("Cash on delivery");
  const [upiId, setUpiId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [paidWith, setPaidWith] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    api("/cart", { token: user.token })
      .then((data) => {
        const raw = Array.isArray(data) ? data : data.items || data.cart?.items || data.cartItems || [];
        setLines(
          raw
            .map((it) => ({ art: it.artwork || it.artworkId || it.product || it, qty: it.quantity || 1 }))
            .filter((l) => l.art && l.art._id)
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const total = useMemo(() => lines.reduce((s, l) => s + Number(l.art.price) * l.qty, 0), [lines]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (paymentMethod === "UPI" && !UPI_REGEX.test(upiId.trim())) {
      setError("Please enter a valid UPI ID, for example name@okaxis");
      return;
    }

    setBusy(true);
    try {
      const res = await api("/orders", {
        method: "POST",
        token: user.token,
        body: {
          items: lines.map((l) => ({ artworkId: l.art._id, quantity: l.qty, price: l.art.price })),
          shippingAddress: form,
          paymentMethod,
          upiId: paymentMethod === "UPI" ? upiId.trim() : undefined,
          totalPrice: total,
        },
      });
      setPaidWith(paymentMethod);
      setOrderId((res.order || res)._id || "placed");
    } catch (err) {
      setError(err.message || "We could not place your order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (orderId) {
    return (
      <main className="ck">
        <div className="ck-wrap ck-done">
          <h1>Thank you, your order is placed</h1>
          {orderId !== "placed" && (
            <p className="ck-id">Order number: #{orderId.slice(-8).toUpperCase()}</p>
          )}
          {paidWith === "UPI" ? (
            <p>We have saved your UPI ID. Your payment is pending and we will contact you to complete it.</p>
          ) : (
            <p>We will send your artwork to the address you gave. You pay when it arrives.</p>
          )}
          <div className="ck-row">
            {orderId !== "placed" && (
              <Link to={`/orders/${orderId}`} className="ck-btn ck-gold">Track my order</Link>
            )}
            <Link to="/explore" className="ck-btn ck-dark">Keep exploring</Link>
            <Link to="/" className="ck-btn ck-dark">Back to home</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ck">
      <div className="ck-wrap">
        <h1>Checkout</h1>

        {loading && <p className="ck-note">Loading your cart…</p>}
        {!loading && lines.length === 0 && (
          <div className="ck-card">
            <p>Your cart is empty.</p>
            <Link to="/explore" className="ck-btn ck-gold">Find something to buy</Link>
          </div>
        )}

        {lines.length > 0 && (
          <div className="ck-layout">
            <form className="ck-card" onSubmit={placeOrder} id="order-form">
              <h2>Delivery details</h2>
              <label>Full name<input required value={form.fullName} onChange={set("fullName")} autoComplete="name" /></label>
              <label>Phone number
                <input required inputMode="numeric" pattern="[0-9]{10}" title="Enter a 10 digit phone number" value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </label>
              <label>Address<textarea required rows="3" value={form.address} onChange={set("address")} autoComplete="street-address" /></label>
              <div className="ck-three">
                <label>City<input required value={form.city} onChange={set("city")} /></label>
                <label>State<input required value={form.state} onChange={set("state")} /></label>
                <label>Pincode
                  <input required inputMode="numeric" pattern="[0-9]{6}" title="Enter a 6 digit pincode" value={form.pincode} onChange={set("pincode")} />
                </label>
              </div>

              <h2>Payment</h2>
              <div className="ck-methods">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`ck-method ${paymentMethod === opt.value ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                    />
                    <span>
                      <strong>{opt.label}</strong>
                      <small>{opt.sub}</small>
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === "UPI" && (
                <label className="ck-upi">
                  UPI ID
                  <input
                    required
                    placeholder="yourname@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    autoComplete="off"
                  />
                </label>
              )}

              {error && <p className="ck-err" role="alert">{error}</p>}
            </form>

            <aside className="ck-card ck-sum">
              <h2>Your order</h2>
              {lines.map((l) => (
                <div className="ck-line" key={l.art._id}>
                  <img src={l.art.image} alt="" />
                  <div>
                    <strong>{l.art.title}</strong>
                    <span>Qty {l.qty}</span>
                  </div>
                  <b>{rupees(l.art.price * l.qty)}</b>
                </div>
              ))}
              <div className="ck-total"><span>Total</span><strong>{rupees(total)}</strong></div>
              <button className="ck-btn ck-gold" type="submit" form="order-form" disabled={busy}>
                {busy ? "Placing order…" : paymentMethod === "UPI" ? "Place order with UPI" : "Place order"}
              </button>
              <Link to="/cart" className="ck-back">Back to cart</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}