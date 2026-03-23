import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const language = formData.get("language") as string || '';

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqOptions: any = {
      file: file,
      model: "whisper-1",
    };
    
    // Pass language to Whisper to improve accuracy if known, else let it auto-detect Indian dialects.
    if (language && language !== 'auto') {
        reqOptions.language = language;
    }

    const transcription = await openai.audio.transcriptions.create(reqOptions);

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("STT Error:", error);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
  }
}
