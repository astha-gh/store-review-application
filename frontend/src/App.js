import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Stores from "./pages/Stores";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStores from "./pages/admin/AdminStores";
import OwnerDashboard from "./pages/owner/OwnerDashboard";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/stores" element={
            <PrivateRoute roles={["user"]}><Stores /></PrivateRoute>
          } />
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute roles={["admin"]}><AdminUsers /></PrivateRoute>
          } />
          <Route path="/admin/stores" element={
            <PrivateRoute roles={["admin"]}><AdminStores /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/owner/dashboard" element={
            <PrivateRoute roles={["store_owner"]}><OwnerDashboard /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;