"use client";

import { useRef, useState } from "react";

export default function NuevoCierrePage() {
  const [movil, setMovil] = useState("");
  const [turno, setTurno] = useState("");
  const [kmEntrada, setKmEntrada] = useState("");
  const [kmSalida, setKmSalida] = useState("");
  const [paso, setPaso] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const [totalReloj, setTotalReloj] = useState("");
  const [totalPos, setTotalPos] = useState("");
  const [gastos, setGastos] = useState("");

  const [fotoReloj, setFotoReloj] = useState<File | null>(null);
  const [fotoPos, setFotoPos] = useState<File | null>(null);

  const relojInputRef = useRef<HTMLInputElement>(null);
  const posInputRef = useRef<HTMLInputElement>(null);

  const handleContinuarPaso1 = () => {
    setMensaje("");

    if (!movil || !turno || !kmEntrada || !kmSalida) {
      setMensaje("Completa todos los campos");
      return;
    }

    setPaso(2);
  };

  const handleContinuarPaso2 = () => {
    setMensaje("");

    if (!totalReloj || !totalPos || !gastos) {
      setMensaje("Completa todos los campos");
      return;
    }

    setPaso(3);
  };

  const handleContinuarPaso3 = () => {
    setMensaje("");

    if (!fotoReloj || !fotoPos) {
      setMensaje("Debes cargar ambas fotos");
      return;
    }

    alert("Paso 3 completo");
  };

  if (paso === 3) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-xl font-bold mb-6 text-center">
            Fotos de respaldo
          </h1>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Foto del reloj</p>

              <input
                ref={relojInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setFotoReloj(e.target.files?.[0] || null)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => relojInputRef.current?.click()}
                className="w-full bg-yellow-400 text-black font-semibold p-3 rounded-xl"
              >
                TOMAR FOTO DEL RELOJ
              </button>

              {fotoReloj && (
                <p className="text-xs text-green-600 mt-2">{fotoReloj.name}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Foto del POS</p>

              <input
                ref={posInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setFotoPos(e.target.files?.[0] || null)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => posInputRef.current?.click()}
                className="w-full bg-yellow-400 text-black font-semibold p-3 rounded-xl"
              >
                TOMAR FOTO DEL POS
              </button>

              {fotoPos && (
                <p className="text-xs text-green-600 mt-2">{fotoPos.name}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinuarPaso3}
              className="w-full bg-black text-white font-semibold p-3 rounded-xl mt-4"
            >
              CONTINUAR
            </button>

            <button
              type="button"
              onClick={() => setPaso(2)}
              className="w-full border border-black text-black font-semibold p-3 rounded-xl"
            >
              VOLVER
            </button>

            {mensaje && (
              <p className="text-center text-red-500 text-sm">{mensaje}</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (paso === 2) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-xl font-bold mb-6 text-center">Recaudación</h1>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Total reloj</label>
              <input
                value={totalReloj}
                onChange={(e) => setTotalReloj(e.target.value)}
                className="w-full border rounded-xl p-3 mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Total POS</label>
              <input
                value={totalPos}
                onChange={(e) => setTotalPos(e.target.value)}
                className="w-full border rounded-xl p-3 mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Gastos</label>
              <input
                value={gastos}
                onChange={(e) => setGastos(e.target.value)}
                className="w-full border rounded-xl p-3 mt-1"
              />
            </div>

            <button
              type="button"
              onClick={handleContinuarPaso2}
              className="w-full bg-yellow-400 text-black font-semibold p-3 rounded-xl mt-4"
            >
              CONTINUAR
            </button>

            <button
              type="button"
              onClick={() => setPaso(1)}
              className="w-full bg-black text-white font-semibold p-3 rounded-xl"
            >
              VOLVER
            </button>

            {mensaje && (
              <p className="text-center text-red-500 text-sm">{mensaje}</p>
            )}
          </div>
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
            type="button"
            onClick={handleContinuarPaso1}
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