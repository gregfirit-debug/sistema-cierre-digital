"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Cierre = {
  id: string;
  fecha: string;
  chofer: string;
  numero_chofer: string;
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

const cantidadDiurno = cierres.filter((c) =>
  String(c.turno || "").toLowerCase().includes("diurno")
).length;
const cantidadRevisados = cierres.filter((c) => c.revisado).length;

const cantidadPendientes = cierres.filter((c) => !c.revisado).length;
const cantidadNocturno = cierres.filter((c) =>
  String(c.turno || "").toLowerCase().includes("nocturno")
).length;

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
        setErrorTexto("Error al cargar perfil");
        setCargando(false);
        return;
      }

      if (!profile) {
        setErrorTexto("No se encontró perfil");
        setCargando(false);
        return;
      }

      const { data: cooperativa, error: cooperativaError } = await supabase
        .from("cooperativas")
        .select("activa")
        .eq("id", profile.cooperativa_id)
        .single();

      if (cooperativaError || !cooperativa) {
        setErrorTexto("No se encontró la cooperativa");
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from("cierres")
        .select(
          "id, fecha, chofer, numero_chofer, movil, turno, total_entregar, created_at, revisado"
        )
     .order("revisado", { ascending: true })
.order("created_at", { ascending: false });

      if (error) {
        setErrorTexto("Error al cargar cierres");
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
      filtroTurno === "" || turnoTexto.startsWith(filtroTurno);
    const coincideFecha = fechaFiltro === "" || cierre.fecha === fechaFiltro;

    return coincideMovil && coincideTurno && coincideFecha;
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel admin</h1>
              <p className="text-sm text-gray-500">
                Cierres enviados a Central
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/nuevo-cierre")}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Nuevo cierre
              </button>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {errorTexto && (
          <div className="mb-4 rounded-xl bg-red-100 p-3 text-sm text-red-900">
            {errorTexto}
          </div>
        )}
<div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">

  <div className="rounded-2xl bg-white p-4 shadow-sm border">
    <p className="text-xs uppercase tracking-wide text-gray-400">
      Total
    </p>
    <p className="mt-1 text-2xl font-bold">
      {cierres.length}
    </p>
  </div>

  <div className="rounded-2xl bg-yellow-50 p-4 shadow-sm border">
    <p className="text-xs uppercase tracking-wide text-yellow-600">
      Diurnos
    </p>
    <p className="mt-1 text-2xl font-bold text-yellow-700">
      {cantidadDiurno}
    </p>
  </div>

  <div className="rounded-2xl bg-blue-50 p-4 shadow-sm border">
    <p className="text-xs uppercase tracking-wide text-blue-600">
      Nocturnos
    </p>
    <p className="mt-1 text-2xl font-bold text-blue-700">
      {cantidadNocturno}
    </p>
  </div>

  <div className="rounded-2xl bg-green-50 p-4 shadow-sm border">
    <p className="text-xs uppercase tracking-wide text-green-600">
      Revisados
    </p>
    <p className="mt-1 text-2xl font-bold text-green-700">
      {cantidadRevisados}
    </p>
  </div>

  <div className="rounded-2xl bg-red-50 p-4 shadow-sm border">
    <p className="text-xs uppercase tracking-wide text-red-600">
      Pendientes
    </p>
    <p className="mt-1 text-2xl font-bold text-red-700">
      {cantidadPendientes}
    </p>
  </div>

</div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="Filtrar por móvil"
            value={movilFiltro}
            onChange={(e) => setMovilFiltro(e.target.value)}
            className="w-full rounded-xl border bg-white px-3 py-2"
          />

          <select
            value={turnoFiltro}
            onChange={(e) => setTurnoFiltro(e.target.value)}
            className="w-full rounded-xl border bg-white px-3 py-2"
          >
    <option value="">Filtrar por turno</option>     
<option value="diurno">Diurno ({cantidadDiurno})</option>
<option value="nocturno">Nocturno ({cantidadNocturno})</option> 
          </select>

          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="w-full rounded-xl border bg-white px-3 py-2"
          />
        </div>

        {cargando ? (
          <p className="text-sm text-gray-600">Cargando cierres...</p>
        ) : cierresFiltrados.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No hay cierres cargados.
          </div>
        ) : (
          <div className="space-y-3">
            {cierresFiltrados.map((cierre) => (
              <Link key={cierre.id} href={`/admin/${cierre.id}`}>
                <div className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Fecha
                      </p>
                      <p className="text-lg font-bold">{cierre.fecha}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Total
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        ${cierre.total_entregar}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    <strong>Chofer:</strong> {cierre.numero_chofer} |{" "}
                    <strong>Móvil:</strong> {cierre.movil} |{" "}
                    <strong>Turno:</strong> {cierre.turno}
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    {new Date(cierre.created_at).toLocaleTimeString()}
                  </div>

                  <div className="mt-3">
                    {cierre.revisado ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        REVISADO
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                        PENDIENTE
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}