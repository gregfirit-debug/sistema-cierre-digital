"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleResetPassword = async () => {
    setMensaje("");

    if (!email) {
      setMensaje("Ingresá tu email");
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMensaje(error.message);
      setCargando(false);
      return;
    }

    setMensaje("Te enviamos un correo para restablecer la contraseña.");
    setCargando(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Recuperar contraseña</h1>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            ← Volver
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border p-3"
          />

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={cargando}
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white disabled:opacity-60"
          >
            {cargando ? "Enviando..." : "Enviar correo de recuperación"}
          </button>

          {mensaje && (
            <p className="text-center text-sm text-gray-700">{mensaje}</p>
          )}
        </div>
      </div>
    </main>
  );
}