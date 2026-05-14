import { useEffect, useState } from "react";
import axios from "axios";
import ChatAI from "../components/ChatAI";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("https://spin-shoes-backend.onrender.com/api/dashboard");
      setData(res.data);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 w-full bg-gray-100 min-h-screen">

      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Pedidos Activos</p>
          <h3 className="text-2xl font-bold">
            {data ? data.activos : "0"}
          </h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">En Producción</p>
          <h3 className="text-2xl font-bold">
            {data ? data.produccion : "0"}
          </h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Pedidos Completados</p>
          <h3 className="text-2xl font-bold">
            {data ? data.completados : "0"}
          </h3>
        </div>

      </div>
{data && (
  <div className="bg-white p-4 rounded-xl shadow mt-6">
    <h3 className="font-semibold mb-3">Análisis de Pedidos</h3>

    <img
      src={data.chart}
      alt="grafica"
      className="rounded-xl"
    />
  </div>
)}
      {/* ALERTAS INTELIGENTES */}
<div className="bg-white p-4 rounded-xl shadow mb-6">
  <h3 className="font-semibold mb-3">
    Alertas Inteligentes
  </h3>

  {data?.alerts?.length > 0 ? (
    data.alerts.map((a, i) => (
      <div
        key={i}
        className={`p-3 rounded mb-2 ${
          a.tipo === "danger"
            ? "bg-red-100 border border-red-300"
            : a.tipo === "warning"
            ? "bg-yellow-100 border border-yellow-300"
            : "bg-blue-100 border border-blue-300"
        }`}
      >
        {a.mensaje}
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-sm">
      No hay alertas por ahora ✅
    </p>
  )}
</div>
      {/* TABLA */}
      <div className="bg-white p-4 rounded-xl shadow">

        <h3 className="font-semibold mb-3">
          Pedidos Recientes
        </h3>

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b text-left">
              <th>ID</th>
              <th>Cliente</th>
              <th>Modelo</th>
              <th>Cantidad</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
  {data?.pedidos?.length > 0 ? (
    data.pedidos.map((p) => (
      <tr key={p.id} className="border-b">
        <td>{p.id}</td>
        <td>{p.cliente}</td>
        <td>{p.modelo}</td>
        <td>{p.cantidad}</td>
        <td>{p.status}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center py-4 text-gray-400">
        No hay pedidos aún
      </td>
    </tr>
  )}
          </tbody>

        </table>

      </div>
<ChatAI />
    </div>
  );
}