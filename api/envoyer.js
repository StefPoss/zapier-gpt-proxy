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

  // Vérifier que le titre et la description sont présents
  if (!title || !description) {
    return res.status(400).json({ error: 'Titre ou description manquant' })
  }

  try {
    // 1. Récupérer les cartes du board Trello
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?fields=name&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`
    )
    
    // Si l'appel échoue
    if (!cardsResponse.ok) {
      throw new Error("Échec de la récupération des cartes")
    }

    const cards = await cardsResponse.json()

    // 2. Extraire les numéros des cartes existantes
    const nums = cards
      .map(card => {
        const match = card.name.match(/^#(\d+)/) // Extraire le numéro
        return match ? parseInt(match[1], 10) : null
      })
      .filter(n => n !== null) // Exclure les cartes sans numéro valide

    // 3. Calculer le prochain numéro disponible
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1
    const name = `#${nextNum} ${title}`
    const desc = description

    console.log("Titre de la carte :", name)
    console.log("Description de la carte :", desc)

    // 4. Envoyer au Webhook Zapier
    const zapierResponse = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: name, description: desc }) // Envoi du titre et de la description
    })

    const result = await zapierResponse.text()

    // Retourner la réponse
    res.status(200).json({
      success: true,
      sent: { title: name, description: desc },
      zapier: result
    })
  } catch (err) {
    console.error("Erreur lors de l'envoi à Zapier :", err)
    res.status(500).json({
      error: err.message || "Erreur serveur",
      detail: typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err)
    })
  }
}
