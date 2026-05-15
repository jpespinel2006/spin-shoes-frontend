import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [usuario,  setUsuario]  = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!usuario.trim() || !password.trim()) {
      alert("Completa todos los campos ⚠️");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("https://spin-shoes-backend.onrender.com/api/auth/login", {
        email:    usuario.trim(),
        password: password.trim(),
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      alert("Credenciales incorrectas ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="login-bg">

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

      <div className="login-card animate-fade-up">

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
          <div className="login-tagline">Sistema de Gestión de Pedidos</div>
        </div>

        <label className="login-label">Correo electrónico</label>
        <div className="login-input-wrap">
          <span className="login-input-icon">✉</span>
          <input
            type="email"
            placeholder="usuario@spinshoes.com"
            className="login-input"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <label className="login-label">Contraseña</label>
        <div className="login-input-wrap">
          <span className="login-input-icon">🔒</span>
          <input
            type="password"
            placeholder="••••••••"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-btn"
          style={{ marginTop: 24, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Ingresando..." : "Iniciar Sesión →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", marginTop: 28 }}>
          © 2026 SPIN SHOES SAS · Todos los derechos reservados
        </p>

      </div>
    </div>
  );
}
