import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, cooperativa_id } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("cooperativa_id", cooperativa_id);

    const { data: cooperativa } = await supabaseAdmin
      .from("cooperativas")
      .select("max_usuarios")
      .eq("id", cooperativa_id)
      .single();

    if (!cooperativa) {
      return NextResponse.json(
        { error: "No se encontró la cooperativa" },
        { status: 400 }
      );
    }

    if ((count || 0) >= cooperativa.max_usuarios) {
      return NextResponse.json(
        { error: "Límite de usuarios alcanzado" },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: userId,
          cooperativa_id,
          role: "chofer",
        },
      ]);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}