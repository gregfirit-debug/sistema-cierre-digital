"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Cierre = {
  id: string;
  fecha: string;
  chofer: string;
  movil: string;
  turno: string;
  total_entregar: number;
  created_at: string;
  revisado: boolean;
};

export default function AdminPage() {
  const router = useRouter();

  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorTexto, setErrorTexto] = useState("");
  const [movilFiltro, setMovilFiltro] = useState("");
  const [turnoFiltro, setTurnoFiltro] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");

  useEffect(() => {
    const revisarSesionYCargar = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("cooperativa_id")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (profileError) {
        setErrorTexto("Error profile: " + profileError.message);
        setCargando(false);
        return;
      }

      if (!profile) {
        setErrorTexto("Profile vacío para user id: " + userData.user.id);
        setCargando(false);
        return;
      }

      const { data: cooperativa, error: cooperativaError } = await supabase
        .from("cooperativas")
        .select("activa")
        .eq("id", profile.cooperativa_id)
        .single();

      if (cooperativaError || !cooperativa) {
        setErrorTexto("No se encontró la cooperativa.");
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from("cierres")
        .select("id, fecha, chofer, movil, turno, total_entregar, created_at, revisado")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setErrorTexto("Error al cargar cierres.");
        setCargando(false);
        return;
      }

      setCierres(data || []);
      setCargando(false);
    };

    revisarSesionYCargar();
  }, [router]);

 const cierresFiltrados = cierres.filter((cierre) => {
  const movilTexto = String(cierre.movil || "").toLowerCase().trim();
  const turnoTexto = String(cierre.turno || "").toLowerCase().trim();
  const filtroMovil = movilFiltro.toLowerCase().trim();
  const filtroTurno = turnoFiltro.toLowerCase().trim();

  const coincideMovil = movilTexto.includes(filtroMovil);
 const coincideTurno =
  filtroTurno === "" ||
  turnoTexto.startsWith(filtroTurno);

  const coincideFecha = fechaFiltro === "" || cierre.fecha === fechaFiltro;

  return coincideMovil && coincideTurno && coincideFecha;
});
  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Panel admin</h1>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/nuevo-cierre")}
              className="rounded-xl bg-green-600 px-5 py-2 text-white shadow hover:bg-green-700 transition"
            >
              Nuevo cierre
            </button>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {errorTexto && (
          <div className="mb-4 rounded bg-red-100 p-3 text-center text-red-900">
            <p>{errorTexto}</p>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="mt-3 rounded bg-black px-4 py-2 text-white"
            >
              Cerrar sesión
            </button>
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por móvil"
            value={movilFiltro}
            onChange={(e) => setMovilFiltro(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <select
            value={turnoFiltro}
            onChange={(e) => setTurnoFiltro(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Filtrar por turno</option>
            <option value="diurno">Diurno</option>
            <option value="nocturno">Nocturno</option>
          </select>
        </div>

        <div className="mb-4">
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        {cargando ? (
          <p>Cargando cierres...</p>
        ) : cierresFiltrados.length === 0 ? (
          <p>No hay cierres cargados.</p>
        ) : (
          <div className="space-y-4">
            {cierresFiltrados.map((cierre) => (
              <Link key={cierre.id} href={`/admin/${cierre.id}`}>
                <div className="cursor-pointer rounded-xl border p-4 shadow-sm hover:shadow-md transition bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-semibold">{cierre.fecha}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-bold text-green-600">
                        ${cierre.total_entregar}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Móvil:</strong> {cierre.movil} |{" "}
                    <strong>Turno:</strong> {cierre.turno}
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    {new Date(cierre.created_at).toLocaleTimeString()}
                  </div>

                  {cierre.revisado ? (
                    <p className="mt-2 text-xs font-semibold text-green-600">
                      REVISADO
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();

                        const { error } = await supabase
                          .from("cierres")
                          .update({ revisado: true })
                          .eq("id", cierre.id);

                        if (!error) {
                          setCierres((prev) =>
                            prev.map((item) =>
                              item.id === cierre.id
                                ? { ...item, revisado: true }
                                : item
                            )
                          );
                        }
                      }}
                      className="mt-2 text-xs text-green-600"
                    >
                      Marcar como revisado
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}