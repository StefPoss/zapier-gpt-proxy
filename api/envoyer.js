import fetch from 'node-fetch'

const TRELLO_KEY = process.env.TRELLO_KEY
const TRELLO_TOKEN = process.env.TRELLO_TOKEN
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID
const ZAPIER_MCP_URL = process.env.ZAPIER_MCP_URL

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const { rawTitle, rawDescription } = req.body

  if (!rawTitle || !rawDescription) {
    return res.status(400).json({ error: 'Titre ou description manquant' })
  }

  try {
    // 1. Récupérer les cartes du board
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?fields=name&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    )

    const cards = await cardsResponse.json()

    // 2. Trouver les #num
    const nums = cards
      .map(card => {
        const match = card.name.match(/^#(\d+)/)
        return match ? parseInt(match[1], 10) : null
      })
      .filter(n => n !== null)

    const nextNum = nums.length ? Math.max(...nums) + 1 : 1
    const name = `#${nextNum} ${rawTitle}`
    const desc = rawDescription

    // 3. Envoyer à Zapier MCP
    const zapierResponse = await fetch(ZAPIER_MCP_URL, {
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
    res.status(500).json({ error: err.message })
  }
}
