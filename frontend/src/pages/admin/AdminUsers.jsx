import { useEffect, useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";
import "../../styles/Table.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  address: "",
  role: "user",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const fetchUsers = () => {
    const params = { ...filters, sortBy, order };
    API.get("/admin/users", { params }).then((res) => setUsers(res.data));
  };

  useEffect(() => {
    fetchUsers();
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
    const pwReg = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!pwReg.test(form.password))
      e.password = "8 to 16 chars, one uppercase, one special character";
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
      await API.post("/admin/users", form);
      setShowModal(false);
      setForm(INITIAL_FORM);
      setFormErrors({});
      fetchUsers();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to add user");
    }
  };

  return (
    <>
      <Navbar />
      <div className="table-container">
        <h2>Users</h2>
        <div className="table-toolbar">
          {["name", "email", "address"].map((f) => (
            <input
              key={f}
              placeholder={`Filter by ${f}`}
              value={filters[f]}
              onChange={(e) => setFilters({ ...filters, [f]: e.target.value })}
            />
          ))}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
          </select>
          <button onClick={fetchUsers}>Search</button>
          <button onClick={() => setShowModal(true)}>+ Add User</button>
        </div>

        <table>
          <thead>
            <tr>
              {["name", "email", "address", "role"].map((f) => (
                <th key={f} onClick={() => handleSort(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {arrow(f)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New User</h3>
            {serverError && (
              <p style={{ color: "red", marginBottom: "1rem" }}>
                {serverError}
              </p>
            )}
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Password", name: "password", type: "password" },
              { label: "Address", name: "address", type: "text" },
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
            <div className="modal-field">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
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
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
