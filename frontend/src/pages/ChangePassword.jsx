import { useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import "../styles/ChangePassword.css";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await API.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(res.data.message);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="cp-container">
        <div className="cp-card">
          <h2>Change Password</h2>
          {success && <p className="cp-success">{success}</p>}
          {error && <p className="cp-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            {[
              { label: "Current Password", name: "currentPassword" },
              { label: "New Password", name: "newPassword" },
              { label: "Confirm New Password", name: "confirmPassword" },
            ].map(({ label, name }) => (
              <div key={name} className="cp-field">
                <label>{label}</label>
                <input
                  type="password"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            <button type="submit" className="cp-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
