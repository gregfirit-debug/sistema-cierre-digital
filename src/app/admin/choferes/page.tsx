"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminChoferesPage() {
  const router = useRouter();

  const [numeroChofer, setNumeroChofer] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

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

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-xl border p-3"
          />

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
        </div>
      </div>
    </main>
  );
}