module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const prompt = (req.body && req.body.prompt) || "";
  if (!prompt || prompt.length > 30000) return res.status(400).json({ error: "bad prompt" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 4000, messages: [{ role: "user", content: prompt }] })
    });
    const d = await r.json();
    if (!r.ok) return res.status(500).json({ error: (d.error && d.error.message) || "API error" });
    res.status(200).json({ text: d.content.map(c => c.text || "").join("") });
  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
};
