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
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?fields=name&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    )

    const cards = await cardsResponse.json()

    const nums = cards
      .map(card => {
        const match = card.name.match(/^#(\d+)/)
        return match ? parseInt(match[1], 10) : null
      })
      .filter(n => n !== null)

    const nextNum = nums.length ? Math.max(...nums) + 1 : 1
    const name = `#${nextNum} ${title}`
    const desc = description

    const zapierResponse = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, desc }) // Zapier attend "name" et "desc"
    })

    let result
try {
  result = await zapierResponse.json()
} catch {
  result = await zapierResponse.text()
}


    res.status(200).json({
      success: true,
      sent: { name, desc },
      zapier: result
    })
  } catch (err) {
    res.status(500).json({
      error: err.message || "Erreur serveur",
      detail: typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err)
    })
  }
}
