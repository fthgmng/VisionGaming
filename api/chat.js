export default async function handler(req, res) {
  const { message } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer sk-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"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    }),
  });

  const data = await response.json();
  res.status(200).json({ reply: data.choices[0].message.content });
}
