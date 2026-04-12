"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HistoricoPage() {
  const router = useRouter();
  const [cierres, setCierres] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from("cierres")
        .select("*")
        .not("archived_at", "is", null)
        .order("created_at", { ascending: false });

      if (!error) setCierres(data || []);
      setCargando(false);
    };

    cargar();
  }, []);

  if (cargando) return <p className="p-6">Cargando histórico...</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Histórico de cierres</h1>

          <button
            onClick={() => router.push("/admin")}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            ← Volver
          </button>
        </div>

        {cierres.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-gray-500">
            No hay cierres archivados.
          </div>
        ) : (
          <div className="space-y-3">
            {cierres.map((cierre) => (
              <div
                key={cierre.id}
                className="rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-semibold">{cierre.fecha}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-green-600">
                      ${cierre.total_entregar}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  Chofer {cierre.numero_chofer} | Móvil {cierre.movil} |{" "}
                  {cierre.turno}
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  {new Date(cierre.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}