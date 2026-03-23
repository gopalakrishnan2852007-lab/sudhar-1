import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, language } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = `You are SETU, a helpful, deeply empathetic AI. The user has uploaded an image of a document (often a government notice or form). Analyze the document and explain it simply in ${language || 'English'}. Act like a 'wise, helpful grandson'. Return ONLY a JSON array of actionable steps: [{ "step": number, "title": "string", "description": "string" }]. Do not include markdown code blocks like \`\`\`json.`;

    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType
        }
      }
    ];

    const result = await model.generateContent([
      systemInstruction,
      ...imageParts
    ]);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({ steps: parsed });
    } catch {
      return NextResponse.json({ steps: [{ step: 1, title: "Document Analysis", description: text }] });
    }
  } catch (error) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
