import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
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

    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, role, activo, cooperativa_id, numero_chofer")
      .eq("cooperativa_id", adminProfile.cooperativa_id);

    if (profilesError) {
      return NextResponse.json(
        { error: profilesError.message },
        { status: 400 }
      );
    }

    const choferesActivos = (profilesData || []).filter(
  (p) =>
    p.role === "chofer" &&
    p.numero_chofer &&
    p.activo !== false
);

    return NextResponse.json({
      choferesActivos,
      cantidadChoferesActivos: choferesActivos.length,
      maxChoferes: cooperativa.max_choferes || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error interno al cargar choferes" },
      { status: 500 }
    );
  }
}