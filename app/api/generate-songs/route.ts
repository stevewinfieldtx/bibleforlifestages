import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext } from "@/lib/personalization-prompts"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, language = "en" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = (process.env.OPENROUTER_MODEL_ID || "anthropic/claude-sonnet-4-20250514").trim()

    const musicStyle = getMusicStyleForAge(ageRange)
    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation)

    const languageInstruction =
      language !== "en"
        ? `\n\nIMPORTANT: Write the song lyrics in ${getLanguageName(language)}. The structure labels ([Verse 1], [Chorus], etc.) should remain in English, but all lyrical content must be in ${getLanguageName(language)}.`
        : ""

    const systemInstruction = `You're a contemporary songwriter who writes songs that sound like mainstream pop hits with spiritual themes.

CRITICAL RULES:
- NO hymn-style language (avoid "thee", "thou", "thy", "hath", "unto", "doth", "behold")
- NO churchy clichés or overt religious terminology that wouldn't connect with mainstream listeners
- Use everyday language that real people actually speak
- Make it emotionally authentic, vulnerable, and relatable
- Think Billboard Top 40 meets faith - catchy hooks, memorable melodies
- Production style inspired by modern pop/rock bands, NOT traditional worship artists

${musicStyle}${personalization}${languageInstruction}`

    const { text } = await generateText({
      model: openrouter(modelId),
      system: systemInstruction,
      prompt: `Write an uplifting contemporary song inspired by ${verseReference}: "${verseText}"

Create a song with:
- Verse-chorus structure with a clear hook and bridge
- Modern pop production with electronic elements and live instruments
- Lyrics focused on the scripture's theme using everyday language, not churchy terminology
- Natural conversational phrasing that flows like normal speech
- Emotional build throughout with dynamic shifts between sections
- 80-110 BPM for verse, potentially increasing tempo for chorus
- Short, memorable lines in the chorus that would be easy to remember and sing along with
- A melodic hook that repeats and becomes familiar
- Contemporary vocal styling with some ad libs in the final chorus
- Production inspiration from modern pop/rock/alternative artists rather than traditional worship artists
- Avoid overt religious language that wouldn't connect with mainstream listeners

Use the following format with clear delimiters:

TITLE===
[Song title here]
===TITLE

SUBTITLE===
[Genre/style like "Pop / Alternative Pop"]
===SUBTITLE

LYRICS===
[Full song with structure markers like [Verse 1], [Chorus], etc.]
===LYRICS

AUDIO_PROMPT===
[Suno AI prompt describing the musical style, tempo, instrumentation, and production]
===AUDIO_PROMPT

IMAGE_PROMPT===
[Album art description - modern Spotify aesthetic, artistic, contemporary design]
===IMAGE_PROMPT`,
      maxTokens: 3000,
    })

    const titleMatch = text.match(/TITLE===\s*([\s\S]*?)\s*===TITLE/)
    const subtitleMatch = text.match(/SUBTITLE===\s*([\s\S]*?)\s*===SUBTITLE/)
    const lyricsMatch = text.match(/LYRICS===\s*([\s\S]*?)\s*===LYRICS/)
    const audioPromptMatch = text.match(/AUDIO_PROMPT===\s*([\s\S]*?)\s*===AUDIO_PROMPT/)
    const imagePromptMatch = text.match(/IMAGE_PROMPT===\s*([\s\S]*?)\s*===IMAGE_PROMPT/)

    if (!titleMatch || !lyricsMatch) {
      throw new Error("Failed to parse song response")
    }

    const songs = {
      title: titleMatch[1].trim(),
      sub: subtitleMatch ? subtitleMatch[1].trim() : "Contemporary Pop",
      lyrics: lyricsMatch[1].trim(),
      prompt: audioPromptMatch ? audioPromptMatch[1].trim() : "uplifting contemporary pop song",
      imagePrompt: imagePromptMatch ? imagePromptMatch[1].trim() : "modern album art, contemporary design",
    }

    return Response.json({ songs })
  } catch (error) {
    console.error("Songs generation error:", error)
    return Response.json({ error: "Failed to generate songs" }, { status: 500 })
  }
}

function getMusicStyleForAge(ageRange: string): string {
  const styles: Record<string, string> = {
    teens:
      "Style: High-energy pop with electronic elements, synth-driven beats, upbeat tempo (120+ BPM), catchy vocal hooks, danceable rhythm. Think stadium pop anthems with youthful energy.",
    university:
      "Style: Atmospheric indie-pop with R&B influences, soulful vocals, vulnerable and emotionally raw lyrics. Mid-tempo (90-110 BPM), layered production, authentic and introspective.",
    adult:
      "Style: Anthemic pop-rock, powerful and radio-ready. Strong melodies, inspirational but genuine. Polished production with organic instruments, driving rhythm (100-120 BPM).",
    senior:
      "Style: Warm acoustic-pop with rich harmonies, melodic and timeless feel. Softer tempo (70-90 BPM), piano and acoustic guitar forward, emotionally resonant.",
  }
  return (
    styles[ageRange] ||
    "Style: Modern pop sound - catchy, emotional, radio-friendly production with contemporary electronic and acoustic elements."
  )
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    pt: "Portuguese",
    zh: "Chinese",
    vi: "Vietnamese",
    ko: "Korean",
    th: "Thai",
  }
  return languages[code] || "English"
}
