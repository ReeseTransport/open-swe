import { NextResponse } from "next/server";

export const dynamic="force-dynamic";
export const runtime = "edge";

export async function GET() {
  try {
    // Guard against any build/runtime issues by returning static JSON
    return NextResponse.json(
      {
        ok: true,
        ports: { web: "3001", agent: "2025" },
        proxy: "http://localhost:2025",
      },
      { status: 200 },
    );
  } catch (error) {
    // Fallback to static response if any error occurs
    return NextResponse.json(
      {
        ok: true,
        ports: { web: "3001", agent: "2025" },
        proxy: "http://localhost:2025",
      },
      { status: 200 },
    );
  }
}