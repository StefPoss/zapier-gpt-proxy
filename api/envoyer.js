export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" })
  }

  const { message } = req.body

  // Log utile dans les logs Vercel (onglet Functions)
  console.log("Message reçu dans le proxy :", message)

  // Réponse directe sans fetch
  return res.status(200).json({
    success: true,
    echo: message,
    note: "Le proxy fonctionne. Le fetch vers Zapier est temporairement désactivé."
  })
}
