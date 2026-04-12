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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-md">
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

        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-semibold">{cierre.fecha}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Número de chofer</p>
              <p className="font-semibold">{cierre.numero_chofer}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Número de móvil</p>
              <p className="font-semibold">{cierre.movil}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Hora</p>
              <p className="font-semibold">
                {cierre.created_at
                  ? new Date(cierre.created_at).toLocaleTimeString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Turno</p>
              <p className="font-semibold">{cierre.turno}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs ${
                  cierre.revisado
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {cierre.revisado ? "Revisado" : "Pendiente"}
              </span>
            </div>
          </div>

          {!cierre.revisado && (
            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  const { error } = await supabase
                    .from("cierres")
                    .update({ revisado: true })
                    .eq("id", cierre.id);

                  if (error) {
                    alert(error.message);
                    return;
                  }

                  router.push("/admin");
                }}
                className="rounded bg-black px-3 py-2 text-xs text-white"
              >
                Marcar como revisado
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 space-y-2 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Recaudación</h2>

          <p>Total reloj: ${cierre.total_reloj}</p>
          <p>Total tarjetas: ${cierre.total_tarjetas}</p>
          <p>Gastos: ${cierre.gastos}</p>
          <p>Retira chofer: ${cierre.retira_chofer}</p>

          <div className="mt-3 rounded-xl bg-green-100 p-3">
            <p className="text-sm text-gray-600">Total a entregar</p>
            <p className="text-xl font-bold text-green-700">
              ${cierre.total_entregar}
            </p>
          </div>
        </div>

        <div className="mb-4 space-y-1 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Kilometraje</h2>

          <p>Inicio: {cierre.km_inicio}</p>
          <p>Fin: {cierre.km_fin}</p>
          <p>Total: {cierre.km_total}</p>
        </div>

        {cierre.observaciones && (
          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-semibold">Observaciones</h2>
            <p>{cierre.observaciones}</p>
          </div>
        )}

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