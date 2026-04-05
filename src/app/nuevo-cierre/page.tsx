"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NuevoCierrePage() {
  const [fotoReloj, setFotoReloj] = useState<File | null>(null);
  const [fotoPos, setFotoPos] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [chofer, setChofer] = useState("");
  const [movil, setMovil] = useState("");
  const [turno, setTurno] = useState("");
  const [kmInicio, setKmInicio] = useState("");
  const [kmFin, setKmFin] = useState("");
  const [totalReloj, setTotalReloj] = useState("");
  const [totalTarjetas, setTotalTarjetas] = useState("");
  const [gastos, setGastos] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const kmTotalCalculado = Number(kmFin || 0) - Number(kmInicio || 0);
  const totalRecaudadoCalculado =
    Number(totalReloj || 0) + Number(totalTarjetas || 0);
  const totalEntregarCalculado = Number(
    (totalRecaudadoCalculado - Number(gastos || 0)).toFixed(2)
  );

 const guardarCierre = async () => {
  setMensaje("");

  if (!fecha || !chofer || !movil || !turno) {
    setMensaje("Completá los datos obligatorios");
    return;
  }

  if (!kmInicio || !kmFin || !totalReloj) {
    setMensaje("Completá los números obligatorios");
    return;
  }

  let fotoRelojUrl = "";
  let fotoPosUrl = "";

  if (fotoReloj) {
   const nombreArchivo = `${Date.now()}-${fotoReloj.name.replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

    const { error: errorSubida } = await supabase.storage
      .from("cierres")
      .upload(nombreArchivo, fotoReloj, {
        upsert: false,
      });

    if (errorSubida) {
      setMensaje("Error subiendo imagen del reloj: " + errorSubida.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("cierres")
      .getPublicUrl(nombreArchivo);

    fotoRelojUrl = urlData.publicUrl;
  }

  if (fotoPos) {
  const nombreArchivo = `${Date.now()}-${fotoPos.name.replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

    const { error: errorSubida } = await supabase.storage
      .from("cierres")
      .upload(nombreArchivo, fotoPos, {
        upsert: false,
      });

    if (errorSubida) {
      setMensaje("Error subiendo imagen POS: " + errorSubida.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("cierres")
      .getPublicUrl(nombreArchivo);

    fotoPosUrl = urlData.publicUrl;
  }

  const { error } = await supabase.from("cierres").insert([
    {
      user_id: (await supabase.auth.getUser()).data.user?.id,
      fecha,
      chofer,
      movil,
      turno,
      km_inicio: Number(kmInicio),
      km_fin: Number(kmFin),
      km_total: kmTotalCalculado,
      total_reloj: Number(totalReloj),
      total_tarjetas: Number(totalTarjetas),
      gastos: Number(gastos),
      total_entregar: totalEntregarCalculado,
      observaciones,
      foto_reloj_url: fotoRelojUrl,
      foto_pos_url: fotoPosUrl,
    },
  ]);

  if (error) {
    setMensaje("Error: " + error.message);
    return;
  }

  setMensaje("Cierre guardado correctamente");

  setFecha(new Date().toISOString().split("T")[0]);
  setChofer("");
  setMovil("");
  setTurno("");
  setKmInicio("");
  setKmFin("");
  setTotalReloj("");
  setTotalTarjetas("");
  setGastos("");
  setObservaciones("");
  setFotoReloj(null);
  setFotoPos(null);
};

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Nuevo cierre</h1>

        {mensaje && (
          <div className="mb-4 rounded bg-green-200 p-3 text-center text-green-900">
            {mensaje}
          </div>
        )}
<Link
  href="/admin"
  className="inline-block mb-3 rounded border px-3 py-2"
>
  ← Volver al admin
</Link>
        <form className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Chofer</label>
            <input
              type="text"
              value={chofer}
              onChange={(e) => setChofer(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Móvil</label>
            <input
              type="text"
              value={movil}
              onChange={(e) => setMovil(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Turno</label>
            <input
              type="text"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">KM inicio</label>
            <input
              type="number"
              value={kmInicio}
              onChange={(e) => setKmInicio(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">KM fin</label>
            <input
              type="number"
              value={kmFin}
              onChange={(e) => setKmFin(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">KM total</label>
            <input
              type="number"
              value={kmTotalCalculado}
              readOnly
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Total reloj</label>
            <input
              type="number"
              step="0.01"
              value={totalReloj}
              onChange={(e) => setTotalReloj(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Total tarjetas</label>
            <input
              type="number"
              step="0.01"
              value={totalTarjetas}
              onChange={(e) => setTotalTarjetas(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Gastos</label>
            <input
              type="number"
              step="0.01"
              value={gastos}
              onChange={(e) => setGastos(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Total a entregar</label>
            <input
              type="number"
              value={totalEntregarCalculado}
              readOnly
              className="w-full rounded border bg-gray-100 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={4}
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Foto del reloj</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoReloj(e.target.files?.[0] || null)}
              className="w-full"
            />
            {fotoReloj && (
              <img
                src={URL.createObjectURL(fotoReloj)}
                alt="Vista previa"
                className="mt-2 w-full rounded"
              />
            )}
          </div>
<div>
  <label className="mb-1 block font-medium">Foto del POS</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setFotoPos(e.target.files?.[0] || null)}
    className="w-full"
  />
  {fotoPos && (
    <img
      src={URL.createObjectURL(fotoPos)}
      alt="Vista previa POS"
      className="mt-2 w-full rounded"
    />
  )}
</div>
          <button
            type="button"
            onClick={guardarCierre}
            className="w-full rounded bg-black px-4 py-2 text-white"
          >
            Confirmar cierre
          </button>
        </form>
      </div>
    </main>
  );
}