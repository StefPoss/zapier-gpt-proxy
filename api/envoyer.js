export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" })
  }

  const { message } = req.body

  try {
    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    })

    const result = await response.json()

    return res.status(200).json({
      success: true,
      sentTo: "https://httpbin.org/post",
      echo: message,
      response: result
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
