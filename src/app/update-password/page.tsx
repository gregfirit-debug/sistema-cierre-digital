"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleUpdatePassword = async () => {
    setMensaje("");

    if (!password) {
      setMensaje("Ingresá una nueva contraseña");
      return;
    }

    if (password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setGuardando(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMensaje(error.message);
      setGuardando(false);
      return;
    }

    setMensaje("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Nueva contraseña</h1>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            ← Volver
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            onClick={handleUpdatePassword}
            disabled={guardando}
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Actualizar contraseña"}
          </button>

          {mensaje && (
            <p className="text-center text-sm text-gray-700">{mensaje}</p>
          )}
        </div>
      </div>
    </main>
  );
}