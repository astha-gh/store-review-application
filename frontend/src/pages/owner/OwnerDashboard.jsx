import { useEffect, useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import "../../styles/Table.css";
import "../../styles/OwnerDashboard.css";

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/owner/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard"));
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const arrow = (field) =>
    sortBy === field ? (order === "asc" ? " ▲" : " ▼") : "";

  const sortedRaters = data?.raters
    ? [...data.raters].sort((a, b) => {
        const valA = a[sortBy] ?? "";
        const valB = b[sortBy] ?? "";
        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  if (error)
    return (
      <>
        <Navbar />
        <div className="owner-container">
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </>
    );

  if (!data)
    return (
      <>
        <Navbar />
        <div className="owner-container">
          <p>Loading...</p>
        </div>
      </>
    );

  if (!data.store)
    return (
      <>
        <Navbar />
        <div className="owner-container">
          <p className="no-store-msg">
            No store is linked to your account yet. Please contact an admin.
          </p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="owner-container">
        <h2>Store Dashboard</h2>
        <p className="store-subtitle">{data.store.name}</p>

        <div className="avg-rating-card">
          <span>Average Rating</span>
          <strong>{data.avgRating ?? "—"}</strong>
          <small>out of 5</small>
        </div>

        <div className="raters-section">
          <h3>Users who rated your store ({data.raters.length})</h3>
          <table>
            <thead>
              <tr>
                {["name", "email", "rating", "created_at"].map((f) => (
                  <th key={f} onClick={() => handleSort(f)}>
                    {f === "created_at"
                      ? "Rated On"
                      : f.charAt(0).toUpperCase() + f.slice(1)}
                    {arrow(f)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRaters.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.rating} ★</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {sortedRaters.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    No ratings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
