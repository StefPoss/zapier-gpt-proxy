export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { title, description } = req.body

  if (!title || !description) {
    return res.status(400).json({ error: 'Titre ou description manquant' })
  }

  try {
    const zapierWebhook = process.env.ZAPIER_WEBHOOK_URL

    const zapierResponse = await fetch(zapierWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    })

    const result = await zapierResponse.text()

    res.status(200).json({
      success: true,
      sent: { title, description },
      zapier: result
    })
  } catch (err) {
    res.status(500).json({
      error: err.message || "Erreur serveur",
      detail: typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err)
    })
  }
}
