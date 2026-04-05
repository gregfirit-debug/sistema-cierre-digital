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

  if (cargando) return <p>Cargando...</p>;
  if (!cierre) return <p>No encontrado</p>;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-md space-y-2">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Detalle del cierre</h1>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded bg-gray-200 px-3 py-1"
          >
            Volver
          </button>
        </div>

        <p><strong>Fecha:</strong> {cierre.fecha}</p>
        <p><strong>Chofer:</strong> {cierre.chofer}</p>
        <p><strong>Móvil:</strong> {cierre.movil}</p>
        <p><strong>Turno:</strong> {cierre.turno}</p>

        <p><strong>KM inicio:</strong> {cierre.km_inicio}</p>
        <p><strong>KM fin:</strong> {cierre.km_fin}</p>
        <p><strong>KM total:</strong> {cierre.km_total}</p>

        <p><strong>Total reloj:</strong> {cierre.total_reloj}</p>
        <p><strong>Total tarjetas:</strong> {cierre.total_tarjetas}</p>
        <p><strong>Gastos:</strong> {cierre.gastos}</p>
        <p><strong>Total a entregar:</strong> {cierre.total_entregar}</p>

        <p><strong>Observaciones:</strong> {cierre.observaciones}</p>

        {cierre.foto_reloj_url && (
          <div className="mt-4">
            <p className="mb-2 font-medium">Foto del reloj</p>
            <img
              src={cierre.foto_reloj_url}
              alt="Foto del reloj"
              className="w-full rounded"
            />
          </div>
        )}

        {cierre.foto_pos_url && (
          <div className="mt-4">
            <p className="mb-2 font-medium">Foto del POS</p>
            <img
              src={cierre.foto_pos_url}
              alt="Foto del POS"
              className="w-full rounded"
            />
          </div>
        )}
      </div>
    </main>
  );
}