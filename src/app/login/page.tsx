"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setMensaje("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setMensaje("Error: " + (error?.message || "No user"));
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, cooperativa_id")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      setMensaje("No se encontró el perfil");
      return;
    }

    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem("user_email", data.user.email || "");
    localStorage.setItem("cooperativa_id", profile.cooperativa_id || "");
    localStorage.setItem("role", profile.role || "");

    if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/nuevo-cierre");
    }
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

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3"
        />

        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-black text-white p-3 rounded-xl"
        >
          Entrar
        </button>

        {mensaje && (
          <p className="mt-3 text-center text-red-500">{mensaje}</p>
        )}
      </div>
    </main>
  );
}