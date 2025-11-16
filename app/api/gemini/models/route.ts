// import { NextResponse } from "next/server";
// import { listAvailableModels } from "../../../../lib/gemini";

// export async function GET() {
//   try {
//     const data = await listAvailableModels();
//     return NextResponse.json({ ok: true, data });
//   } catch (err: any) {
//     console.error("/api/gemini/models error:", err);
//     return NextResponse.json(
//       { ok: false, error: err?.message || "Unknown error listing models" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { listAvailableModels } from "@/lib/gemini"; // make sure path is correct

export async function GET(): Promise<NextResponse> {
  try {
    const data = await listAvailableModels();

    return NextResponse.json({
      ok: true,
      models: data,
    });
  } catch (error) {
    console.error("[GEMINI_MODELS_ERROR]", error);

    const message =
      error instanceof Error ? error.message : "Unknown error listing models";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

