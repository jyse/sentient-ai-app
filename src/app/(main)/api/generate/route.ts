import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server key
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(req: Request) {
  const { currentEmotion, targetEmotion, note } = await req.json();

  // 1. Embed query (current + target)
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: `${currentEmotion} ${targetEmotion}`
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // 2. Retrieve top chunks with RPC
  const { data: chunks, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    in_current: currentEmotion,
    in_target: targetEmotion,
    match_count: 5
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. Build system prompt
  const systemPrompt = `
You are a safe meditation guide. 
Always create a meditation in 6 phases:
1. Awareness – acknowledge current emotion
2. Acceptance – normalize it
3. Processing – introduce a technique (breathing, grounding, body scan)
4. Reframing – shift perspective
5. Integration – bring in target emotion
6. Maintenance – carry it into daily life

User feels: ${currentEmotion}
They want to move toward: ${targetEmotion}
User note: ${note}

Relevant inspiration:
${chunks?.map((c: any) => `- ${c.text}`).join("\n")}
  
Expand each phase into 2–4 sentences.
Output JSON array like:
[{ "phase": "Awareness", "text": "..." }, ...]
`;

  // 4. Generate with GPT
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }],
    response_format: { type: "json" }
  });

  const meditation = JSON.parse(completion.choices[0].message?.content || "[]");

  // 5. Return meditation JSON
  return NextResponse.json(meditation);
}
