"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ChoferActivo = {
  id: string;
  role: string;
  activo: boolean;
  cooperativa_id: string;
  numero_chofer: string | null;
};

export default function AdminChoferesPage() {
  const router = useRouter();

  const [numeroChofer, setNumeroChofer] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [choferes, setChoferes] = useState<ChoferActivo[]>([]);
  const [cargandoChoferes, setCargandoChoferes] = useState(true);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [actualizandoChoferId, setActualizandoChoferId] = useState<string | null>(null);

  const cargarChoferes = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMensaje("Sesión inválida");
        setCargandoChoferes(false);
        return;
      }

      const res = await fetch("/api/admin/drivers", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        setMensaje(json.error || "Error al cargar choferes");
        setCargandoChoferes(false);
        return;
      }

   setChoferes(json.choferes || []);
      setCargandoChoferes(false);
    } catch {
      setMensaje("Error al cargar choferes");
      setCargandoChoferes(false);
    }
  };

  useEffect(() => {
    cargarChoferes();
  }, []);

  const handleCrearChofer = async () => {
    if (guardando) return;

    setMensaje("");

    if (!numeroChofer || !email || !password) {
      setMensaje("Completa todos los campos");
      return;
    }

    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMensaje("Sesión inválida");
        setGuardando(false);
        return;
      }

      const res = await fetch("/api/admin/create-driver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          numeroChofer,
          email,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMensaje(json.error || "Error al crear chofer");
        setGuardando(false);
        return;
      }

      router.push("/admin");
    } catch {
      setMensaje("Error al crear chofer");
      setGuardando(false);
    }
  };

  const handleToggleChofer = async (driverId: string, activo: boolean) => {
    setMensaje("");
    setActualizandoChoferId(driverId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMensaje("Sesión inválida");
        setActualizandoChoferId(null);
        return;
      }

      const res = await fetch("/api/admin/toggle-driver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          driverId,
          activo,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMensaje(json.error || "Error al actualizar chofer");
        setActualizandoChoferId(null);
        return;
      }

      await cargarChoferes();
    } catch {
      setMensaje("Error al actualizar chofer");
    } finally {
      setActualizandoChoferId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Agregar chofer</h1>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            ← Volver
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={numeroChofer}
            onChange={(e) => setNumeroChofer(e.target.value)}
            placeholder="Número de chofer"
            className="w-full rounded-xl border p-3"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border p-3"
          />

          <div className="flex gap-2">
            <input
              type={mostrarPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-xl border p-3"
            />

            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="rounded-xl bg-gray-200 px-3 text-sm font-semibold"
            >
              {mostrarPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCrearChofer}
            disabled={guardando}
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white disabled:opacity-60"
          >
            {guardando ? "Creando..." : "Crear chofer"}
          </button>

          {mensaje && (
            <p className="text-center text-sm text-red-500">{mensaje}</p>
          )}

          <div className="mt-6 border-t pt-4">
         <div className="mb-3 flex items-center justify-between">
  <h2 className="text-lg font-semibold">Choferes</h2>

  <button
    type="button"
    onClick={() => setMostrarInactivos(!mostrarInactivos)}
    className="text-sm font-semibold text-blue-600"
  >
    {mostrarInactivos ? "Ocultar inactivos" : "Mostrar inactivos"}
  </button>
</div>

            {cargandoChoferes ? (
              <p className="text-sm text-gray-500">Cargando choferes...</p>
            ) : choferes.length === 0 ? (
              <p className="text-sm text-gray-500">No hay choferes activos.</p>
            ) : (
              <div className="space-y-2">
          {choferes
  .filter((chofer) => mostrarInactivos || chofer.activo)
  .map((chofer) => (
                  <div
                    key={chofer.id}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        Chofer: {chofer.numero_chofer || "Sin número"}
                      </p>
                     <div
  className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
    chofer.activo
      ? "bg-blue-300 text-green-700"
      : "bg-gray-200 text-gray-600"
  }`}
>
  {chofer.activo ? "Activo" : "Inactivo"}
</div> 
                    </div>

                    
                    <button
  type="button"
  disabled={actualizandoChoferId === chofer.id}
  onClick={() =>
    handleToggleChofer(chofer.id, !chofer.activo)
  }
  className={`rounded-lg px-3 py-1 text-xs font-semibold transition disabled:opacity-60 ${
    chofer.activo
      ? "bg-red-400 text-black-700 hover:bg-red-200"
      : "bg-blue-300 text-green-700 hover:bg-green-200"
  }`}
> 
                    
                      {actualizandoChoferId === chofer.id
                        ? "Actualizando..."
                        : chofer.activo
                        ? "Desactivar"
                        : "Reactivar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}