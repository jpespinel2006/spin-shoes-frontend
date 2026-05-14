import { useEffect, useState, useRef } from "react";
import axios from "axios";

const COLORES = ["negro", "café", "azul", "blanco", "rojo", "verde"];

const COLOR_DOT = {
  negro:  "#1a1a1a",
  café:   "#6b3f1e",
  azul:   "#1A56DB",
  blanco: "#e2e8f0",
  rojo:   "#dc2626",
  verde:  "#16a34a",
};

const FORM_VACIO = {
  referencia: "", descripcion: "", precio: "",
};

function parseImagenes(raw) {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return { default: raw }; }
}

export default function Catalog() {
  const [products,      setProducts]      = useState([]);
  const [form,          setForm]          = useState(FORM_VACIO);
  const [editingId,     setEditingId]     = useState(null);
  const [colorActivo,   setColorActivo]   = useState("negro");
  const [imagenesPrev,  setImagenesPrev]  = useState({}); // { color: objectURL } solo para preview local
  const [imagenesFiles, setImagenesFiles] = useState({}); // { color: File }
  const [uploading,     setUploading]     = useState(false);
  const [previewCard,   setPreviewCard]   = useState({}); // { productId: color }

  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://spin-shoes-backend.onrender.com/api/catalog");
      setProducts(res.data);
    } catch (error) {
      console.error("❌ Error al cargar catálogo:", error);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Cuando el usuario elige un archivo para el color activo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagenesPrev(prev  => ({ ...prev,  [colorActivo]: url  }));
    setImagenesFiles(prev => ({ ...prev, [colorActivo]: file }));
    e.target.value = "";
  };

  const resetForm = () => {
    setForm(FORM_VACIO);
    setEditingId(null);
    setColorActivo("negro");
    setImagenesPrev({});
    setImagenesFiles({});
  };

  // Guardar referencia y luego subir todas las imágenes seleccionadas
  const guardar = async () => {
    if (!form.referencia || !form.precio) {
      alert("La referencia y el precio son obligatorios");
      return;
    }
    setUploading(true);
    try {
      let productId = editingId;

      if (editingId) {
        await axios.put(`https://spin-shoes-backend.onrender.com/api/catalog/${editingId}`, form);
      } else {
        const res = await axios.post("https://spin-shoes-backend.onrender.com/api/catalog", {
          ...form,
        });
        productId = res.data.product.id;
      }

      // Subir cada imagen que el usuario seleccionó
      for (const [color, file] of Object.entries(imagenesFiles)) {
        const fd = new FormData();
        fd.append("imagen", file);
        await axios.post(
          `https://spin-shoes-backend.onrender.com/api/catalog/${productId}/imagen?color=${color}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      referencia:  p.referencia,
      descripcion: p.descripcion || "",
      precio:      p.precio,
    });
    setColorActivo("negro");
    setImagenesPrev({});
    setImagenesFiles({});
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta referencia?")) return;
    await axios.delete(`https://spin-shoes-backend.onrender.com/api/catalog/${id}`);
    fetchProducts();
  };

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title">Catálogo de Referencias</div>
        <div className="page-subtitle">Gestiona referencias, precios e imágenes por color</div>
      </div>

      {/* ── FORMULARIO ── */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <div className="section-title" style={{ marginBottom: 20 }}>
          {editingId ? "✏️ Editando referencia" : "➕ Nueva referencia"}
        </div>

        {/* Datos básicos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Código referencia *
            </label>
            <input
              name="referencia" placeholder="Ej: 3205"
              value={form.referencia} onChange={handleChange}
              className="input-pro"
            />
          </div>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Precio *
            </label>
            <input
              name="precio" type="number" placeholder="Ej: 85000"
              value={form.precio} onChange={handleChange}
              className="input-pro"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Descripción
            </label>
            <input
              name="descripcion" placeholder="Ej: Zapato de cuero industrial punta reforzada"
              value={form.descripcion} onChange={handleChange}
              className="input-pro"
            />
          </div>
        </div>

        {/* ── SECCIÓN DE IMÁGENES POR COLOR ── */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Imágenes por color
          </div>

          {/* Selector de color */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {COLORES.map(c => {
              const tieneImagen = !!imagenesPrev[c];
              return (
                <button
                  key={c}
                  onClick={() => setColorActivo(c)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "7px 16px", borderRadius: 99, cursor: "pointer",
                    border: colorActivo === c ? "2px solid var(--blue-600)" : "1.5px solid var(--border)",
                    background: colorActivo === c ? "rgba(26,86,219,0.08)" : "var(--card)",
                    fontSize: "0.82rem",
                    fontWeight: colorActivo === c ? 700 : 400,
                    color: colorActivo === c ? "var(--blue-600)" : "var(--text-secondary)",
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  <div style={{
                    width: 13, height: 13, borderRadius: "50%",
                    background: COLOR_DOT[c] || "#888",
                    border: "1.5px solid rgba(0,0,0,0.12)",
                    flexShrink: 0,
                  }} />
                  {c}
                  {tieneImagen && (
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#10b981",
                      position: "absolute", top: 4, right: 4,
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview + botón subir */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

            {/* Preview del color activo */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 120, height: 120, borderRadius: 12,
                border: "2px dashed var(--border)",
                background: imagenesPrev[colorActivo] ? "transparent" : "var(--card)",
                overflow: "hidden", cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.15s",
              }}
              title={`Haz clic para subir imagen del color ${colorActivo}`}
            >
              {imagenesPrev[colorActivo] ? (
                <img
                  src={imagenesPrev[colorActivo]}
                  alt={colorActivo}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.78rem", padding: 8 }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>📷</div>
                  Clic para agregar imagen
                </div>
              )}
            </div>

            {/* Info y botón */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                Color seleccionado: <span style={{ color: "var(--blue-600)" }}>{colorActivo}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
                Haz clic en la imagen o en el botón para seleccionar una foto desde tu computador. Puedes agregar una imagen diferente para cada color.
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 16px" }}
              >
                📁 Seleccionar imagen para "{colorActivo}"
              </button>

              {/* Resumen de colores con imagen */}
              {Object.keys(imagenesPrev).length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.keys(imagenesPrev).map(c => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 99, padding: "3px 10px", fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLOR_DOT[c] || "#888" }} />
                      {c} ✓
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={guardar}
            disabled={uploading}
            className={editingId ? "btn-edit" : "btn-primary"}
            style={{ padding: "10px 28px", opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? "Guardando..." : editingId ? "💾 Guardar cambios" : "➕ Agregar referencia"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="btn-secondary">✕ Cancelar</button>
          )}
        </div>
      </div>

      {/* ── GRILLA DE PRODUCTOS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {products.length > 0 ? products.map(p => {
          const imagenes = parseImagenes(p.imagen_url);
          const coloresDisponibles = Object.keys(imagenes);
          const colorSel = previewCard[p.id] || coloresDisponibles[0] || null;
          const imagenActiva = colorSel ? imagenes[colorSel] : null;

          return (
            <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>

              {/* Imagen */}
              <div style={{ position: "relative", height: 180, background: "#f1f5f9", flexShrink: 0 }}>
                {imagenActiva ? (
                  <img src={imagenActiva} alt={p.referencia} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                    👟
                  </div>
                )}
                <div style={{
                  position: "absolute", top: 10, left: 10,
                  background: "rgba(10,22,40,0.75)", backdropFilter: "blur(6px)",
                  color: "#fff", padding: "4px 10px", borderRadius: 99,
                  fontSize: "0.72rem", fontWeight: 700, fontFamily: "Syne, sans-serif",
                  letterSpacing: "0.06em"
                }}>
                  {p.referencia}
                </div>
              </div>

              {/* Selector de color en card */}
              {coloresDisponibles.length > 0 && (
                <div style={{ display: "flex", gap: 6, padding: "12px 16px 4px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginRight: 4 }}>Color:</span>
                  {coloresDisponibles.map(c => (
                    <button
                      key={c}
                      onClick={() => setPreviewCard(prev => ({ ...prev, [p.id]: c }))}
                      title={c}
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: COLOR_DOT[c] || "#888",
                        border: colorSel === c ? "2.5px solid var(--blue-600)" : "2px solid rgba(0,0,0,0.1)",
                        cursor: "pointer",
                        transform: colorSel === c ? "scale(1.25)" : "scale(1)",
                        transition: "transform 0.15s",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Info */}
              <div style={{ padding: "10px 16px 4px", flex: 1 }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>
                  {p.descripcion || "Sin descripción"}
                </div>
                {colorSel && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>
                    Mostrando: <span style={{ fontWeight: 600, color: "var(--blue-600)" }}>{colorSel}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>
                    ${Number(p.precio).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: "flex", gap: 8, padding: "12px 16px 16px" }}>
                <button onClick={() => startEdit(p)} className="btn-edit" style={{ flex: 1 }}>✏️ Editar</button>
                <button onClick={() => eliminar(p.id)} className="btn-danger" style={{ flex: 1 }}>🗑️ Eliminar</button>
              </div>

            </div>
          );
        }) : (
          <div style={{
            gridColumn: "1 / -1", textAlign: "center", padding: "64px 0",
            color: "var(--text-muted)", background: "var(--card)",
            borderRadius: "var(--radius-lg)", border: "1px solid var(--border)"
          }}>
            No hay referencias aún. ¡Agrega la primera!
          </div>
        )}
      </div>

    </div>
  );
}
