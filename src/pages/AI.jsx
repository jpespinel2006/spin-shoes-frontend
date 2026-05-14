import { useState } from "react";
import axios from "axios";

export default function AI() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const send = async () => {
    const res = await axios.post("https://spin-shoes-backend.onrender.com/api/ai", {
      message: msg
    });

    setChat([...chat, { user: msg }, { bot: res.data.reply }]);
    setMsg("");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Asistente IA</h1>

      <div className="bg-white h-80 overflow-y-auto p-4 mb-4 rounded shadow">
        {chat.map((c, i) => (
          <div key={i}>
            {c.user && <p>🧑 {c.user}</p>}
            {c.bot && <p>🤖 {c.bot}</p>}
          </div>
        ))}
      </div>

      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <button onClick={send} className="bg-blue-600 text-white px-4 py-2">
        Enviar
      </button>
    </div>
  );
}