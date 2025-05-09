export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" })
  }

  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: "Champ 'message' manquant" })
  }

  const zapierUrl = "https://hooks.zapier.com/hooks/catch/3142659/2nqlanh/"

  try {
    const response = await fetch(zapierUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    })

    const result = await response.text()

    return res.status(200).json({
      success: true,
      zapier: result
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
