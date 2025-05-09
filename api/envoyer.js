export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" })
  }

  const { message } = req.body

  const zapierUrl = "https://mcp.zapier.com/api/mcp/s/NjZkODBiNTMtMGQyOS00OTgyLWJmZGItMmRmY2YwOGU2ZDQyOjRhOTBkNWE1LWIwNWEtNGRhNy05MzUxLTQxNDA5MWFmZmRiMQ==/sse
"

  try {
    const response = await fetch(zapierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    })

    const text = await response.text()
    res.status(response.ok ? 200 : response.status).json({ success: true, zapier: text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
