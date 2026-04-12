import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAuthCheck = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseAuthCheck.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
      .from("profiles")
      .select("cooperativa_id, role")
      .eq("id", user.id)
      .single();

    if (
      adminProfileError ||
      !adminProfile ||
      (adminProfile.role !== "admin" && adminProfile.role !== "administrador")
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data: cooperativa, error: cooperativaError } = await supabaseAdmin
      .from("cooperativas")
      .select("max_choferes")
      .eq("id", adminProfile.cooperativa_id)
      .single();

    if (cooperativaError || !cooperativa) {
      return NextResponse.json(
        { error: "No se encontró cooperativa" },
        { status: 400 }
      );
    }

    const { data: choferesData, error: choferesError } = await supabaseAdmin
      .from("profiles")
      .select("id, role, activo")
      .eq("cooperativa_id", adminProfile.cooperativa_id);

    if (choferesError) {
      return NextResponse.json(
        { error: "No se pudo contar choferes" },
        { status: 400 }
      );
    }

 const activos = (choferesData || []).filter(
  (p) =>
    p.role === "chofer" &&
    p.numero_chofer &&
    p.activo !== false
).length;

    if (cooperativa.max_choferes && activos >= cooperativa.max_choferes) {
      return NextResponse.json(
        { error: "Límite de choferes alcanzado" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const numeroChofer = String(body.numeroChofer || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!numeroChofer || !email || !password) {
      return NextResponse.json(
        { error: "Completa todos los campos" },
        { status: 400 }
      );
    }

    const { data: existingNumber, error: existingNumberError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("cooperativa_id", adminProfile.cooperativa_id)
        .eq("numero_chofer", numeroChofer)
        .maybeSingle();

    if (existingNumberError) {
      return NextResponse.json(
        { error: "No se pudo validar número de chofer" },
        { status: 400 }
      );
    }

    if (existingNumber) {
      return NextResponse.json(
        { error: "Ese número de chofer ya existe" },
        { status: 400 }
      );
    }

    const { data: newUserData, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createUserError || !newUserData.user) {
      return NextResponse.json(
        { error: createUserError?.message || "No se pudo crear usuario" },
        { status: 400 }
      );
    }
console.log("INSERTANDO PERFIL:", {
  id: newUserData.user.id,
  cooperativa_id: adminProfile.cooperativa_id,
  role: "chofer",
  activo: true,
  numero_chofer: numeroChofer,
});
    const { error: insertProfileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: newUserData.user.id,
          cooperativa_id: adminProfile.cooperativa_id,
          role: "chofer",
          activo: true,
          numero_chofer: numeroChofer,
        },
      ]);

    if (insertProfileError) {
      return NextResponse.json(
        { error: insertProfileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Error interno al crear chofer" },
      { status: 500 }
    );
  }
}