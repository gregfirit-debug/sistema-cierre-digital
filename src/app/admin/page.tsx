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
console.log("USER:", userData);

if (!userData.user) {
  router.push("/login");
  return;
}   
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("cooperativa_id")
  .eq("id", userData.user.id)
  .single();

if (profileError) {
  setErrorTexto("Error profile: " + profileError.message);
  setCargando(false);
  return;
}

if (!profile) {
  setErrorTexto("Profile vacío");
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

setErrorTexto("Valor de activa: " + String(cooperativa.activa));
setCargando(false);
return;
      const { data, error } = await supabase
        .from("cierres")
        .select("id, fecha, chofer, movil, turno, total_entregar, created_at")
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

  const cierresFiltrados = cierres.filter(
    (cierre) =>
      cierre.movil.toLowerCase().includes(movilFiltro.toLowerCase()) &&
      cierre.turno.toLowerCase().includes(turnoFiltro.toLowerCase()) &&
      (fechaFiltro === "" || cierre.fecha === fechaFiltro)
  );

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">PANEL ADMIN NUEVO</h1>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/nuevo-cierre")}
              className="rounded bg-green-600 px-4 py-2 text-white"
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
            Error: {errorTexto}
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
          <input
            type="text"
            placeholder="Filtrar por turno"
            value={turnoFiltro}
            onChange={(e) => setTurnoFiltro(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
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
                <div className="cursor-pointer rounded border p-4 shadow-sm hover:bg-gray-50">
                  <p><strong>Fecha:</strong> {cierre.fecha}</p>
                  <p><strong>Chofer:</strong> {cierre.chofer}</p>
                  <p><strong>Móvil:</strong> {cierre.movil}</p>
                  <p><strong>Turno:</strong> {cierre.turno}</p>
                  <p>
                    <strong>Hora de carga:</strong>{" "}
                    {new Date(cierre.created_at).toLocaleTimeString()}
                  </p>
                  <p><strong>Total a entregar:</strong> {cierre.total_entregar}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}