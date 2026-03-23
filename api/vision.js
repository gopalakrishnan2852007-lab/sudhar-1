const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType, language } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.GOOGLE_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const prompt = `You are SETU. The user uploaded a government document/notice. Explain what it is and what actions the user needs to take. 
    You MUST reply ONLY in ${language || 'English'} language causing no confusion to elderly users.
    Respond strictly in JSON array format: [{"title": "String", "description": "String"}].
    Do not use markdown formatting like \`\`\`json.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            role: 'user', 
            parts: [
              { text: prompt },
              { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' }}
            ] 
          }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.5 }
        })
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json();
      throw new Error('Gemini Vision API error: ' + (errData.error?.message || geminiRes.status));
    }

    const data = await geminiRes.json();
    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
      throw new Error('Empty reply from Gemini 2.5 Flash');
    }

    reply = reply.trim();
    if (reply.startsWith('```json')) reply = reply.replace(/```json/g, '').replace(/```/g, '').trim();

    let steps;
    try {
      steps = JSON.parse(reply);
    } catch {
      steps = [{ title: "Analysis", description: reply }];
    }

    return res.status(200).json({ steps });
  } catch (err) {
    console.error('Vision Handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = handler;
