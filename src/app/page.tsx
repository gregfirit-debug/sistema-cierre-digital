"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [mensaje, setMensaje] = useState("");

  const probarConexion = async () => {
    const { error } = await supabase.from("cierres").select("*").limit(1);

    if (error) {
      setMensaje("Error de conexión: " + error.message);
      return;
    }

    setMensaje("Conexión con Supabase OK");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-center text-2xl font-bold">
        Sistema de cierre digital de turnos
      </h1>

      <button
        onClick={probarConexion}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Probar conexión
      </button>

      {mensaje && <p className="text-center">{mensaje}</p>}
    </main>
  );
}