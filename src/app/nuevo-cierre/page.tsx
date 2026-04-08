"use client";

import { useState } from "react";

export default function NuevoCierrePage() {
  const [movil, setMovil] = useState("");
  const [turno, setTurno] = useState("");
  const [kmEntrada, setKmEntrada] = useState("");
  const [kmSalida, setKmSalida] = useState("");
  const [paso, setPaso] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const handleContinuar = () => {
    setMensaje("");

    if (!movil || !turno || !kmEntrada || !kmSalida) {
      setMensaje("Completa todos los campos");
      return;
    }

    setPaso(2);
  };

  if (paso === 2) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-xl font-bold mb-6 text-center">
            Paso 2
          </h1>

          <p className="text-center text-gray-600 mb-4">
            Aquí sigue la carga del cierre.
          </p>

          <button
            onClick={() => setPaso(1)}
            className="w-full bg-black text-white font-semibold p-3 rounded-xl"
          >
            Volver
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-xl font-bold mb-6 text-center">
          Inicio del Cierre
        </h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Móvil</label>
            <input
              value={movil}
              onChange={(e) => setMovil(e.target.value)}
              className="w-full border rounded-xl p-3 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Turno</label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full border rounded-xl p-3 mt-1"
            >
              <option value="">Seleccionar</option>
              <option value="diurno">Diurno</option>
              <option value="nocturno">Nocturno</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500">Km Entrada</label>
            <input
              value={kmEntrada}
              onChange={(e) => setKmEntrada(e.target.value)}
              className="w-full border rounded-xl p-3 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Km Salida</label>
            <input
              value={kmSalida}
              onChange={(e) => setKmSalida(e.target.value)}
              className="w-full border rounded-xl p-3 mt-1"
            />
          </div>

          <button
            onClick={handleContinuar}
            className="w-full bg-yellow-400 text-black font-semibold p-3 rounded-xl mt-4"
          >
            CONTINUAR
          </button>

          {mensaje && (
            <p className="text-center text-red-500 text-sm">{mensaje}</p>
          )}
        </div>
      </div>
    </main>
  );
}