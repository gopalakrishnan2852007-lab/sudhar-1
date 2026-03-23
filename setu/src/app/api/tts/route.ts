import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

    const fetchUrl = `https://${process.env.AZURE_REGION || 'eastus'}.tts.speech.microsoft.com/cognitiveservices/v1`;
    
    // Simple mapping of languages to natural-sounding Azure Neural Voices for elderly users (wise/deep tones usually picked)
    const voiceMap: Record<string, string> = {
      'en': 'en-IN-PrabhatNeural',
      'hi': 'hi-IN-MadhurNeural',
      'mr': 'mr-IN-ManoharNeural',
      'bn': 'bn-IN-BashkarNeural',
      'gu': 'gu-IN-NiranjanNeural',
      'kn': 'kn-IN-GaganNeural',
      'ta': 'ta-IN-ValluvarNeural',
      'te': 'te-IN-MohanNeural'
    };

    const voiceName = voiceMap[language] || 'hi-IN-MadhurNeural';

    const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Male' name='${voiceName}'>${text}</voice></speak>`;

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.AZURE_TTS_KEY || '',
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      },
      body: ssml,
    });

    if (!response.ok) {
        throw new Error("Azure TTS Failed");
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
  }
}
