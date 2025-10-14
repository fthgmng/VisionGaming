export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") return res.status(204).end();

    const { message } = req.body || {};
    if (!message) {
      console.error("❌ Mesaj eksik");
      return res.status(400).json({ error: "Mesaj eksik" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ API anahtarı yok");
      return res.status(500).json({ error: "API anahtarı bulunamadı" });
    }

    // OpenAI API çağrısı
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    // 🔎 1. OpenAI yanıtı başarılı mı kontrol et
    if (!response.ok) {
      console.error("❌ OpenAI API hatası:", data);
      return res.status(response.status).json({
        error: "OpenAI API hatası",
        status: response.status,
        detail: data.error?.message || data,
      });
    }

    // 🔎 2. choices dizisi var mı kontrol et
    if (!data.choices || !data.choices.length) {
      console.error("⚠️ OpenAI 'choices' boş geldi:", data);
      return res.status(500).json({ error: "OpenAI yanıtı beklenen formatta değil" });
    }

    // ✅ 3. Normal cevap
    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (err) {
    console.error("💥 Sunucu hatası:", err);
    res.status(500).json({
      error: "Sunucu tarafı hatası",
      detail: err.message,
    });
  }
}
