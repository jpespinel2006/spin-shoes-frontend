import { useEffect, useState } from "react";
import axios from "axios";

const ESTADOS = ["CREADO", "EN_PRODUCCION", "LISTO", "DESPACHADO", "ENTREGADO"];

const colorEstado = (estado) => {
  const colores = {
    CREADO: "bg-gray-100 text-gray-700",
    EN_PRODUCCION: "bg-yellow-100 text-yellow-800",
    LISTO: "bg-blue-100 text-blue-800",
    DESPACHADO: "bg-purple-100 text-purple-800",
    ENTREGADO: "bg-green-100 text-green-800",
  };
  return colores[estado] || "bg-gray-100 text-gray-700";
};

export default function Production() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ order_id: "", responsable: "", fecha_estimada: "", notas: "" });
  const [editingId, setEditingId] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  const fetchData = async () => {
    try {
      const [prod, ord] = await Promise.all([
        axios.get("https://spin-shoes-backend.onrender.com/api/production"),
        axios.get("https://spin-shoes-backend.onrender.com/api/orders"),
      ]);
      setItems(prod.data);
      // Solo mostrar pedidos que no estén ya en producción para el formulario
      setOrders(ord.data.filter(o => o.status === "activo"));
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const crearRegistro = async () => {
    if (!form.order_id || !form.responsable) {
      alert("Selecciona un pedido y asigna un responsable");
      return;
    }
    try {
      await axios.post("https://spin-shoes-backend.onrender.com/api/production", form);
      setForm({ order_id: "", responsable: "", fecha_estimada: "", notas: "" });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Error al crear");
    }
  };

  const actualizarEstado = async (id) => {
    if (!nuevoEstado) { alert("Selecciona un estado"); return; }
    try {
      await axios.put(`https://spin-shoes-backend.onrender.com/api/production/${id}`, { estado: nuevoEstado });
      setEditingId(null);
      setNuevoEstado("");
      fetchData();
    } catch (error) {
      alert("Error al actualizar");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Control de Producción</h1>

      {/* FORMULARIO — solo si hay pedidos activos */}
      {orders.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-4 text-gray-700">➕ Enviar pedido a producción</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pedido activo *</p>
              <select value={form.order_id}
                onChange={e => setForm({ ...form, order_id: e.target.value })}
                className="border p-2 rounded w-full">
                <option value="">Selecciona un pedido...</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    #{o.id} — {o.cliente} · {o.modelo} ({o.cantidad} und)
                  </option>
                ))}
              </select>
            </div>

            <input placeholder="Responsable de producción *" value={form.responsable}
              onChange={e => setForm({ ...form, responsable: e.target.value })}
              className="border p-2 rounded" />

            <div>
              <p className="text-xs text-gray-500 mb-1">Fecha estimada de entrega</p>
              <input type="date" value={form.fecha_estimada}
                onChange={e => setForm({ ...form, fecha_estimada: e.target.value })}
                className="border p-2 rounded w-full" />
            </div>

            <input placeholder="Notas adicionales" value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              className="border p-2 rounded" />
          </div>

          <button onClick={crearRegistro}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded font-medium">
            🏭 Iniciar producción
          </button>
        </div>
      )}

      {orders.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-blue-700 text-sm">
          No hay pedidos activos disponibles para enviar a producción.
          Crea un pedido en la sección de Pedidos primero.
        </div>
      )}

      {/* TABLA DE PRODUCCIÓN */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Pedido</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Modelo</th>
              <th className="text-left p-3">Responsable</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Cambiar estado</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">#{item.order_id}</td>
                <td className="p-3">{item.cliente}</td>
                <td className="p-3">{item.modelo}</td>
                <td className="p-3">{item.responsable}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${colorEstado(item.estado)}`}>
                    {item.estado.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}
                        className="border p-1 rounded text-xs">
                        <option value="">Estado...</option>
                        {ESTADOS.map(e => (
                          <option key={e} value={e}>{e.replace("_", " ")}</option>
                        ))}
                      </select>
                      <button onClick={() => actualizarEstado(item.id)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        ✓
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-2 py-1 rounded text-xs">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(item.id); setNuevoEstado(item.estado); }}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                      disabled={item.estado === "ENTREGADO"}>
                      {item.estado === "ENTREGADO" ? "✓ Completado" : "🔄 Cambiar"}
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-400">
                  No hay registros de producción aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
