import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://accounts.google.com/.well-known/openid-configuration", { cache: "no-store" });
    const json = await res.json();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      issuer: json?.issuer ?? null,
      authorization_endpoint: json?.authorization_endpoint ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 },
    );
  }
}
