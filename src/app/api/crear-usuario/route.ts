import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "DEBUG API OK" },
    { status: 400 }
  );
}