import { useEffect, useState } from "react";
import axios from "axios";

const tiposCliente = ["NATURAL", "EMPRESA", "SOSPECHOSO"];

const FORM_VACIO = {
  nombre: "", nit: "", telefono: "", email: "",
  ciudad: "", direccion: "", tipo_cliente: "NATURAL",
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [editingId, setEditingId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const fetchClients = async () => {
    try {
      const res = await axios.get("https://spin-shoes-backend.onrender.com/api/clients");
      setClients(res.data);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    if (!form.nombre) { alert("El nombre es obligatorio"); return; }
    try {
      if (editingId) {
        await axios.put(`https://spin-shoes-backend.onrender.com/api/clients/${editingId}`, form);
      } else {
        await axios.post("https://spin-shoes-backend.onrender.com/api/clients", form);
      }
      setForm(FORM_VACIO);
      setEditingId(null);
      fetchClients();
    } catch (error) {
      alert(error.response?.data?.message || "Error al guardar");
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      nombre: c.nombre, nit: c.nit || "", telefono: c.telefono || "",
      email: c.email || "", ciudad: c.ciudad || "",
      direccion: c.direccion || "", tipo_cliente: c.tipo_cliente || "NATURAL",
    });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    await axios.delete(`https://spin-shoes-backend.onrender.com/api/clients/${id}`);
    fetchClients();
  };

  const cancelar = () => { setForm(FORM_VACIO); setEditingId(null); };

  const colorTipo = (tipo) => {
    if (tipo === "EMPRESA") return "bg-blue-100 text-blue-800";
    if (tipo === "SOSPECHOSO") return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  const clientesFiltrados = clients.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.nit || "").includes(busqueda) ||
    (c.ciudad || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Clientes</h1>

      {/* FORMULARIO */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-4 text-gray-700">
          {editingId ? "✏️ Editando cliente" : "➕ Nuevo cliente"}
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <input name="nombre" placeholder="Nombre completo *" value={form.nombre}
            onChange={handleChange} className="border p-2 rounded col-span-2" />

          <input name="nit" placeholder="NIT o Cédula" value={form.nit}
            onChange={handleChange} className="border p-2 rounded" />

          <input name="telefono" placeholder="Teléfono" value={form.telefono}
            onChange={handleChange} className="border p-2 rounded" />

          <input name="email" placeholder="Correo electrónico" value={form.email}
            onChange={handleChange} className="border p-2 rounded" />

          <input name="ciudad" placeholder="Ciudad" value={form.ciudad}
            onChange={handleChange} className="border p-2 rounded" />

          <input name="direccion" placeholder="Dirección" value={form.direccion}
            onChange={handleChange} className="border p-2 rounded col-span-2" />

          {/* Tipo de cliente */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Tipo de cliente</p>
            <div className="flex gap-2">
              {tiposCliente.map(t => (
                <button key={t} onClick={() => setForm({ ...form, tipo_cliente: t })}
                  className={`px-3 py-1 rounded-full text-xs border font-medium ${
                    form.tipo_cliente === t
                      ? t === "EMPRESA" ? "bg-blue-600 text-white"
                        : t === "SOSPECHOSO" ? "bg-red-500 text-white"
                        : "bg-green-600 text-white"
                      : "bg-white text-gray-600"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={guardar}
            className={`text-white px-5 py-2 rounded font-medium ${editingId ? "bg-yellow-500" : "bg-blue-600"}`}>
            {editingId ? "💾 Guardar cambios" : "➕ Crear cliente"}
          </button>
          {editingId && (
            <button onClick={cancelar} className="border px-5 py-2 rounded text-gray-600">
              ✕ Cancelar
            </button>
          )}
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="mb-3">
        <input placeholder="🔍 Buscar por nombre, NIT o ciudad..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="border p-2 rounded w-full bg-white" />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">NIT / Cédula</th>
              <th className="text-left p-3">Teléfono</th>
              <th className="text-left p-3">Ciudad</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length > 0 ? clientesFiltrados.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{c.nombre}</td>
                <td className="p-3 text-gray-500">{c.nit || "-"}</td>
                <td className="p-3">{c.telefono || "-"}</td>
                <td className="p-3">{c.ciudad || "-"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${colorTipo(c.tipo_cliente)}`}>
                    {c.tipo_cliente}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(c)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                      ✏️ Editar
                    </button>
                    <button onClick={() => eliminar(c.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  {busqueda ? "No se encontraron resultados" : "No hay clientes aún"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
