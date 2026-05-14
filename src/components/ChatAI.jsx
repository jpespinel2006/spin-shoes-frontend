import { useState } from "react";
import axios from "axios";

export default function ChatAI() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    if (!msg.trim()) return;

    const newChat = [...chat, { tipo: "user", texto: msg }];
    setChat(newChat);
    setMsg("");
    setLoading(true);

    try {
      // ✅ CORREGIDO: ahora llama al backend Node en /api/ai
      // en lugar de llamar directamente a Python en el puerto 8000.
      // El frontend NUNCA debe hablar directo con Python.
      const res = await axios.post("https://spin-shoes-backend.onrender.com/api/ai", {
        message: msg,
      });

      setChat([
        ...newChat,
        { tipo: "bot", texto: res.data.respuesta },
      ]);

    } catch (error) {
      console.error("❌ Error en ChatAI:", error);
      setChat([
        ...newChat,
        { tipo: "bot", texto: "⚠️ No pude conectarme. Verifica que el servidor esté corriendo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: enviar también con la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") enviar();
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50"
        title="Abrir asistente IA"
      >
        🤖
      </button>

      {/* VENTANA DEL CHAT */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-xl shadow-lg flex flex-col z-50">

          {/* CABECERA */}
          <div className="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <span>🤖 Asistente IA</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white opacity-70 hover:opacity-100 text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* MENSAJES */}
          <div className="p-3 h-64 overflow-y-auto text-sm flex flex-col gap-2">
            {chat.length === 0 && (
              <p className="text-gray-400 text-center mt-4">
                Puedes preguntar sobre pedidos activos, producción, resumen o clientes.
              </p>
            )}
            {chat.map((c, i) => (
              <div
                key={i}
                className={`${c.tipo === "user" ? "text-right" : "text-left"}`}
              >
                <span
                  className={`inline-block px-3 py-2 rounded-lg max-w-xs whitespace-pre-line ${
                    c.tipo === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {c.texto}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <span className="inline-block px-3 py-2 rounded-lg bg-gray-100 text-gray-500 text-xs">
                  Pensando...
                </span>
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="flex border-t">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 outline-none text-sm"
              placeholder="Pregunta algo..."
            />
            <button
              onClick={enviar}
              disabled={loading}
              className="bg-blue-600 text-white px-4 disabled:opacity-50"
            >
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  );
}
