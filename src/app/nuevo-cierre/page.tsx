"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NuevoCierrePage() {
  const router = useRouter();

  const [movil, setMovil] = useState("");
  const [turno, setTurno] = useState("");
  const [kmEntrada, setKmEntrada] = useState("");
  const [kmSalida, setKmSalida] = useState("");

  const [totalReloj, setTotalReloj] = useState("");
  const [totalPos, setTotalPos] = useState("");
  const [gastos, setGastos] = useState("");
  const [retiraChofer, setRetiraChofer] = useState("");

  const [fotoReloj, setFotoReloj] = useState<File | null>(null);
  const [fotoPos, setFotoPos] = useState<File | null>(null);

  const [previewReloj, setPreviewReloj] = useState("");
  const [previewPos, setPreviewPos] = useState("");

  const [paso, setPaso] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const totalRelojRef = useRef<HTMLInputElement>(null);
  const relojInputRef = useRef<HTMLInputElement>(null);
  const posInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paso !== 2) return;

    const id = window.setTimeout(() => {
      totalRelojRef.current?.focus();
      totalRelojRef.current?.select();
    }, 50);

    return () => window.clearTimeout(id);
  }, [paso]);

  const totalEntregar = useMemo(() => {
    const reloj = Number(totalReloj) || 0;
    const pos = Number(totalPos) || 0;
    const gastosNumero = Number(gastos) || 0;
    const retiraNumero = Number(retiraChofer) || 0;

    return reloj + pos - gastosNumero - retiraNumero;
  }, [totalReloj, totalPos, gastos, retiraChofer]);

  const limpiarFormulario = () => {
    setMovil("");
    setTurno("");
    setKmEntrada("");
    setKmSalida("");
    setTotalReloj("");
    setTotalPos("");
    setGastos("");
    setRetiraChofer("");
    setFotoReloj(null);
    setFotoPos(null);
    setPreviewReloj("");
    setPreviewPos("");
    setPaso(1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push("/login");
  };

  const handleVolverAtras = () => {
    if (guardando) return;

    if (paso === 1) {
      router.back();
      return;
    }

    setMensaje("");
    setPaso((prev) => prev - 1);
  };

  const subirArchivo = async (
    file: File,
    carpeta: "reloj" | "pos",
    userId: string
  ) => {
    const extension =
      file.name && file.name.includes(".")
        ? file.name.split(".").pop()?.toLowerCase()
        : "jpg";

    const extensionFinal = extension || "jpg";
    const nombre = `${Date.now()}-${carpeta}-${crypto.randomUUID()}.${extensionFinal}`;
    const ruta = `${userId}/${carpeta}/${nombre}`;

    const { error: uploadError } = await supabase.storage
      .from("cierres")
      .upload(ruta, file, {
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      throw new Error(`Error subiendo foto del ${carpeta}: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("cierres").getPublicUrl(ruta);
    return data.publicUrl;
  };

  const handleContinuarPaso1 = () => {
    setMensaje("");

    if (!movil || !turno || !kmEntrada || !kmSalida) {
      setMensaje("Completa todos los campos");
      return;
    }

    const kmIn = Number(kmEntrada);
    const kmOut = Number(kmSalida);

    if (Number.isNaN(kmIn) || Number.isNaN(kmOut)) {
      setMensaje("Los kilómetros deben ser números");
      return;
    }

    if (kmIn < 0 || kmOut < 0) {
      setMensaje("Los kilómetros no pueden ser negativos");
      return;
    }

    if (kmOut <= kmIn) {
      setMensaje("Km salida debe ser mayor que Km entrada");
      return;
    }

    setPaso(2);
  };

  const handleContinuarPaso2 = () => {
    setMensaje("");

    if (!totalReloj || !totalPos || !gastos || !retiraChofer) {
      setMensaje("Completa todos los campos");
      return;
    }

    const reloj = Number(totalReloj);
    const pos = Number(totalPos);
    const gastosNumero = Number(gastos);
    const retiraNumero = Number(retiraChofer);

    if (
      Number.isNaN(reloj) ||
      Number.isNaN(pos) ||
      Number.isNaN(gastosNumero) ||
      Number.isNaN(retiraNumero)
    ) {
      setMensaje("Recaudación, gastos y retiro deben ser números");
      return;
    }

    if (reloj < 0 || pos < 0 || gastosNumero < 0 || retiraNumero < 0) {
      setMensaje("Los importes no pueden ser negativos");
      return;
    }

    if (totalEntregar < 0) {
      setMensaje("El total a entregar no puede ser negativo");
      return;
    }

    setPaso(3);
  };

  const handleContinuarPaso3 = () => {
    setMensaje("");

    if (!fotoReloj || !fotoPos) {
      setMensaje("Debes cargar ambas fotos");
      return;
    }

    setPaso(4);
  };

  const handleGuardarCierre = async () => {
    if (guardando) return;

    setGuardando(true);
    setMensaje("Enviando a Central...");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMensaje("No hay usuario logueado");
        setGuardando(false);
        return;
      }

      const cooperativaId = localStorage.getItem("cooperativa_id");

      if (!cooperativaId) {
        setMensaje("No se encontró la cooperativa del usuario");
        setGuardando(false);
        return;
      }

      if (!fotoReloj || !fotoPos) {
        setMensaje("Debes cargar ambas fotos");
        setGuardando(false);
        return;
      }

      const fotoRelojUrl = await subirArchivo(fotoReloj, "reloj", user.id);
      const fotoPosUrl = await subirArchivo(fotoPos, "pos", user.id);

      const kmInicioNumero = Number(kmEntrada);
      const kmFinNumero = Number(kmSalida);
      const totalRelojNumero = Number(totalReloj);
      const totalPosNumero = Number(totalPos);
      const gastosNumero = Number(gastos);
      const retiraNumero = Number(retiraChofer);

   const { error: insertError } = await supabase.from("cierres").insert([
  {
    fecha: new Date().toISOString().slice(0, 10),
    chofer: user.email || "Chofer",
    movil,
    turno,
    km_inicio: kmInicioNumero,
    km_fin: kmFinNumero,
    km_total: kmFinNumero - kmInicioNumero,
    total_reloj: totalRelojNumero,
    total_tarjetas: totalPosNumero,
    gastos: gastosNumero,
    retira_chofer: retiraNumero,
    total_entregar:
      totalRelojNumero + totalPosNumero - gastosNumero - retiraNumero,
    foto_reloj_url: fotoRelojUrl,
    foto_pos_url: fotoPosUrl,
    user_id: user.id,
    cooperativa_id: cooperativaId,
  },
]);
     if (insertError) {
  console.error("INSERT ERROR REAL:", insertError);
  setMensaje(insertError.message || "Error al guardar cierre");
  setGuardando(false);
  return;
}
      limpiarFormulario();

      setTimeout(() => {
        setMensaje("Cierre enviado a Central correctamente");
      }, 100);

      setGuardando(false);
    } catch (error: any) {
      console.error("ERROR REAL:", error);
      setMensaje(error?.message || "Error al subir fotos o guardar cierre");
      setGuardando(false);
    }
  };

  const BarraSuperior = () => (
    <div className="mb-2 flex items-center justify-between">
      <button
        type="button"
        onClick={handleVolverAtras}
        disabled={guardando}
        className="px-1 text-xl leading-none text-gray-500 disabled:opacity-50"
        aria-label="Volver atrás"
        title="Volver atrás"
      >
        ←
      </button>

      <button
        type="button"
        onClick={handleLogout}
        disabled={guardando}
        className="text-sm font-semibold text-rose-400 disabled:opacity-50"
      >
        Cerrar sesión
      </button>
    </div>
  );

  if (paso === 4) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <BarraSuperior />

          <h1 className="mb-6 text-center text-xl font-bold">
            Revisar y confirmar
          </h1>

          <div className="space-y-3 text-sm">
            <p><strong>Móvil:</strong> {movil}</p>
            <p><strong>Turno:</strong> {turno}</p>
            <p><strong>Km entrada:</strong> {kmEntrada}</p>
            <p><strong>Km salida:</strong> {kmSalida}</p>
            <p><strong>Total reloj:</strong> {totalReloj}</p>
            <p><strong>Total POS:</strong> {totalPos}</p>
            <p><strong>Gastos:</strong> {gastos}</p>
            <p><strong>Retira chofer:</strong> {retiraChofer}</p>

            <div className="mt-2 rounded-xl bg-green-100 p-4">
              <p className="text-gray-600">Total a entregar</p>
              <p className="text-2xl font-bold text-green-700">
                ${totalEntregar}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuardarCierre}
            disabled={guardando}
            className="mt-6 w-full rounded-xl bg-yellow-400 p-3 font-semibold text-black disabled:opacity-60"
          >
            {guardando ? "ENVIANDO A CENTRAL..." : "CONFIRMAR CIERRE"}
          </button>

          {mensaje && (
            <p className="mt-3 text-center text-sm text-rose-400">{mensaje}</p>
          )}
        </div>
      </main>
    );
  }

  if (paso === 3) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <BarraSuperior />

          <h1 className="mb-6 text-center text-xl font-bold">
            Fotos de respaldo
          </h1>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-gray-500">Foto del reloj</p>

              <input
                ref={relojInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFotoReloj(file);
                  setPreviewReloj(file ? URL.createObjectURL(file) : "");
                }}
              />

              <button
                type="button"
                onClick={() => relojInputRef.current?.click()}
                className="w-full rounded-xl bg-yellow-400 p-3 font-semibold text-black"
              >
                TOMAR FOTO DEL RELOJ
              </button>

              {previewReloj && (
                <img
                  src={previewReloj}
                  alt="Preview reloj"
                  className="mt-2 w-full rounded-xl"
                />
              )}
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-500">Foto del POS</p>

              <input
                ref={posInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFotoPos(file);
                  setPreviewPos(file ? URL.createObjectURL(file) : "");
                }}
              />

              <button
                type="button"
                onClick={() => posInputRef.current?.click()}
                className="w-full rounded-xl bg-yellow-400 p-3 font-semibold text-black"
              >
                TOMAR FOTO DEL POS
              </button>

              {previewPos && (
                <img
                  src={previewPos}
                  alt="Preview pos"
                  className="mt-2 w-full rounded-xl"
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleContinuarPaso3}
              className="w-full rounded-xl bg-black p-3 text-white"
            >
              CONTINUAR
            </button>

            {mensaje && (
              <p className="text-center text-sm text-rose-400">{mensaje}</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (paso === 2) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <BarraSuperior />

          <h1 className="mb-6 text-center text-xl font-bold">Recaudación</h1>

          <div className="space-y-4">
            <input
              ref={totalRelojRef}
              type="number"
              inputMode="numeric"
              value={totalReloj}
              onChange={(e) => setTotalReloj(e.target.value)}
              placeholder="Total reloj"
              className="w-full rounded-xl border p-3"
            />

            <input
              type="number"
              inputMode="numeric"
              value={totalPos}
              onChange={(e) => setTotalPos(e.target.value)}
              placeholder="Total POS"
              className="w-full rounded-xl border p-3"
            />

            <input
              type="number"
              inputMode="numeric"
              value={gastos}
              onChange={(e) => setGastos(e.target.value)}
              placeholder="Gastos"
              className="w-full rounded-xl border p-3"
            />

            <input
              type="number"
              inputMode="numeric"
              value={retiraChofer}
              onChange={(e) => setRetiraChofer(e.target.value)}
              placeholder="Retira chofer"
              className="w-full rounded-xl border p-3"
            />

            <button
              type="button"
              onClick={handleContinuarPaso2}
              className="w-full rounded-xl bg-yellow-400 p-3"
            >
              CONTINUAR
            </button>

            {mensaje && (
              <p className="text-center text-sm text-rose-400">{mensaje}</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <BarraSuperior />

        <h1 className="mb-6 text-center text-xl font-bold">
          Inicio del cierre
        </h1>

        <div className="space-y-4">
          <input
            value={movil}
            onChange={(e) => setMovil(e.target.value)}
            placeholder="Movil"
            className="w-full rounded-xl border p-3"
          />

          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="w-full rounded-xl border p-3"
          >
            <option value="">Turno</option>
            <option value="diurno">Diurno</option>
            <option value="nocturno">Nocturno</option>
          </select>

          <input
            type="number"
            inputMode="numeric"
            value={kmEntrada}
            onChange={(e) => setKmEntrada(e.target.value)}
            placeholder="Km entrada"
            className="w-full rounded-xl border p-3"
          />

          <input
            type="number"
            inputMode="numeric"
            value={kmSalida}
            onChange={(e) => setKmSalida(e.target.value)}
            placeholder="Km salida"
            className="w-full rounded-xl border p-3"
          />

          <button
            type="button"
            onClick={handleContinuarPaso1}
            className="w-full rounded-xl bg-yellow-400 p-3"
          >
            CONTINUAR
          </button>

          {mensaje && (
            <p className="text-center text-sm text-rose-400">{mensaje}</p>
          )}
        </div>
      </div>
    </main>
  );
}