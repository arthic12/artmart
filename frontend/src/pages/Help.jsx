import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import "./Help.css";

/* Change this to your real support address */
const SUPPORT_EMAIL = "support@artmart.com";

const TABS = [
  { key: "contact", label: "Contact Us" },
  { key: "faqs", label: "FAQs" },
  { key: "shipping", label: "Shipping Policy" },
  { key: "returns", label: "Return Policy" },
];

const FAQS = [
  ["How do I buy an artwork?", "Open any artwork, choose a quantity and select Add to Cart. Then open your cart and check out."],
  ["Is every artwork an original?", "Each listing says whether it is an original or a print. Check the title and description on the artwork page."],
  ["Can I save artworks for later?", "Yes. Select the heart on any artwork to add it to your wishlist, and find it again from the heart icon at the top."],
  ["How do I sell my art?", "Create an account, then go to Sell your art and fill in the listing form. Your piece appears on Explore once it is listed."],
  ["Who do I contact about an order?", "Use the Contact Us tab and include the name of the artwork so we can find your order quickly."],
];

const SHIPPING = [
  ["Packing", "Every artwork is wrapped and packed to protect it in transit."],
  ["Dispatch", "Orders are sent from the artist or from our partner. You will see the status in your account."],
  ["Delivery", "Delivery time depends on your location and the size of the piece. Large works and sculptures can take longer."],
  ["Damage in transit", "If your artwork arrives damaged, contact us with photos as soon as you can and we will help put it right."],
];

const RETURNS = [
  ["Changed your mind", "Tell us soon after delivery. Artworks must be unused and in their original packaging."],
  ["Wrong or damaged item", "If the piece is not what you ordered or arrives damaged, we will arrange a replacement or refund."],
  ["Refunds", "Approved refunds go back to your original payment method."],
  ["Custom or commissioned work", "Pieces made specially for you cannot normally be returned, unless they arrive damaged."],
];

function Contact() {
  const [form, setForm] = useState({ name: "", subject: "", message: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const send = (e) => {
    e.preventDefault();
    const body = `${form.message}\n\n${form.name}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <h2>Contact us</h2>
      <p>Questions about an order, an artwork or selling? Write to us at <strong>{SUPPORT_EMAIL}</strong> or use the form, which opens your email app.</p>
      <form className="hp-form" onSubmit={send}>
        <label>Your name<input required value={form.name} onChange={set("name")} /></label>
        <label>Subject<input required value={form.subject} onChange={set("subject")} /></label>
        <label>Message<textarea required rows="5" value={form.message} onChange={set("message")} /></label>
        <button type="submit">Send message</button>
      </form>
    </>
  );
}

const Rows = ({ title, rows }) => (
  <>
    <h2>{title}</h2>
    {rows.map(([h, t]) => (
      <div className="hp-row" key={h}><h3>{h}</h3><p>{t}</p></div>
    ))}
  </>
);

export default function Help() {
  const { topic } = useParams();
  if (!TABS.some((t) => t.key === topic)) return <Navigate to="/help/contact" replace />;

  return (
    <main className="hp">
      <section className="hp-top">
        <div className="hp-wrap">
          <h1>Help centre</h1>
          <p>Answers about orders, shipping and returns.</p>
        </div>
      </section>

      <div className="hp-wrap hp-layout">
        <nav className="hp-tabs" aria-label="Help topics">
          {TABS.map((t) => (
            <Link key={t.key} to={`/help/${t.key}`} className={t.key === topic ? "on" : ""}>{t.label}</Link>
          ))}
        </nav>

        <section className="hp-card">
          {topic === "contact" && <Contact />}
          {topic === "faqs" && (
            <>
              <h2>Frequently asked questions</h2>
              {FAQS.map(([q, a]) => (
                <details key={q}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </>
          )}
          {topic === "shipping" && <Rows title="Shipping policy" rows={SHIPPING} />}
          {topic === "returns" && <Rows title="Return policy" rows={RETURNS} />}
        </section>
      </div>
    </main>
  );
}