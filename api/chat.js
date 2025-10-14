export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  try {
    // --- CORS ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(204).end();

    const { message } = req.body || {};
    if (!message)
      return res.status(400).json({ error: "Mesaj eksik veya boş." });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return res.status(500).json({ error: "Gemini API anahtarı bulunamadı." });

    // --- Gemini 2.5 Flash endpoint ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // --- Hata kontrolü ---
    if (!response.ok) {
      console.error("Gemini API hatası:", data);
      return res.status(response.status).json({
        error: "Gemini API hatası",
        detail: data,
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Yanıt alınamadı.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("💥 Sunucu hatası:", err);
    res.status(500).json({ error: "Sunucu hatası", detail: err.message });
  }
}
