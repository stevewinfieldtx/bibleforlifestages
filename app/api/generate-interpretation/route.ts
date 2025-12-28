import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, stageSituation, language = "en" } = await request.json()

    console.log("[v0] generate-interpretation - language received:", language)
    console.log("[v0] generate-interpretation - ageRange received:", ageRange)

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = (process.env.OPENROUTER_MODEL_ID || "anthropic/claude-sonnet-4-20250514").trim()

    const agePrompt = getAgeSpecificPrompt(ageRange)

    const languageName = getLanguageName(language)
    const languageInstruction =
      language !== "en"
        ? `CRITICAL LANGUAGE REQUIREMENT: You MUST write your entire interpretation in ${languageName}. Every single word of the interpretation content must be in ${languageName}. Do NOT write in English. The delimiters (INTERPRETATION===, ===INTERPRETATION, IMAGE_PROMPT===, ===IMAGE_PROMPT) stay in English, but ALL content between them must be in ${languageName}.`
        : ""

    const systemInstruction = `${languageInstruction}${languageInstruction ? "\n\n" : ""}${agePrompt}`

    const { text } = await generateText({
      model: openrouter(modelId),
      system: systemInstruction,
      prompt: `${verseReference}: "${verseText}"
      
      ${language !== "en" ? `REMINDER: Write your interpretation in ${languageName}, NOT English.\n\n` : ""}Format your response EXACTLY like this (keep delimiters in English, write content in ${languageName}):
      
      INTERPRETATION===
      Your reflective monologue here in ${languageName}...
      ===INTERPRETATION
      
      IMAGE_PROMPT===
      Cinematic description of an inspiring, hopeful scene that captures the verse's theme (this can be in English)
      ===IMAGE_PROMPT`,
      maxTokens: 4000,
    })

    console.log("[v0] generate-interpretation - LLM response length:", text.length)
    console.log("[v0] generate-interpretation - LLM response first 200 chars:", text.substring(0, 200))
    console.log("[v0] generate-interpretation - LLM response last 200 chars:", text.substring(text.length - 200))

    // Try to match proper format first, then fallback to flexible format
    let interpretationMatch = text.match(/INTERPRETATION===\s*([\s\S]*?)\s*===INTERPRETATION/)
    if (!interpretationMatch) {
      // LLM might have written ===IMAGE_PROMPT instead of ===INTERPRETATION
      interpretationMatch = text.match(/INTERPRETATION===\s*([\s\S]*?)\s*===(?:IMAGE_PROMPT|$)/)
    }

    let imagePromptMatch = text.match(/IMAGE_PROMPT===\s*([\s\S]*?)\s*===(?:IMAGE_PROMPT|$)/)
    if (!imagePromptMatch) {
      // Try without the closing delimiter
      imagePromptMatch = text.match(/===?IMAGE_PROMPT\s*([\s\S]*?)(?:===|$)/)
    }

    console.log("[v0] generate-interpretation - interpretationMatch found:", !!interpretationMatch)
    console.log("[v0] generate-interpretation - imagePromptMatch found:", !!imagePromptMatch)

    const interpretation = interpretationMatch ? interpretationMatch[1].trim() : "Unable to generate interpretation."
    const heroImagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : "A serene biblical scene"

    if (!interpretationMatch) {
      console.error("[v0] generate-interpretation - REGEX FAILED! Full LLM response:", text)
    }

    return Response.json({
      interpretation,
      heroImagePrompt,
    })
  } catch (error) {
    console.error("Interpretation generation error:", error)
    return Response.json({ error: "Failed to generate interpretation" }, { status: 500 })
  }
}

function getAgeSpecificPrompt(ageRange: string): string {
  const prompts: Record<string, string> = {
    teens: `Write a reflective monologue about this scripture in a warm, coffee-conversation tone. Third person observational—not "I feel" or "you feel" but describing shared human experiences that the reader can see themselves in. Stream of consciousness, no structure or analysis. Reference experiences common to teenagers (school pressure, social media, feeling invisible, friend stuff) but naturally, not forced. Casual language, trailing thoughts, sentence fragments okay. Like a voiceover in a coming-of-age film. Keep it under 200 words.`,

    university: `Write a reflective monologue about this scripture in a warm, coffee-conversation tone. Third person observational—describing shared human experiences without "I" or "you." No structured breakdown, just honest musing. Can touch on the tensions of this life stage (identity questions, pressure, loneliness in a crowd, faith doubts) organically. Thoughtful but still casual. Like sitting across from someone who's processing out loud. Keep it under 200 words.`,

    adult: `Write a reflective monologue about this scripture in a warm, coffee-conversation tone. Third person observational—shared human experience, not "I" or "you." No theological dissection, just real-life reflection. Can reference work, family, loss, exhaustion, or quiet moments of wondering—but woven in naturally. Grounded, unhurried, like a good friend thinking out loud. Keep it under 200 words.`,

    senior: `Write a reflective monologue about this scripture in a warm, coffee-conversation tone. Third person observational—reflecting on life's arc without lecturing. No formal structure. Can touch on looking back, loss, gratitude, faith tested and held onto. Gentle, wise, unhurried—like a quiet conversation on a porch. Not preachy. Keep it under 200 words.`,
  }

  return prompts[ageRange] || prompts.adult
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    es: "Spanish (Español)",
    fr: "French (Français)",
    de: "German (Deutsch)",
    pt: "Portuguese (Português)",
    zh: "Chinese (中文)",
    vi: "Vietnamese (Tiếng Việt)",
    ko: "Korean (한국어)",
    th: "Thai (ไทย)",
  }
  return languages[code] || "English"
}
