import { useState, useEffect } from "react";
import axios from "axios";
import { getUserRol } from "../utils/auth";

const API = "https://spin-shoes-backend.onrender.com/api/admin";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const ROL_BADGE = {
  user:       { label: "Usuario",    color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  admin:      { label: "Admin",      color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  superadmin: { label: "Superadmin", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

export default function Admin() {
  const myRol = getUserRol();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Modal nuevo usuario
  const [showModal, setShowModal] = useState(false);
  const [newUser,   setNewUser]   = useState({
    nombre: "", empresa: "", telefono: "", email: "",
    ciudad: "", direccion: "", password: "", rol: "user",
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/users`, { headers: authHeader() });
      setUsers(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRolChange = async (userId, nuevoRol) => {
    try {
      await axios.put(`${API}/users/${userId}/rol`, { rol: nuevoRol }, { headers: authHeader() });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u));
    } catch (e) {
      alert(e.response?.data?.message || "Error al cambiar rol");
    }
  };

  const handleDelete = async (userId, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await axios.delete(`${API}/users/${userId}`, { headers: authHeader() });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) {
      alert(e.response?.data?.message || "Error al eliminar");
    }
  };

  const handleCreate = async () => {
    const empty = Object.entries(newUser).some(([k, v]) => k !== "empresa" && !v.trim());
    if (empty) { alert("Completa todos los campos obligatorios"); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/users`, newUser, { headers: authHeader() });
      setShowModal(false);
      setNewUser({ nombre: "", empresa: "", telefono: "", email: "", ciudad: "", direccion: "", password: "", rol: "user" });
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  };

  const rolesDisponibles = myRol === "superadmin"
    ? ["user", "admin", "superadmin"]
    : ["user", "admin"];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
      <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Cargando usuarios...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 24, color: "#ef4444" }}>{error}</div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "var(--text)" }}>
            Gestión de Usuarios
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "linear-gradient(135deg, #1A56DB, #38bdf8)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              {["Nombre", "Email", "Ciudad", "Rol", "Acciones"].map(col => (
                <th key={col} style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const badge = ROL_BADGE[u.rol] || ROL_BADGE.user;
              return (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>
                    {u.nombre}
                    {u.empresa && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>{u.empresa}</div>}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{u.ciudad || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={u.rol}
                      onChange={e => handleRolChange(u.id, e.target.value)}
                      disabled={u.rol === "superadmin" && myRol !== "superadmin"}
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.color}40`,
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "DM Sans, sans-serif",
                        outline: "none",
                      }}
                    >
                      {rolesDisponibles.map(r => (
                        <option key={r} value={r}>{ROL_BADGE[r].label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => handleDelete(u.id, u.nombre)}
                      disabled={u.rol === "superadmin" && myRol !== "superadmin"}
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "DM Sans, sans-serif",
                        opacity: (u.rol === "superadmin" && myRol !== "superadmin") ? 0.4 : 1,
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal crear usuario */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 32,
            width: "100%", maxWidth: 520,
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          }}>
            <h3 style={{ margin: "0 0 20px", color: "var(--text)", fontSize: "1.1rem", fontWeight: 700 }}>
              Crear nuevo usuario
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { name: "nombre",    label: "Nombre *",    type: "text" },
                { name: "email",     label: "Email *",     type: "email" },
                { name: "telefono",  label: "Teléfono *",  type: "text" },
                { name: "ciudad",    label: "Ciudad *",    type: "text" },
                { name: "empresa",   label: "Empresa",     type: "text" },
                { name: "direccion", label: "Dirección *", type: "text" },
                { name: "password",  label: "Contraseña *",type: "password" },
              ].map(f => (
                <div key={f.name} style={{ gridColumn: f.name === "direccion" ? "1 / -1" : "auto" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={newUser[f.name]}
                    onChange={e => setNewUser(prev => ({ ...prev, [f.name]: e.target.value }))}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: 8, padding: "8px 12px",
                      color: "var(--text)", fontSize: "0.875rem",
                      fontFamily: "DM Sans, sans-serif", outline: "none",
                    }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>
                  Rol
                </label>
                <select
                  value={newUser.rol}
                  onChange={e => setNewUser(prev => ({ ...prev, rol: e.target.value }))}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "8px 12px",
                    color: "var(--text)", fontSize: "0.875rem",
                    fontFamily: "DM Sans, sans-serif", outline: "none",
                  }}
                >
                  {rolesDisponibles.map(r => (
                    <option key={r} value={r}>{ROL_BADGE[r].label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent", border: "1px solid var(--border)",
                  color: "var(--text-muted)", borderRadius: 8,
                  padding: "9px 18px", cursor: "pointer",
                  fontSize: "0.875rem", fontFamily: "DM Sans, sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                style={{
                  background: "linear-gradient(135deg, #1A56DB, #38bdf8)",
                  color: "#fff", border: "none", borderRadius: 8,
                  padding: "9px 22px", cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "0.875rem", fontWeight: 600,
                  fontFamily: "DM Sans, sans-serif", opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Guardando..." : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
