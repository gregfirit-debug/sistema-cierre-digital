"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminUsuariosPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const crearUsuario = async () => {
    setMensaje("Creando...");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setMensaje("No hay usuario logueado");
      return;
    }

   const { data: profile } = await supabase
  .from("profiles")
  .select("cooperativa_id")
 .eq("id", userData.user.id)
  .single();

if (!profile) {
  setMensaje("No se encontró el profile");
  return;
}

const { count } = await supabase
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("cooperativa_id", profile.cooperativa_id);

const { data: cooperativa } = await supabase
  .from("cooperativas")
  .select("max_usuarios")
  .eq("id", profile.cooperativa_id)
  .single();

if (!cooperativa) {
  setMensaje("No se encontró la cooperativa");
  return;
}

if ((count || 0) >= cooperativa.max_usuarios) {
  setMensaje("Límite de usuarios alcanzado");
  return;
}

const res = await fetch("/api/crear-usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        cooperativa_id: profile.cooperativa_id,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setMensaje(data.error);
    } else {
      setMensaje("Usuario creado");
      alert("Usuario creado correctamente");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold mb-6">Crear usuario</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-3"
        />

        <button
          onClick={crearUsuario}
          className="w-full bg-black text-white p-2"
        >
          Crear usuario
        </button>

        {mensaje && <p className="mt-4">{mensaje}</p>}
      </div>
    </main>
  );
}