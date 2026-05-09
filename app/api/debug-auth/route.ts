import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return NextResponse.json({
    env: {
      AUTH_GOOGLE_ID: Boolean(process.env.AUTH_GOOGLE_ID),
      AUTH_GOOGLE_SECRET: Boolean(process.env.AUTH_GOOGLE_SECRET),
      AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    },
    expectedGoogleRedirectUri: `${baseUrl}/api/auth/callback/google`,
    expectedOrigin: baseUrl,
  });
}
