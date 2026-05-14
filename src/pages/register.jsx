import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ADMIN_KEY = "Sanjuca20";

const FIELDS = [
  { name: "nombre",    label: "Nombre completo",   icon: "👤", type: "text",     placeholder: "Juan Pérez",          cols: 6 },
  { name: "email",     label: "Correo electrónico", icon: "✉",  type: "email",    placeholder: "juan@spinshoes.com",  cols: 6 },
  { name: "telefono",  label: "Teléfono",           icon: "📞", type: "text",     placeholder: "300 123 4567",        cols: 3 },
  { name: "ciudad",    label: "Ciudad",             icon: "📍", type: "text",     placeholder: "Bucaramanga",         cols: 3 },
  { name: "direccion", label: "Dirección",          icon: "🗺",  type: "text",     placeholder: "Calle 45 # 12-34",   cols: 6 },
  { name: "password",  label: "Contraseña",         icon: "🔒", type: "password", placeholder: "••••••••",           cols: 6 },
];

export default function Register() {
  const navigate = useNavigate();

  // Paso 1: verificar clave admin
  const [step,      setStep]      = useState("key"); // "key" | "form"
  const [adminKey,  setAdminKey]  = useState("");
  const [keyError,  setKeyError]  = useState(false);
  const [keyShake,  setKeyShake]  = useState(false);

  // Paso 2: datos del usuario
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "",
    ciudad: "", direccion: "", password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleVerifyKey = () => {
    if (adminKey === ADMIN_KEY) {
      setKeyError(false);
      setStep("form");
    } else {
      setKeyError(true);
      setKeyShake(true);
      setTimeout(() => setKeyShake(false), 600);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    const empty = Object.values(form).some(v => !v.trim());
    if (empty) { alert("Completa todos los campos ⚠️"); return; }
    setLoading(true);
    try {
      await axios.post("https://spin-shoes-backend.onrender.com/api/auth/register", form);
      alert("Cuenta creada correctamente ✅");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">

      {/* Decorative grid */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div
        className="login-card animate-fade-up"
        style={{ maxWidth: step === "key" ? 420 : 580, width: "100%", padding: "48px 40px", transition: "max-width 0.3s ease" }}
      >

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, #1A56DB, #38bdf8)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(26,86,219,0.4)"
          }}>
            👟
          </div>
          <div className="login-logo">SPIN SHOES</div>
          <div className="login-tagline">
            {step === "key" ? "Acceso exclusivo para administradores" : "Crear cuenta nueva"}
          </div>
        </div>

        {/* ── PASO 1: CLAVE DE ADMINISTRADOR ── */}
        {step === "key" && (
          <>
            {/* Info banner */}
            <div style={{
              background: "rgba(56,189,248,0.08)",
              border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              display: "flex",
              gap: 10,
              alignItems: "flex-start"
            }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>🔐</span>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, margin: 0 }}>
                Este sistema es de uso exclusivo para administradores de Spin Shoes SAS. Ingresa la clave de acceso para continuar.
              </p>
            </div>

            <label className="login-label">Clave de administrador</label>
            <div
              className="login-input-wrap"
              style={{
                marginBottom: 0,
                animation: keyShake ? "shake 0.5s ease" : "none"
              }}
            >
              <span className="login-input-icon">🛡️</span>
              <input
                type="password"
                placeholder="Ingresa la clave secreta"
                className="login-input"
                value={adminKey}
                onChange={e => { setAdminKey(e.target.value); setKeyError(false); }}
                onKeyDown={e => e.key === "Enter" && handleVerifyKey()}
                style={{ borderColor: keyError ? "rgba(239,68,68,0.6)" : undefined }}
              />
            </div>

            {/* Mensaje de error */}
            {keyError && (
              <div style={{
                marginTop: 10,
                padding: "8px 14px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                fontSize: "0.8rem",
                color: "#f87171",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                ❌ Clave incorrecta. Solo administradores pueden registrarse.
              </div>
            )}

            <button
              onClick={handleVerifyKey}
              className="login-btn"
              style={{ marginTop: 24 }}
            >
              Verificar clave →
            </button>

            <div className="login-divider"><span>¿Ya tienes cuenta?</span></div>

            <button
              onClick={() => navigate("/")}
              className="login-btn-outline"
            >
              Iniciar sesión
            </button>
          </>
        )}

        {/* ── PASO 2: FORMULARIO DE REGISTRO ── */}
        {step === "form" && (
          <>
            {/* Badge de acceso verificado */}
            <div style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 10,
              padding: "8px 14px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.8rem",
              color: "#10b981"
            }}>
              ✅ Clave verificada — completa tus datos para crear la cuenta
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {FIELDS.map((f) => (
                <div
                  key={f.name}
                  style={{ gridColumn: f.cols === 6 ? "1 / -1" : "auto" }}
                >
                  <label className="login-label">{f.label}</label>
                  <div className="login-input-wrap" style={{ marginBottom: 0 }}>
                    <span className="login-input-icon">{f.icon}</span>
                    <input
                      type={f.type}
                      name={f.name}
                      placeholder={f.placeholder}
                      className="login-input"
                      value={form[f.name]}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="login-btn"
              style={{ marginTop: 28, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta →"}
            </button>

            <div className="login-divider"><span>o</span></div>

            <button
              onClick={() => setStep("key")}
              className="login-btn-outline"
            >
              ← Volver
            </button>
          </>
        )}

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", marginTop: 28 }}>
          © 2026 SPIN SHOES SAS · Todos los derechos reservados
        </p>

      </div>

      {/* Animación shake para clave incorrecta */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>

    </div>
  );
}
