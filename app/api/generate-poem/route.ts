import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext } from "@/lib/personalization-prompts"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, poemType } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = (process.env.OPENROUTER_MODEL_ID || "anthropic/claude-sonnet-4-20250514").trim()
    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation)

    const isClassic = poemType === "classic"
    const styleGuide = isClassic
      ? "Write a SONNET or HYMN STYLE poem with rhyme, meter, and traditional structure."
      : "Write a FREE VERSE poem with vivid imagery, no strict rhyme required."

    const { text } = await generateText({
      model: openrouter(modelId),
      system: `You are a gifted poet who writes beautiful, emotionally resonant poetry. Your poems have proper structure with line breaks, stanzas, and poetic rhythm. Write in a warm, accessible style that touches the heart.${personalization}`,
      prompt: `Generate 1 beautiful ${isClassic ? "CLASSIC (Sonnet/Hymn)" : "FREE VERSE"} poem inspired by ${verseReference}: "${verseText}"

${styleGuide}

Requirements:
- 8-16 lines total
- Include clear stanzas with blank lines between them
- Use poetic devices like imagery and metaphor

Respond in this EXACT format:
TITLE===Your Poem Title===TITLE
POEM===
First line of poem
Second line of poem

Third line (new stanza)
Fourth line
===POEM
IMAGE===A visual description for artwork to accompany this poem===IMAGE`,
      maxTokens: 1000,
    })

    // Parse the response
    const titleMatch = text.match(/TITLE===(.+?)===TITLE/s)
    const poemMatch = text.match(/POEM===(.+?)===POEM/s)
    const imageMatch = text.match(/IMAGE===(.+?)===IMAGE/s)

    const poem = {
      title: titleMatch?.[1]?.trim() || "Untitled Poem",
      type: isClassic ? "Classic Verse" : "Free Verse",
      text: poemMatch?.[1]?.trim() || text,
      imagePrompt: imageMatch?.[1]?.trim() || "Abstract artistic representation of faith and spiritual contemplation",
    }

    return Response.json({ poem })
  } catch (error) {
    console.error("Poem generation error:", error)
    return Response.json({ error: "Failed to generate poem" }, { status: 500 })
  }
}
