import { useEffect, useState } from "react";
import axios from "axios";

const colorEstado = (status) => {
  if (status === "activo") return "bg-blue-100 text-blue-800";
  if (status === "produccion") return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("https://spin-shoes-backend.onrender.com/api/reports");
        setData(res.data);
      } catch (error) {
        console.error("❌ Error al cargar reportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Cargando reportes...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-red-400">
        Error al cargar los reportes. Verifica que el servidor esté corriendo.
      </div>
    );
  }

  const maxModelo = Math.max(...(data.topModelos.map(m => Number(m.total_unidades)) || [1]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reportes y Estadísticas</h1>

      {/* CARDS DE RESUMEN */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm mb-1">Total pedidos</p>
          <p className="text-4xl font-bold text-blue-600">{data.resumen?.total_pedidos || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm mb-1">Total unidades</p>
          <p className="text-4xl font-bold text-green-600">{data.resumen?.total_unidades || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm mb-1">Clientes únicos</p>
          <p className="text-4xl font-bold text-purple-600">{data.resumen?.total_clientes || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* PEDIDOS POR ESTADO */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Pedidos por estado</h2>
          <div className="space-y-2">
            {data.porEstado.length > 0 ? data.porEstado.map(e => (
              <div key={e.status} className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded text-xs font-medium ${colorEstado(e.status)}`}>
                  {e.status}
                </span>
                <span className="font-bold text-lg">{e.total}</span>
              </div>
            )) : <p className="text-gray-400 text-sm">Sin datos</p>}
          </div>
        </div>

        {/* TOP CLIENTES */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Top clientes</h2>
          <div className="space-y-2">
            {data.topClientes.length > 0 ? data.topClientes.map((c, i) => (
              <div key={c.cliente} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs
                    flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{c.cliente}</span>
                </div>
                <span className="text-xs text-gray-500">{c.total_pedidos} pedidos</span>
              </div>
            )) : <p className="text-gray-400 text-sm">Sin datos</p>}
          </div>
        </div>

      </div>

      {/* TOP MODELOS — barras visuales */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-4">Modelos más pedidos</h2>
        {data.topModelos.length > 0 ? (
          <div className="space-y-3">
            {data.topModelos.map(m => {
              const pct = Math.round((Number(m.total_unidades) / maxModelo) * 100);
              return (
                <div key={m.modelo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{m.modelo}</span>
                    <span className="text-gray-500">{m.total_unidades} unidades</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-400 text-sm">Sin datos de modelos aún</p>}
      </div>

      {/* PEDIDOS POR MES */}
      {data.porMes.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Pedidos últimos 6 meses</h2>
          <div className="flex items-end gap-3 h-32">
            {data.porMes.map(m => {
              const maxMes = Math.max(...data.porMes.map(x => Number(x.total)));
              const h = Math.round((Number(m.total) / maxMes) * 100);
              return (
                <div key={m.mes} className="flex flex-col items-center flex-1">
                  <span className="text-xs font-bold text-blue-700 mb-1">{m.total}</span>
                  <div
                    className="w-full bg-blue-400 rounded-t"
                    style={{ height: `${h}%`, minHeight: "4px" }}
                  />
                  <span className="text-xs text-gray-400 mt-1">
                    {m.mes.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
