import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { driverId, activo } = body;

    if (!driverId || typeof activo !== "boolean") {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

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

    const { data: driverProfile, error: driverProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id, cooperativa_id, role")
      .eq("id", driverId)
      .single();

    if (driverProfileError || !driverProfile) {
      return NextResponse.json(
        { error: "Chofer no encontrado" },
        { status: 404 }
      );
    }

    if (driverProfile.cooperativa_id !== adminProfile.cooperativa_id) {
      return NextResponse.json(
        { error: "No puedes modificar choferes de otra cooperativa" },
        { status: 403 }
      );
    }

    if (driverProfile.role !== "chofer") {
      return NextResponse.json(
        { error: "Solo se pueden modificar choferes" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ activo })
      .eq("id", driverId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error interno al actualizar chofer" },
      { status: 500 }
    );
  }
}