"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (cargando) return;

    setMensaje("");
    setCargando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setMensaje("Error de acceso");
      setCargando(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, cooperativa_id")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      setMensaje("No se encontró el perfil");
      setCargando(false);
      return;
    }

    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem("cooperativa_id", profile.cooperativa_id || "");
    localStorage.setItem("role", profile.role || "");

   if (profile.role === "admin" || profile.role === "administrador") {
      router.push("/admin");
    } else {
      router.push("/nuevo-cierre");
    }

    setCargando(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">
          Iniciar sesión
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3"
        />

       <div className="flex gap-2 mb-3">
  <input
    type={mostrarPassword ? "text" : "password"}
    placeholder="Contraseña"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full border rounded-xl p-3"
  />
<p className="mb-3 text-right text-sm">
  <button
    type="button"
    onClick={() => router.push("/forgot-password")}
    className="text-blue-600 hover:underline"
  >
    Olvidé mi contraseña
  </button>
</p>
  <button
    type="button"
    onClick={() => setMostrarPassword(!mostrarPassword)}
    className="rounded-xl bg-gray-200 px-3 text-sm font-semibold"
  >
    {mostrarPassword ? "Ocultar" : "Mostrar"}
  </button>
</div>

        <button
          onClick={handleLogin}
          disabled={cargando}
          className="w-full bg-black text-white p-3 rounded-xl"
        >
          {cargando ? "Entrando..." : "Entrar"}
        </button>

        {mensaje && (
          <p className="mt-3 text-center text-red-500">{mensaje}</p>
        )}
      </div>
    </main>
  );
}