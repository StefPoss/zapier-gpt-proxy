import fetch from 'node-fetch'

const TRELLO_KEY = process.env.TRELLO_KEY
const TRELLO_TOKEN = process.env.TRELLO_TOKEN
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { title, description } = req.body

  if (!title || !description) {
    return res.status(400).json({ error: 'Titre ou description manquant' })
  }

  try {
    // 1. Récupérer les cartes du board Trello
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?fields=name&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    )

    const cards = await cardsResponse.json()

    // 2. Extraire les numéros valides dans les titres des cartes
    const nums = cards
      .map(card => {
        const match = card.name.match(/^#(\d+)/) // extraire uniquement les numéros valides
        return match ? parseInt(match[1], 10) : null
      })
      .filter(n => n !== null) // ignorer les cartes sans numéro valide

    // 3. Calculer le prochain numéro en fonction du max (sans duplication)
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1
    const name = `#${nextNum} ${title}`
    const desc = description

    console.log("Payload envoyé à Zapier avec :", { name, desc })

    // 4. Envoyer au Webhook Zapier
    const zapierResponse = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, desc })
    })

    const result = await zapierResponse.text()

    res.status(200).json({
      success: true,
      sent: { name, desc },
      zapier: result
    })
  } catch (err) {
    console.error("Erreur proxy vers Zapier :", err)
    res.status(500).json({
      error: err.message || "Erreur serveur",
      detail: typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err)
    })
  }
}
