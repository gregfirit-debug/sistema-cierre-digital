"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
const router = useRouter();
  const iniciarSesion = async () => {
    setMensaje("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMensaje("Error: " + error.message);
      return;
    }

    router.push("/admin");
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Iniciar sesión</h1>

        {mensaje && (
          <div className="mb-4 rounded bg-green-200 p-3 text-center text-green-900">
            {mensaje}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={iniciarSesion}
            className="w-full rounded bg-black px-4 py-2 text-white"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}