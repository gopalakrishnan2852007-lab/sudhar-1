import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import schemes from '@/data/schemes.json';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { message, language } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = `You are SETU, a helpful, deeply empathetic AI liaison for Indian citizens interacting with government services. You act as a 'wise, helpful grandson' to the user (often an older adult or farmer). You must reply in ${language || 'English'}. The user might speak Hinglish, Tanglish, or dialects. ALWAYS break down the user's request into actionable visual steps instead of a wall of text.
    Return ONLY a JSON array of objects with the structure: [{ "step": number, "title": "string", "description": "string" }].
    Use this knowledge base if relevant: ${JSON.stringify(schemes)}
    Do NOT include markdown formatting like \`\`\`json. Just output the raw JSON array.`;

    const result = await model.generateContent([
      systemInstruction,
      `User Query: ${message}`
    ]);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({ steps: parsed });
    } catch {
      // Fallback
      return NextResponse.json({ steps: [{ step: 1, title: "Response", description: text }] });
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}
