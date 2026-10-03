import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import ArtworkCard from "../components/ArtworkCard";

export default function ArtistDetail() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Artist details (optional - the page still works if this fails)
    api(`/artists/${id}`)
      .then((data) => setArtist(data.artist || data))
      .catch(() => {});

    // Artworks by this artist
    api(`/artworks?artist=${id}`)
      .then((data) => setArtworks(Array.isArray(data) ? data : data.artworks || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // If the artist details could not be loaded, use the name from the first artwork
  const name = artist?.name || artworks[0]?.artist?.name || "Artist";
  const photo = artist?.profileImage || artworks[0]?.artist?.profileImage;

  return (
    <div className="container">
      <Link to="/artists" style={{ display: "inline-block", margin: "16px 0" }}>
        ← Back to Artists
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
        {photo && (
          <img
            src={photo}
            alt={name}
            style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <div>
          <h2 style={{ margin: 0 }}>{name}</h2>
          {artist?.specialization && <p style={{ margin: "4px 0" }}>{artist.specialization}</p>}
          {artist?.location && <p style={{ margin: "4px 0", color: "#777" }}>{artist.location}</p>}
          {artist?.bio && <p style={{ margin: "8px 0 0", maxWidth: "600px" }}>{artist.bio}</p>}
        </div>
      </div>

      <h3>Artworks by {name}</h3>

      {loading && <p>Loading artworks...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && artworks.length === 0 && (
        <p>This artist has no artworks listed yet.</p>
      )}

      <div className="grid">
        {artworks.map((a) => (
          <ArtworkCard key={a._id} artwork={a} />
        ))}
      </div>
    </div>
  );
}