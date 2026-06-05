import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import "../styles/Stores.css";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star ${star <= (hovered || value) ? "filled" : ""}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StoreCard({ store, onRated }) {
  const [selected, setSelected] = useState(store.userRating || 0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) {
      setStatus("error:Please select a rating");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      await API.post(`/stores/${store.id}/rate`, { rating: selected });
      setStatus("success:Rating submitted!");
      onRated();
    } catch (err) {
      setStatus("error:" + (err.response?.data?.message || "Failed to submit"));
    } finally {
      setLoading(false);
    }
  };

  const [type, message] = status.split(":");

  return (
    <div className="store-card">
      <h3>{store.name}</h3>
      <p>{store.address}</p>

      <div className="store-rating-info">
        <span>
          Overall Rating:{" "}
          <strong>{store.overallRating ?? "No ratings yet"}</strong>
        </span>
        <span>
          Your Rating:{" "}
          <strong>
            {store.userRating ? `${store.userRating} ★` : "Not rated yet"}
          </strong>
        </span>
      </div>

      <div className="rating-section">
        <StarPicker value={selected} onChange={setSelected} />
        <button
          className="submit-rating-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {store.userRating ? "Update Rating" : "Submit Rating"}
        </button>
        {status && (
          <span
            className={type === "success" ? "rating-success" : "rating-error"}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", address: "" });

  const fetchStores = () => {
    API.get("/stores", { params: filters }).then((res) => setStores(res.data));
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <>
      <Navbar />
      <div className="stores-container">
        <h2>All Stores</h2>
        <div className="search-bar">
          <input
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            placeholder="Search by address"
            value={filters.address}
            onChange={(e) =>
              setFilters({ ...filters, address: e.target.value })
            }
          />
          <button onClick={fetchStores}>Search</button>
        </div>

        {stores.length === 0 ? (
          <p className="no-stores">No stores found.</p>
        ) : (
          <div className="stores-grid">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} onRated={fetchStores} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
