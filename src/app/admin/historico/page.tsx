"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Cierre = {
  id: string;
  fecha: string;
  numero_chofer: string;
  movil: string;
  turno: string;
  total_entregar: number;
  created_at: string;
  archived_at: string | null;
};

export default function HistoricoPage() {
  const router = useRouter();
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from("cierres")
        .select(
          "id, fecha, numero_chofer, movil, turno, total_entregar, created_at, archived_at"
        )
        .not("archived_at", "is", null)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error) setCierres((data as Cierre[]) || []);
      setCargando(false);
    };

    cargar();
  }, []);

  const cierresAgrupados = useMemo(() => {
    const grupos: Record<string, Cierre[]> = {};

    for (const cierre of cierres) {
      const clave = cierre.fecha || "Sin fecha";

      if (!grupos[clave]) {
        grupos[clave] = [];
      }

      grupos[clave].push(cierre);
    }

    return grupos;
  }, [cierres]);

  const fechas = Object.keys(cierresAgrupados);

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-gray-600">Cargando histórico...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Histórico de cierres</h1>
              <p className="text-sm text-gray-500">
                Cierres archivados agrupados por fecha
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              ← Volver al panel
            </button>
          </div>
        </div>

        {fechas.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No hay cierres archivados.
          </div>
        ) : (
          <div className="space-y-8">
            {fechas.map((fecha) => {
              const cierresDelDia = cierresAgrupados[fecha];
              const totalDelDia = cierresDelDia.reduce(
                (acc, cierre) => acc + Number(cierre.total_entregar || 0),
                0
              );

              return (
                <section key={fecha}>
                  <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{fecha}</h2>
                      <p className="text-sm text-gray-500">
                        {cierresDelDia.length} cierre(s) archivado(s)
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-500">Total del día</p>
                      <p className="text-lg font-bold text-green-600">
                        ${totalDelDia}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {cierresDelDia.map((cierre) => (
                      <div
                        key={cierre.id}
                        className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-semibold">Chofer:</span>{" "}
                              {cierre.numero_chofer}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Móvil:</span>{" "}
                              {cierre.movil}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Turno:</span>{" "}
                              {cierre.turno}
                            </p>
                            <p className="text-sm text-gray-500">
                              Hora:{" "}
                              {new Date(cierre.created_at).toLocaleTimeString()}
                            </p>
                          </div>

                          <div className="md:text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-xl font-bold text-green-600">
                              ${cierre.total_entregar}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}