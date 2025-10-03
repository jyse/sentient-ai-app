import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server key, not anon
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function main() {
  const { data: rows, error } = await supabase
    .from("content_chunks")
    .select("id, text")
    .is("embedding", null)
    .limit(1000);

  if (error) throw error;

  for (const row of rows ?? []) {
    const e = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: row.text
    });
    const vec = e.data[0].embedding;
    const { error: upErr } = await supabase
      .from("content_chunks")
      .update({ embedding: vec })
      .eq("id", row.id);

    if (upErr) throw upErr;
  }

  console.log("✅ All embeddings updated!");
}

main().catch(console.error);
