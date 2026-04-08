"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NuevoCierrePage() {
  const [movil, setMovil] = useState("");
  const [turno, setTurno] = useState("");
  const [kmEntrada, setKmEntrada] = useState("");
  const [kmSalida, setKmSalida] = useState("");

  const [totalReloj, setTotalReloj] = useState("");
  const [totalPos, setTotalPos] = useState("");
  const [gastos, setGastos] = useState("");

  const [fotoReloj, setFotoReloj] = useState<File | null>(null);
  const [fotoPos, setFotoPos] = useState<File | null>(null);

  const [previewReloj, setPreviewReloj] = useState("");
  const [previewPos, setPreviewPos] = useState("");

  const [paso, setPaso] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const relojInputRef = useRef<HTMLInputElement>(null);
  const posInputRef = useRef<HTMLInputElement>(null);

  const limpiarFormulario = () => {
    setMovil("");
    setTurno("");
    setKmEntrada("");
    setKmSalida("");
    setTotalReloj("");
    setTotalPos("");
    setGastos("");
    setFotoReloj(null);
    setFotoPos(null);
    setPreviewReloj("");
    setPreviewPos("");
    setPaso(1);
    setMensaje("");
  };

  const handleContinuarPaso1 = () => {
    setMensaje("");

    if (!movil || !turno || !kmEntrada || !kmSalida) {
      setMensaje("Completa todos los campos");
      return;
    }

    const kmIn = Number(kmEntrada);
    const kmOut = Number(kmSalida);

    if (Number.isNaN(kmIn) || Number.isNaN(kmOut)) {
      setMensaje("Los kilómetros deben ser números");
      return;
    }

    if (kmOut <= kmIn) {
      setMensaje("Km salida debe ser mayor que Km entrada");
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

  const handleGuardarCierre = async () => {
    setMensaje("Guardando...");

   const userResult = await supabase.auth.getUser();
const user = userResult.data.user;

if (!user) {
  setMensaje("No hay usuario logueado");
  return;
}

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("cooperativa_id")
     .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setMensaje("No se encontró el profile");
      return;
    }

    if (!fotoReloj || !fotoPos) {
      setMensaje("Faltan fotos");
      return;
    }

   const nombreBase = `${Date.now()}-${user.id}`;

    const rutaReloj = `reloj/${nombreBase}-${fotoReloj.name}`;
    const rutaPos = `pos/${nombreBase}-${fotoPos.name}`;

    const subidaReloj = await supabase.storage
      .from("cierres")
      .upload(rutaReloj, fotoReloj);

    if (subidaReloj.error) {
      setMensaje("Error subiendo foto del reloj");
      return;
    }

    const subidaPos = await supabase.storage
      .from("cierres")
      .upload(rutaPos, fotoPos);

    if (subidaPos.error) {
      setMensaje("Error subiendo foto del POS");
      return;
    }

    const urlRelojData = supabase.storage.from("cierres").getPublicUrl(rutaReloj);
    const urlPosData = supabase.storage.from("cierres").getPublicUrl(rutaPos);

    const kmTotalCalculado = Number(kmSalida) - Number(kmEntrada);
    const totalEntregarCalculado =
      Number(totalReloj) + Number(totalPos) - Number(gastos);

    const fechaHoy = new Date().toISOString().slice(0, 10);

    const insertResult = await supabase.from("cierres").insert([
      {
        fecha: fechaHoy,
       chofer: user.email || "Chofer",
        movil,
        turno,
        km_inicio: Number(kmEntrada),
        km_fin: Number(kmSalida),
        km_total: kmTotalCalculado,
        total_reloj: Number(totalReloj),
        total_tarjetas: Number(totalPos),
        gastos: Number(gastos),
        total_entregar: totalEntregarCalculado,
        observaciones: "",
        foto_reloj_url: urlRelojData.data.publicUrl,
        foto_pos_url: urlPosData.data.publicUrl,
       user_id: user.id,
        cooperativa_id: profile.cooperativa_id,
      },
    ]);

    if (insertResult.error) {
      setMensaje("Error al guardar cierre");
      return;
    }

    limpiarFormulario();
    setMensaje("Cierre guardado correctamente");
  };

  if (paso === 4) {
    const totalEntregar =
      Number(totalReloj) + Number(totalPos) - Number(gastos);

    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-xl font-bold mb-6 text-center">
            Revisar y confirmar
          </h1>

          <div className="space-y-3 text-sm">
            <p><strong>Móvil:</strong> {movil}</p>
            <p><strong>Turno:</strong> {turno}</p>
            <p><strong>Km entrada:</strong> {kmEntrada}</p>
            <p><strong>Km salida:</strong> {kmSalida}</p>
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
            type="button"
            onClick={handleGuardarCierre}
            className="w-full bg-yellow-400 text-black font-semibold p-3 rounded-xl mt-6"
          >
            CONFIRMAR CIERRE
          </button>

          <button
            type="button"
            onClick={() => setPaso(3)}
            className="w-full border border-black text-black font-semibold p-3 rounded-xl mt-3"
          >
            VOLVER
          </button>

          {mensaje && (
            <p className="text-center text-sm mt-3">{mensaje}</p>
          )}
        </div>
      </main>
    );
  }

  if (paso === 3) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
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
                <img
                  src={previewReloj}
                  alt="Preview reloj"
                  className="mt-2 rounded-xl w-full"
                />
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
                <img
                  src={previewPos}
                  alt="Preview POS"
                  className="mt-2 rounded-xl w-full"
                />
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
              type="button"
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
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-xl font-bold mb-6 text-center">Recaudación</h1>

          <div className="space-y-4">
            <input
              value={totalReloj}
              onChange={(e) => setTotalReloj(e.target.value)}
              placeholder="Total reloj"
              className="w-full border p-3 rounded-xl"
            />

            <input
              value={totalPos}
              onChange={(e) => setTotalPos(e.target.value)}
              placeholder="Total POS"
              className="w-full border p-3 rounded-xl"
            />

            <input
              value={gastos}
              onChange={(e) => setGastos(e.target.value)}
              placeholder="Gastos"
              className="w-full border p-3 rounded-xl"
            />

            <button
              type="button"
              onClick={handleContinuarPaso2}
              className="w-full bg-yellow-400 p-3 rounded-xl"
            >
              CONTINUAR
            </button>

            <button
              type="button"
              onClick={() => setPaso(1)}
              className="w-full border p-3 rounded-xl"
            >
              VOLVER
            </button>

            {mensaje && (
              <p className="text-red-500 text-sm text-center">{mensaje}</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-xl font-bold mb-6 text-center">
          Inicio del Cierre
        </h1>

        <div className="space-y-4">
          <input
            value={movil}
            onChange={(e) => setMovil(e.target.value)}
            placeholder="Móvil"
            className="w-full border p-3 rounded-xl"
          />

          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="w-full border p-3 rounded-xl"
          >
            <option value="">Turno</option>
            <option value="diurno">Diurno</option>
            <option value="nocturno">Nocturno</option>
          </select>

          <input
            value={kmEntrada}
            onChange={(e) => setKmEntrada(e.target.value)}
            placeholder="Km entrada"
            className="w-full border p-3 rounded-xl"
          />

          <input
            value={kmSalida}
            onChange={(e) => setKmSalida(e.target.value)}
            placeholder="Km salida"
            className="w-full border p-3 rounded-xl"
          />

          <button
            type="button"
            onClick={handleContinuarPaso1}
            className="w-full bg-yellow-400 p-3 rounded-xl"
          >
            CONTINUAR
          </button>

          {mensaje && (
            <p className="text-red-500 text-sm text-center">{mensaje}</p>
          )}
        </div>
      </div>
    </main>
  );
}