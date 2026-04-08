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

  const [previewReloj, setPreviewReloj] = useState("");
  const [previewPos, setPreviewPos] = useState("");

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

    setPaso(4);
  };

  if (paso === 4) {
    const totalEntregar =
      (Number(totalReloj) || 0) +
      (Number(totalPos) || 0) -
      (Number(gastos) || 0);

    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-xl font-bold mb-6 text-center">
            Revisar y confirmar
          </h1>

          <div className="space-y-3 text-sm">
            <p><strong>Móvil:</strong> {movil}</p>
            <p><strong>Turno:</strong> {turno}</p>
            <p><strong>Km Entrada:</strong> {kmEntrada}</p>
            <p><strong>Km Salida:</strong> {kmSalida}</p>
            <p><strong>Total reloj:</strong> {totalReloj}</p>
            <p><strong>Total POS:</strong> {totalPos}</p>
            <p><strong>Gastos:</strong> {gastos}</p>

            <div className="bg-green-100 p-4 rounded-xl mt-2">
              <p className="text-gray-600">Total a entregar</p>
              <p className="text-2xl font-bold text-green-700">
                ${totalEntregar}
              </p>
            </div>
          </div>

          <button
            onClick={() => alert("Luego guardamos en base de datos")}
            className="w-full bg-yellow-400 text-black font-semibold p-3 rounded-xl mt-6"
          >
            CONFIRMAR CIERRE
          </button>

          <button
            onClick={() => setPaso(3)}
            className="w-full border border-black text-black font-semibold p-3 rounded-xl mt-3"
          >
            VOLVER
          </button>
        </div>
      </main>
    );
  }

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
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFotoReloj(file);
                  setPreviewReloj(file ? URL.createObjectURL(file) : "");
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => relojInputRef.current?.click()}
                className="w-full bg-yellow-400 text-black font-semibold p-3 rounded-xl"
              >
                TOMAR FOTO DEL RELOJ
              </button>

              {previewReloj && (
                <img src={previewReloj} className="mt-2 rounded-xl" />
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Foto del POS</p>

              <input
                ref={posInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFotoPos(file);
                  setPreviewPos(file ? URL.createObjectURL(file) : "");
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => posInputRef.current?.click()}
                className="w-full bg-yellow-400 text-black font-semibold p-3 rounded-xl"
              >
                TOMAR FOTO DEL POS
              </button>

              {previewPos && (
                <img src={previewPos} className="mt-2 rounded-xl" />
              )}
            </div>

            <button
            type="button"
              onClick={handleContinuarPaso3}
              className="w-full bg-black text-white p-3 rounded-xl"
            >
              CONTINUAR
            </button>

            <button
              onClick={() => setPaso(2)}
              className="w-full border border-black p-3 rounded-xl"
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
            <input value={totalReloj} onChange={(e) => setTotalReloj(e.target.value)} placeholder="Total reloj" className="w-full border p-3 rounded-xl"/>
            <input value={totalPos} onChange={(e) => setTotalPos(e.target.value)} placeholder="Total POS" className="w-full border p-3 rounded-xl"/>
            <input value={gastos} onChange={(e) => setGastos(e.target.value)} placeholder="Gastos" className="w-full border p-3 rounded-xl"/>

            <button onClick={handleContinuarPaso2} className="w-full bg-yellow-400 p-3 rounded-xl">
              CONTINUAR
            </button>

            <button onClick={() => setPaso(1)} className="w-full border p-3 rounded-xl">
              VOLVER
            </button>

            {mensaje && <p className="text-red-500 text-sm text-center">{mensaje}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-xl font-bold mb-6 text-center">Inicio del Cierre</h1>

        <div className="space-y-4">
          <input value={movil} onChange={(e) => setMovil(e.target.value)} placeholder="Móvil" className="w-full border p-3 rounded-xl"/>
          <select value={turno} onChange={(e) => setTurno(e.target.value)} className="w-full border p-3 rounded-xl">
            <option value="">Turno</option>
            <option value="diurno">Diurno</option>
            <option value="nocturno">Nocturno</option>
          </select>
          <input value={kmEntrada} onChange={(e) => setKmEntrada(e.target.value)} placeholder="Km entrada" className="w-full border p-3 rounded-xl"/>
          <input value={kmSalida} onChange={(e) => setKmSalida(e.target.value)} placeholder="Km salida" className="w-full border p-3 rounded-xl"/>

          <button onClick={handleContinuarPaso1} className="w-full bg-yellow-400 p-3 rounded-xl">
            CONTINUAR
          </button>

          {mensaje && <p className="text-red-500 text-sm text-center">{mensaje}</p>}
        </div>
      </div>
    </main>
  );
}