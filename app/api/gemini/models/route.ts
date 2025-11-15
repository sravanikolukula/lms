import { NextResponse } from "next/server";
import { listAvailableModels } from "../../../../lib/gemini";

export async function GET() {
  try {
    const data = await listAvailableModels();
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("/api/gemini/models error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error listing models" },
      { status: 500 }
    );
  }
}
