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
    // 1. Récupérer toutes les cartes du board Trello
    const cardsResponse = await fetch(
      const cardsResponse = await fetch(
  `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?fields=name&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
)

    )

    const cards = await cardsResponse.json()

    // 2. Extraire tous les #num
    const nums = cards
      .map(card => {
        const match = card.name.match(/^#(\d+)/)
        return match ? parseInt(match[1], 10) : null
      })
      .filter(n => n !== null && n < 90)

    const nextNum = nums.length ? Math.max(...nums) + 1 : 1

    // 3. Construire le titre avec incrémentation
    const title = `#${nextNum} ${rawTitle}`


    // 4. Appeler Zapier MCP avec title + description
    const zapierResponse = await fetch(ZAPIER_MCP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: rawDescription
      })
    })

    const result = await zapierResponse.text()

    res.status(200).json({
      success: true,
      sent: { title, description: rawDescription },
      zapier: result
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
