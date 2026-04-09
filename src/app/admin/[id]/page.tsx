"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function DetalleCierrePage() {
  const { id } = useParams();
  const router = useRouter();

  const [cierre, setCierre] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const revisarSesionYCargar = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("cierres")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setCierre(data);
      setCargando(false);
    };

    if (id) revisarSesionYCargar();
  }, [id, router]);

  if (cargando) return <p className="p-6">Cargando...</p>;
  if (!cierre) return <p className="p-6">No encontrado</p>;

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-md">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Detalle del cierre</h1>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            ← Volver
          </button>
        </div>

        {/* RESUMEN PRINCIPAL */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
  <p className="text-sm text-gray-500">Fecha</p>
  <p className="font-semibold">{cierre.fecha}</p>

  <div className="mt-2 text-sm text-gray-600">
    {cierre.movil} · {cierre.turno}
  </div>

  <div className="mt-3 flex items-center justify-between">
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        cierre.estado === "revisado"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {cierre.estado === "revisado" ? "Revisado" : "Pendiente"}
    </span>

    {cierre.estado !== "revisado" && (
      <button
        onClick={async () => {
          const { error } = await supabase
            .from("cierres")
            .update({ estado: "revisado" })
            .eq("id", cierre.id);

          if (!error) {
            setCierre({ ...cierre, estado: "revisado" });
          }
        }}
        className="text-xs bg-black text-white px-3 py-1 rounded"
      >
        Marcar como revisado
      </button>
    )}
  </div>
</div>

        {/* DINERO */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-2">
          <h2 className="font-semibold mb-2">Recaudación</h2>

          <p>Total reloj: ${cierre.total_reloj}</p>
          <p>Total tarjetas: ${cierre.total_tarjetas}</p>
          <p>Gastos: ${cierre.gastos}</p>
          <p>Retira chofer: ${cierre.retira_chofer}</p>

          <div className="bg-green-100 p-3 rounded-xl mt-3">
            <p className="text-sm text-gray-600">Total a entregar</p>
            <p className="text-xl font-bold text-green-700">
              ${cierre.total_entregar}
            </p>
          </div>
        </div>

        {/* KM */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-1">
          <h2 className="font-semibold mb-2">Kilometraje</h2>

          <p>Inicio: {cierre.km_inicio}</p>
          <p>Fin: {cierre.km_fin}</p>
          <p>Total: {cierre.km_total}</p>
        </div>

        {/* INFO EXTRA */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-1">
          <h2 className="font-semibold mb-2">Información</h2>

          <p>Chofer: {cierre.chofer}</p>

          {cierre.created_at && (
            <p>
              Hora: {new Date(cierre.created_at).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* OBSERVACIONES */}
        {cierre.observaciones && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h2 className="font-semibold mb-2">Observaciones</h2>
            <p>{cierre.observaciones}</p>
          </div>
        )}

        {/* FOTOS */}
        {cierre.foto_reloj_url && (
          <div className="mb-4">
            <p className="mb-2 font-medium">Foto del reloj</p>
            <img
              src={cierre.foto_reloj_url}
              alt="Foto del reloj"
              className="w-full rounded-xl"
            />
          </div>
        )}

        {cierre.foto_pos_url && (
          <div className="mb-4">
            <p className="mb-2 font-medium">Foto del POS</p>
            <img
              src={cierre.foto_pos_url}
              alt="Foto del POS"
              className="w-full rounded-xl"
            />
          </div>
        )}

      </div>
    </main>
  );
}