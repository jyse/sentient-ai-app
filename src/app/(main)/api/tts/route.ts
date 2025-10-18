import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const BUCKET = "sentient-audio";
const SIGN_URL_SECONDS = 60 * 60;

type TtsBody = {
  text?: string;
  as?: "stream" | "upload";
  entryId?: string;
  phaseIndex?: number;
  voice?: string;
  model?: string;
};

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    // ✅ Create clients inside the function
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Server storage not configured" },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const body = (await req.json()) as TtsBody;

    const text = (body.text || "").trim();
    const as = body.as || "stream";
    const voice = body.voice || "alloy";
    const model = body.model || "gpt-4o-mini-tts";

    if (!text) return badRequest("text is required");
    if (text.length > 2000) return badRequest("text too long (2000 chars max)");

    const speech = await openai.audio.speech.create({
      model,
      voice,
      input: text
    });

    const arrayBuffer = await speech.arrayBuffer();

    if (as === "stream") {
      return new Response(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store"
        }
      });
    }

    const entryId = (body.entryId || "").trim();
    if (!entryId) return badRequest("entryId is required when as='upload'");

    const idx = body.phaseIndex;
    if (idx === undefined || idx === null || idx < 0)
      return badRequest("phaseIndex (0-based) is required when as='upload'");

    const path = `tts/${entryId}/phase-${idx + 1}.mp3`;
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: "audio/mpeg", upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGN_URL_SECONDS);

    if (signError || !signed?.signedUrl) {
      return NextResponse.json(
        { error: `Signing failed: ${signError?.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { signedUrl: signed.signedUrl, path },
      { status: 200 }
    );
  } catch (err) {
    console.error("tts route error:", err);

    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
