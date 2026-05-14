import { useEffect, useState } from "react";
import axios from "axios";

const TALLAS = [37, 38, 39, 40, 41, 42, 43, 44];
const tallasVacias = () => TALLAS.reduce((acc, t) => ({ ...acc, [t]: "" }), {});

const COLOR_DOT = {
  negro:  "#1a1a1a",
  café:   "#6b3f1e",
  azul:   "#1A56DB",
  blanco: "#e2e8f0",
  rojo:   "#dc2626",
  verde:  "#16a34a",
};

function parseImagenes(raw) {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export default function Orders() {
  const [orders,   setOrders]   = useState([]);
  const [clients,  setClients]  = useState([]);
  const [catalog,  setCatalog]  = useState([]);

  // Formulario
  const [clienteId,    setClienteId]    = useState("");
  const [productoId,   setProductoId]   = useState("");
  const [colorElegido, setColorElegido] = useState("");
  const [tallas,       setTallas]       = useState(tallasVacias());
  const [editingId,    setEditingId]    = useState(null);

  const colores = ["café", "negro", "azul"];
  const suelas  = ["eva", "pvc", "caucho"];
  const [custom, setCustom] = useState({ color: "", suela: "", nota: "" });

  // Producto seleccionado del catálogo
  const productoSeleccionado = catalog.find(p => String(p.id) === String(productoId));
  const imagenesProducto     = parseImagenes(productoSeleccionado?.imagen_url);
  const coloresDisponibles   = Object.keys(imagenesProducto);

  const totalCantidad = Object.values(tallas).reduce((s, v) => s + (parseInt(v) || 0), 0);

  const fetchAll = async () => {
    try {
      const [ordRes, cliRes, catRes] = await Promise.all([
        axios.get("https://spin-shoes-backend.onrender.com/api/orders"),
        axios.get("https://spin-shoes-backend.onrender.com/api/clients"),
        axios.get("https://spin-shoes-backend.onrender.com/api/catalog"),
      ]);
      setOrders(ordRes.data);
      setClients(cliRes.data);
      setCatalog(catRes.data);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Cuando cambia el producto, resetear color elegido
  useEffect(() => {
    setColorElegido("");
  }, [productoId]);

  const resetForm = () => {
    setClienteId("");
    setProductoId("");
    setColorElegido("");
    setTallas(tallasVacias());
    setCustom({ color: "", suela: "", nota: "" });
    setEditingId(null);
  };

  const createOrder = async () => {
    if (!clienteId || !productoId || totalCantidad === 0) {
      alert("Selecciona cliente, referencia y agrega al menos una talla ⚠️");
      return;
    }
    const cliente = clients.find(c => String(c.id) === String(clienteId));
    const producto = catalog.find(p => String(p.id) === String(productoId));
    try {
      await axios.post("https://spin-shoes-backend.onrender.com/api/orders", {
        cliente:  cliente?.nombre,
        modelo:   producto?.referencia,
        cantidad: totalCantidad,
        status:   "activo",
        personalizacion: { ...custom, tallas, color_producto: colorElegido },
      });
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("❌ Error al crear pedido:", error);
    }
  };

  const startEdit = (o) => {
    setEditingId(o.id);
    // Buscar IDs correspondientes
    const cli = clients.find(c => c.nombre === o.cliente);
    const cat = catalog.find(p => p.referencia === o.modelo);
    setClienteId(cli?.id || "");
    setProductoId(cat?.id || "");
    setColorElegido(o.personalizacion?.color_producto || "");
    setCustom({
      color: o.personalizacion?.color || "",
      suela: o.personalizacion?.suela || "",
      nota:  o.personalizacion?.nota  || "",
    });
    const t = tallasVacias();
    if (o.personalizacion?.tallas) {
      Object.entries(o.personalizacion.tallas).forEach(([k, v]) => { if (t[k] !== undefined) t[k] = v; });
    }
    setTallas(t);
  };

  const updateOrder = async () => {
    const cliente  = clients.find(c => String(c.id) === String(clienteId));
    const producto = catalog.find(p => String(p.id) === String(productoId));
    try {
      await axios.put(`https://spin-shoes-backend.onrender.com/api/orders/${editingId}`, {
        cliente:  cliente?.nombre,
        modelo:   producto?.referencia,
        cantidad: totalCantidad,
        status:   "activo",
        personalizacion: { ...custom, tallas, color_producto: colorElegido },
      });
      resetForm();
      fetchAll();
    } catch (error) {
      console.error("❌ Error al actualizar pedido:", error);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este pedido?")) return;
    try {
      await axios.delete(`https://spin-shoes-backend.onrender.com/api/orders/${id}`);
      fetchAll();
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Gestión de Pedidos</div>
        <div className="page-subtitle">Crea y administra los pedidos de tus clientes</div>
      </div>

      {/* ── FORMULARIO ── */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <div className="section-title" style={{ marginBottom: 20 }}>
          {editingId ? "✏️ Editando pedido" : "➕ Nuevo pedido"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

          {/* CLIENTE */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Cliente *
            </label>
            <select
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
              className="input-pro"
            >
              <option value="">— Seleccionar cliente —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.nit ? `· ${c.nit}` : ""} {c.ciudad ? `· ${c.ciudad}` : ""}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <div style={{ fontSize: "0.75rem", color: "#d97706", marginTop: 4 }}>
                ⚠️ No hay clientes. Crea uno primero en la sección Clientes.
              </div>
            )}
          </div>

          {/* REFERENCIA */}
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Referencia *
            </label>
            <select
              value={productoId}
              onChange={e => setProductoId(e.target.value)}
              className="input-pro"
            >
              <option value="">— Seleccionar referencia —</option>
              {catalog.map(p => (
                <option key={p.id} value={p.id}>
                  {p.referencia} — {p.descripcion || "Sin descripción"} · ${Number(p.precio).toLocaleString("es-CO")}
                </option>
              ))}
            </select>
            {catalog.length === 0 && (
              <div style={{ fontSize: "0.75rem", color: "#d97706", marginTop: 4 }}>
                ⚠️ No hay referencias. Crea una primero en Catálogo.
              </div>
            )}
          </div>

        </div>

        {/* PREVIEW DEL PRODUCTO SELECCIONADO */}
        {productoSeleccionado && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>

            {/* Imagen del color elegido o placeholder */}
            <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}>
              {colorElegido && imagenesProducto[colorElegido] ? (
                <img src={imagenesProducto[colorElegido]} alt={colorElegido} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : coloresDisponibles.length > 0 && imagenesProducto[coloresDisponibles[0]] ? (
                <img src={imagenesProducto[coloresDisponibles[0]]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>👟</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1rem", marginBottom: 2 }}>
                {productoSeleccionado.referencia}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                {productoSeleccionado.descripcion} · <strong>${Number(productoSeleccionado.precio).toLocaleString("es-CO")}</strong>
              </div>

              {/* Selector de color del producto */}
              {coloresDisponibles.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Color del zapato
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {coloresDisponibles.map(c => (
                      <button
                        key={c}
                        onClick={() => setColorElegido(c)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "5px 12px", borderRadius: 99, cursor: "pointer",
                          border: colorElegido === c ? "2px solid var(--blue-600)" : "1.5px solid var(--border)",
                          background: colorElegido === c ? "rgba(26,86,219,0.08)" : "var(--card)",
                          fontSize: "0.78rem", fontWeight: colorElegido === c ? 700 : 400,
                          color: colorElegido === c ? "var(--blue-600)" : "var(--text-secondary)",
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{ width: 11, height: 11, borderRadius: "50%", background: COLOR_DOT[c] || "#888", border: "1px solid rgba(0,0,0,0.12)", flexShrink: 0 }} />
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TALLAS */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Tallas</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Total: <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "var(--blue-600)" }}>{totalCantidad} pares</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
            {TALLAS.map(t => (
              <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)" }}>{t}</span>
                <input
                  type="number" min="0"
                  value={tallas[t]}
                  onChange={e => setTallas({ ...tallas, [t]: e.target.value })}
                  className="input-pro"
                  style={{ textAlign: "center", padding: "6px 4px", fontSize: "0.85rem" }}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* PERSONALIZACIÓN */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Personalización de suela
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 8 }}>Suela</div>
            <div style={{ display: "flex", gap: 8 }}>
              {suelas.map(s => (
                <button key={s} onClick={() => setCustom({ ...custom, suela: s })}
                  style={{
                    padding: "6px 16px", borderRadius: 99, cursor: "pointer", fontSize: "0.82rem",
                    border: custom.suela === s ? "2px solid #059669" : "1.5px solid var(--border)",
                    background: custom.suela === s ? "rgba(16,185,129,0.08)" : "var(--card)",
                    fontWeight: custom.suela === s ? 700 : 400,
                    color: custom.suela === s ? "#059669" : "var(--text-secondary)",
                    transition: "all 0.15s"
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>Notas adicionales</div>
            <input
              placeholder="Detalles especiales del pedido..."
              value={custom.nota}
              onChange={e => setCustom({ ...custom, nota: e.target.value })}
              className="input-pro"
            />
          </div>
        </div>

        {/* BOTONES */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={editingId ? updateOrder : createOrder}
            className={editingId ? "btn-edit" : "btn-primary"}
            style={{ padding: "10px 28px" }}
          >
            {editingId ? "💾 Guardar cambios" : "➕ Crear pedido"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="btn-secondary">✕ Cancelar</button>
          )}
        </div>
      </div>

      {/* ── TABLA DE PEDIDOS ── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table-pro">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Referencia</th>
              <th>Color</th>
              <th>Tallas</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Suela</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>{o.cliente}</td>
                <td>
                  <span style={{ background: "rgba(26,86,219,0.08)", color: "var(--blue-600)", padding: "3px 8px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700, fontFamily: "Syne, sans-serif" }}>
                    {o.modelo}
                  </span>
                </td>
                <td>
                  {o.personalizacion?.color_producto ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLOR_DOT[o.personalizacion.color_producto] || "#888", border: "1px solid rgba(0,0,0,0.1)" }} />
                      <span style={{ fontSize: "0.8rem" }}>{o.personalizacion.color_producto}</span>
                    </div>
                  ) : <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>—</span>}
                </td>
                <td>
                  {o.personalizacion?.tallas ? (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {Object.entries(o.personalizacion.tallas)
                        .filter(([, v]) => parseInt(v) > 0)
                        .map(([talla, qty]) => (
                          <span key={talla} style={{ background: "rgba(99,102,241,0.1)", color: "#4f46e5", padding: "2px 7px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 600 }}>
                            {talla}:{qty}
                          </span>
                        ))}
                    </div>
                  ) : <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>—</span>}
                </td>
                <td style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}>{o.cantidad}</td>
                <td>
                  <span className={`status-badge status-${o.status}`}>{o.status}</span>
                </td>
                <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {o.personalizacion?.suela || "—"}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEdit(o)} className="btn-edit">✏️</button>
                    <button onClick={() => deleteOrder(o.id)} className="btn-danger">🗑️</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
                  No hay pedidos aún. ¡Crea el primero!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
