import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ---- Types ----
type MatchChunkRow = {
  id: string;
  text: string;
  current_emotion: string;
  target_emotion: string;
  distance: number;
};

export type MeditationTheme = {
  duration?: number;
  color?: string;
  [key: string]: string | number | undefined;
};

export type MeditationPhase = {
  phase: string;
  text: string;
  theme?: MeditationTheme;
};

type GenerateBody = {
  currentEmotion: string;
  targetEmotion: string | null;
  note?: string | null;
};

// ---- Clients ----
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ---- Route ----
export async function POST(req: Request) {
  try {
    const { currentEmotion, targetEmotion, note }: GenerateBody =
      await req.json();

    if (!currentEmotion || !targetEmotion) {
      return NextResponse.json(
        { error: "currentEmotion and targetEmotion are required" },
        { status: 400 }
      );
    }

    // 1) Embed the journey query
    const embedRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: `${currentEmotion} ${targetEmotion}`
    });
    const queryEmbedding = embedRes.data[0].embedding;

    // 2) Retrieve best-matching chunks via RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "match_chunks",
      {
        query_embedding: queryEmbedding,
        in_current: currentEmotion,
        in_target: targetEmotion,
        match_count: 10
      }
    );
    if (rpcError) {
      console.error("Supabase RPC error:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }
    const chunks: MatchChunkRow[] = (rpcData as MatchChunkRow[]) ?? [];

    // 3) Build a strict system + user prompt
    const inspirations =
      chunks.length > 0
        ? chunks
            .map(
              (c) => `- (${c.current_emotion}→${c.target_emotion}) ${c.text}`
            )
            .join("\n")
        : "- (no inspiration found; write a gentle generic meditation)";

    const system = `
You are a safe, supportive meditation guide.

Write a guided meditation in exactly 6 phases:
1. Awareness – acknowledge the current emotion with gentle observation.
2. Acceptance – normalize and validate the feeling.
3. Processing – introduce one technique (breathing, grounding, or body scan).
4. Reframing – gently offer a new perspective, no toxic positivity.
5. Integration – invite the target emotion to grow naturally.
6. Maintenance – suggest a simple way to carry it into daily life.

Requirements:
- Each phase should last 30 seconds when read aloud. 
- Tone: warm, compassionate, clear. No medical/therapeutic claims.
- Use the "inspiration lines" as raw material; adapt rather than copy.
- Personalize lightly using the user's note if present.
- Return ONLY a JSON array of 6 items with keys "phase" and "text".
- Output ONLY a valid JSON array. Do not include markdown, code fences, or explanations. 
`;

    const user = `
Current emotion: ${currentEmotion}
Target emotion: ${targetEmotion}
User note: ${note || "(none)"}

Inspiration lines:
${inspirations}
`;

    // 4) Generate JSON phases
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    let raw = completion.choices[0].message?.content || "[]";

    // Strip Markdown code fences if present
    raw = raw.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/```json\n?/, "").replace(/```$/, "");
    }

    let meditation: MeditationPhase[] = [];
    try {
      meditation = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse meditation JSON:", err, raw);
    }

    // 5) Validate shape: must be an array of 6 phases
    if (!Array.isArray(meditation) || meditation.length !== 6) {
      return NextResponse.json(
        { error: "AI did not return 6 phases", raw },
        { status: 502 }
      );
    }

    // Optional runtime guard (light):
    const phases = (meditation as MeditationPhase[]).map((p, i) => ({
      phase: typeof p.phase === "string" ? p.phase : `Phase ${i + 1}`,
      text: typeof p.text === "string" ? p.text : "",
      theme: { duration: 30 }
    }));

    return NextResponse.json(phases);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("generate/POST error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
