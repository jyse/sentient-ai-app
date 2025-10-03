import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(req: Request) {
  const { text } = await req.json();

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy", // try: "verse", "sage", etc.
    input: text
  });

  const arrayBuffer = await response.arrayBuffer();
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "audio/mpeg"
    }
  });
}
