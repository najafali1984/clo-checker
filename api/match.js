module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const prompt = (req.body && req.body.prompt) || "";
  if (!prompt || prompt.length > 30000) return res.status(400).json({ error: "bad prompt" });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
      {
        method: "POST",
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
        })
      }
    );
    const d = await r.json();
    if (!r.ok) return res.status(500).json({ error: (d.error && d.error.message) || "API error" });
    const text = d.candidates[0].content.parts.map(p => p.text || "").join("");
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
};
