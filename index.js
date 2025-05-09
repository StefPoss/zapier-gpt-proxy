// ✅ Proxy ultra-léger pour relayer GPT → Zapier MCP

import express from "express"
import fetch from "node-fetch"
import bodyParser from "body-parser"

const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json())

app.post("/envoyer", async (req, res) => {
  const message = req.body.message

  if (!message) {
    return res.status(400).json({ error: "message requis" })
  }

  try {
    const response = await fetch(
      "https://mcp.zapier.com/api/mcp/s/ODUyMzM2OTEtZWU3ZS00Y2NiLThhODgtYTI4NDU5NjY2NGRjOjI0OWQ5OTZlLTlkMTctNDJmYi1iMGFiLTIxYzUyYmUwNTEyOQ==/sse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: "Zapier MCP a renvoyé une erreur", detail: text })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: "Erreur proxy", detail: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Proxy GPT→Zapier en ligne sur http://localhost:${PORT}`)
})
