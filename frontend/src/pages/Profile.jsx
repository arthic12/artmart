import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Not logged in -> go to login
  if (!user) return <Navigate to="/login" replace />;

  const initial = (user.name || "?").charAt(0).toUpperCase();
  const role = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Customer";
  const canSell = user.role === "artist" || user.role === "admin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const details = [
    ["Full name", user.name],
    ["Email", user.email],
    ["Account type", role],
    ["Phone", user.phone],
    ["Address", user.address],
  ].filter(([, value]) => value);

  const card = {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "14px",
    padding: "28px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
  };

  return (
    <div className="container" style={{ padding: "32px 0 56px" }}>
      <h2 style={{ marginBottom: "20px" }}>My Profile</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "flex-start" }}>
        {/* Left: avatar card */}
        <div style={{ ...card, flex: "0 0 280px", textAlign: "center" }}>
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              background: "#b8893f",
              color: "#fff",
              fontSize: "3rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            {initial}
          </div>
          <h3 style={{ margin: "0 0 4px" }}>{user.name}</h3>
          <span
            style={{
              display: "inline-block",
              background: "#f8f0e5",
              color: "#b8893f",
              padding: "4px 14px",
              borderRadius: "999px",
              fontSize: "0.85rem",
            }}
          >
            {role}
          </span>

          <button
            onClick={handleLogout}
            style={{
              display: "block",
              width: "100%",
              marginTop: "24px",
              padding: "12px",
              background: "#fff",
              border: "1px solid #b8893f",
              color: "#b8893f",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Logout
          </button>
        </div>

        {/* Right: details + shortcuts */}
        <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Account Details</h3>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tbody>
                {details.map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: "1px solid #f1f1f1" }}>
                    <td style={{ padding: "12px 24px 12px 0", color: "#777", width: "160px" }}>{label}</td>
                    <td style={{ padding: "12px 0", fontWeight: 600 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Quick Links</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link to="/wishlist" className="btn">♡ My Wishlist</Link>
              <Link to="/cart" className="btn">🛒 My Cart</Link>
              <Link to="/explore" className="btn">Browse Art</Link>
              <Link to="/orders" className="btn">📦 My Orders</Link>
              {canSell && <Link to="/sell" className="btn">🎨 Sell Artwork</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
