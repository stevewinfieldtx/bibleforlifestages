export async function POST(req: Request) {
  try {
    const { text, voice = "en-US-Neural2-F" } = await req.json()

    if (!text) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY

    if (!apiKey) {
      throw new Error("GOOGLE_CLOUD_API_KEY not configured")
    }

    // Google Cloud TTS REST API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "en-US",
            name: voice,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1.0,
            pitch: 0,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Google TTS error:", error)
      throw new Error(`Google TTS failed: ${response.status}`)
    }

    const data = await response.json()

    return Response.json({
      audio: data.audioContent, // Already base64 encoded
      format: "mp3",
      voice,
    })
  } catch (error) {
    console.error("TTS error:", error)
    return Response.json({ error: "TTS failed" }, { status: 500 })
  }
}
