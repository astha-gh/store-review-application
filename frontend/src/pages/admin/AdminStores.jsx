import { useEffect, useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import "../../styles/Table.css";

const INITIAL_FORM = { name: "", email: "", address: "", owner_id: "" };

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const fetchStores = () => {
    const params = { ...filters, sortBy, order };
    API.get("/admin/stores", { params }).then((res) => setStores(res.data));
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const arrow = (field) =>
    sortBy === field ? (order === "asc" ? " ▲" : " ▼") : "";

  const validate = () => {
    const e = {};
    if (form.name.length < 20 || form.name.length > 60)
      e.name = "Name must be 20 to 60 characters";
    if (form.address.length > 400) e.address = "Address max 400 characters";
    return e;
  };

  const handleAdd = async () => {
    setServerError("");
    const e = validate();
    if (Object.keys(e).length > 0) {
      setFormErrors(e);
      return;
    }
    try {
      await API.post("/admin/stores", form);
      setShowModal(false);
      setForm(INITIAL_FORM);
      setFormErrors({});
      fetchStores();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to add store");
    }
  };

  return (
    <>
      <Navbar />
      <div className="table-container">
        <h2>Stores</h2>
        <div className="table-toolbar">
          {["name", "email", "address"].map((f) => (
            <input
              key={f}
              placeholder={`Filter by ${f}`}
              value={filters[f]}
              onChange={(e) => setFilters({ ...filters, [f]: e.target.value })}
            />
          ))}
          <button onClick={fetchStores}>Search</button>
          <button onClick={() => setShowModal(true)}>+ Add Store</button>
        </div>

        <table>
          <thead>
            <tr>
              {["name", "email", "address", "rating"].map((f) => (
                <th key={f} onClick={() => handleSort(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {arrow(f)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.rating ?? "No ratings yet"}</td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  No stores found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Store</h3>
            {serverError && (
              <p style={{ color: "red", marginBottom: "1rem" }}>
                {serverError}
              </p>
            )}
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Address", name: "address", type: "text" },
              { label: "Owner ID (optional)", name: "owner_id", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="modal-field">
                <label>{label}</label>
                <input
                  type={type}
                  value={form[name]}
                  onChange={(e) => {
                    setForm({ ...form, [name]: e.target.value });
                    setFormErrors({ ...formErrors, [name]: "" });
                  }}
                />
                {formErrors[name] && (
                  <span className="field-error">{formErrors[name]}</span>
                )}
              </div>
            ))}
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setForm(INITIAL_FORM);
                  setFormErrors({});
                  setServerError("");
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAdd}>
                Add Store
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
