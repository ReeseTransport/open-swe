import { NextResponse } from "next/server";
import { validateWebEnv } from "@/lib/env-validation";

export const runtime = "edge";

export async function GET() {
  const result = validateWebEnv();

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, missing: result.missing, invalid: result.invalid },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      ports: { web: result.details?.port ?? "3001", agent: "2025" },
      proxy: result.details?.proxyUrl ?? "http://localhost:2025",
    },
    { status: 200 },
  );
}