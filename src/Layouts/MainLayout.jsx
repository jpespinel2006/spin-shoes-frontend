import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaChartBar, FaShoppingCart, FaBox,
  FaUsers, FaFileAlt, FaSignOutAlt, FaIndustry, FaUserShield
} from "react-icons/fa";
import axios from "axios";
import ChatAI from "../components/ChatAI";
import { hasRol } from "../utils/auth";

const BASE_NAV = [
  { path: "/dashboard",  label: "Dashboard",   icon: <FaChartBar /> },
  { path: "/orders",     label: "Pedidos",      icon: <FaShoppingCart /> },
  { path: "/catalog",    label: "Catálogo",     icon: <FaBox /> },
  { path: "/production", label: "Producción",   icon: <FaIndustry /> },
  { path: "/clients",    label: "Clientes",     icon: <FaUsers /> },
  { path: "/reports",    label: "Reportes",     icon: <FaFileAlt /> },
];

const ADMIN_NAV = { path: "/admin", label: "Usuarios", icon: <FaUserShield /> };

const PAGE_TITLES = {
  "/dashboard":  "Dashboard",
  "/orders":     "Gestión de Pedidos",
  "/catalog":    "Catálogo de Referencias",
  "/production": "Control de Producción",
  "/clients":    "Gestión de Clientes",
  "/reports":    "Reportes",
  "/admin":      "Gestión de Usuarios",
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const current  = location.pathname;

  const isAdmin = hasRol("admin", "superadmin");
  const NAV_ITEMS = isAdmin ? [...BASE_NAV, ADMIN_NAV] : BASE_NAV;

  const [reindexState, setReindexState] = useState("idle"); // idle | loading | success | error

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleReindex = async () => {
    setReindexState("loading");
    try {
      const res = await axios.post("http://127.0.0.1:8000/admin/reindex");
      if (res.data.ok) {
        setReindexState("success");
        setTimeout(() => setReindexState("idle"), 3000);
      } else {
        setReindexState("error");
        setTimeout(() => setReindexState("idle"), 3000);
      }
    } catch {
      setReindexState("error");
      setTimeout(() => setReindexState("idle"), 3000);
    }
  };

  const reindexLabel = {
    idle:    "🔄 Actualizar IA",
    loading: "Actualizando...",
    success: "✅ IA Actualizada",
    error:   "❌ Error",
  }[reindexState];

  const reindexStyle = {
    idle: {
      background: "rgba(255,255,255,0.07)",
      color: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(255,255,255,0.12)",
    },
    loading: {
      background: "rgba(56,189,248,0.15)",
      color: "#38bdf8",
      border: "1px solid rgba(56,189,248,0.25)",
    },
    success: {
      background: "rgba(16,185,129,0.15)",
      color: "#10b981",
      border: "1px solid rgba(16,185,129,0.25)",
    },
    error: {
      background: "rgba(239,68,68,0.15)",
      color: "#ef4444",
      border: "1px solid rgba(239,68,68,0.25)",
    },
  }[reindexState];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--surface)" }}>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">

        {/* Logo
            Para usar tu propio logo reemplaza el emoji 👟 con:
            <img src="/tu-logo.png" alt="Logo" style={{ width: 36, height: 36, objectFit: "contain" }} />
            El archivo debe estar en project/frontend/public/
        */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">👟</div>
          <span>SPIN SHOES</span>
        </div>

        <div className="sidebar-label">Menú principal</div>

        <nav style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${current === item.path ? "active" : ""}`}
            >
              <div className="nav-icon">{item.icon}</div>
              {item.label}
            </div>
          ))}
        </nav>

        {/* Botón Actualizar IA en sidebar */}
        <div style={{ padding: "0 0 12px" }}>
          <button
            onClick={handleReindex}
            disabled={reindexState === "loading"}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              cursor: reindexState === "loading" ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
              fontFamily: "DM Sans, sans-serif",
              transition: "all 0.2s",
              textAlign: "center",
              ...reindexStyle,
            }}
          >
            {reindexLabel}
          </button>
        </div>

        <div className="nav-logout">
          <div
            onClick={handleLogout}
            className="nav-item"
            style={{ color: "rgba(239,68,68,0.8)" }}
          >
            <div
              className="nav-icon"
              style={{ color: "rgba(239,68,68,0.8)", background: "rgba(239,68,68,0.08)" }}
            >
              <FaSignOutAlt />
            </div>
            Cerrar sesión
          </div>
        </div>

      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        <header className="topbar">
          <div className="topbar-title">
            {PAGE_TITLES[current] || "Spin Shoes"}
          </div>
          <div className="topbar-badge">
            <div className="badge-ai">IA Activa · LLaMA 3</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          <Outlet />
        </main>

      </div>

      {/* ── CHAT IA GLOBAL ── */}
      <ChatAI />

    </div>
  );
}
