import { useEffect, useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import "../../styles/Dashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load stats"));
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Stores</h3>
              <p>{stats.totalStores}</p>
            </div>
            <div className="stat-card">
              <h3>Total Ratings</h3>
              <p>{stats.totalRatings}</p>
            </div>
          </div>
        ) : (
          !error && <p>Loading...</p>
        )}
      </div>
    </>
  );
}
