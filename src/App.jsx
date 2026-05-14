import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/orders";
import Clients from "./pages/Clients";
import Catalog from "./pages/Catalog";
import Production from "./pages/Production";
import Reports from "./pages/Reports";
import MainLayout from "./Layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas — solo si hay token */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/production" element={<Production />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Rutas exclusivas de admin y superadmin */}
        <Route element={<ProtectedRoute roles={["admin", "superadmin"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
