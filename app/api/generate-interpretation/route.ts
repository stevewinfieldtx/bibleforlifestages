import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, contentStyle = "casual", language = "en" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = (process.env.OPENROUTER_MODEL_ID || "google/gemini-2.0-flash-001").trim()

    const ageContext: Record<string, string> = {
      teens: "Write for teenagers. Reference their world naturally - school pressures, social dynamics, identity questions, family tensions, future uncertainty. Don't be preachy or talk down to them.",
      university: "Write for young adults (18-23). Address the tensions of this season - independence vs. uncertainty, big decisions about career/relationships, questioning what they were taught, finding their own faith.",
      adult: "Write for adults navigating the full complexity of life - career pressures, relationship challenges, parenting struggles, financial stress, health concerns, caring for aging parents while raising kids.",
      senior: "Write for those with decades of life experience. Honor their wisdom while addressing real concerns - legacy, health, loss of friends/spouse, relevance, mortality, passing on faith to grandchildren.",
    }

    const ageInstruction = ageContext[ageRange] || ageContext.adult

    const styleInstruction = contentStyle === "academic"
      ? `Write a substantive theological reflection (300-400 words). Include:
- Historical and literary context of the passage
- Key Greek or Hebrew words and their deeper meanings
- Cross-references to related scripture that illuminate the text
- Theological implications and how scholars have understood this
- Application that emerges naturally from the deeper understanding
Write with scholarly depth but accessible language. This is seminary-level insight made readable.`
      : `Write a warm, thoughtful reflection (250-300 words). 
- Stream of consciousness style, like thinking out loud
- Third person perspective, observational
- Notice the nuances and tensions in the verse
- Connect to real human experience without being preachy
- Let insight emerge naturally, don't force application
- Write like a wise friend who reads deeply, not a pastor giving a sermon`

    const langName = language !== "en" ? getLanguageName(language) : null
    const langNote = langName ? ` Write entirely in ${langName}.` : ""

    const { text } = await generateText({
      model: openrouter(modelId),
      system: `${styleInstruction}

${ageInstruction}${langNote}

Never be preachy. Never use clichés. Never tell people what they "should" do.`,
      prompt: `${verseReference}: "${verseText}"

INTERPRETATION===
[Your reflection here]
===INTERPRETATION

IMAGE_PROMPT===
[Cinematic, evocative scene that captures the emotional essence of this verse. Specific, artistic, 25 words max]
===IMAGE_PROMPT`,
      maxTokens: contentStyle === "academic" ? 1500 : 1000,
    })

    const interpretationMatch = text.match(/INTERPRETATION===\s*([\s\S]*?)\s*===INTERPRETATION/)
    const imagePromptMatch = text.match(/IMAGE_PROMPT===\s*([\s\S]*?)\s*===IMAGE_PROMPT/)

    return Response.json({
      interpretation: interpretationMatch?.[1]?.trim() || "Unable to generate interpretation.",
      heroImagePrompt: imagePromptMatch?.[1]?.trim() || "A serene biblical scene with golden light",
    })
  } catch (error) {
    console.error("Interpretation error:", error)
    return Response.json({ error: "Failed to generate interpretation" }, { status: 500 })
  }
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    es: "Spanish", fr: "French", de: "German", pt: "Portuguese",
    zh: "Chinese", vi: "Vietnamese", ko: "Korean", th: "Thai",
  }
  return languages[code] || "English"
}
