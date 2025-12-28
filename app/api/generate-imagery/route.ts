import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { parseLLMJson } from "@/lib/parse-llm-json"
import { buildPersonalizationContext } from "@/lib/personalization-prompts"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = (process.env.OPENROUTER_MODEL_ID || "anthropic/claude-sonnet-4-20250514").trim()

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation)

    const systemInstruction = `You have a gift for seeing deeper meaning in things. Help people discover the beautiful symbolism and metaphors in scripture in a way that's accessible and enlightening. Write like you're sharing a cool insight with a friend - "Oh, you know what's amazing about this?" kind of energy.${personalization}`

    const { text } = await generateText({
      model: openrouter(modelId),
      system: systemInstruction,
      prompt: `Find 4 powerful symbols or metaphors in ${verseReference}: "${verseText}"
      
      Unpack each one in a friendly, insightful way - help people see the deeper meaning.
      
      IMPORTANT: Each imagePrompt MUST be completely unique and different from the others. Create 4 distinct visual concepts:
      1. First image: Focus on a natural element or landscape that represents the verse
      2. Second image: Focus on a person or human emotion that captures the meaning
      3. Third image: Focus on an abstract or symbolic representation
      4. Fourth image: Focus on a scene or moment that illustrates the verse in action
      
      Return ONLY a JSON object with this structure, no markdown:
      {
        "imagery": [
          { "title": "Symbol Name", "sub": "Friendly explanation of what this symbol represents and why it's meaningful", "icon": "auto_awesome", "imagePrompt": "Detailed unique prompt for image 1 - focus on natural element or landscape" },
          { "title": "Symbol Name", "sub": "Friendly explanation of what this symbol represents and why it's meaningful", "icon": "water_drop", "imagePrompt": "Detailed unique prompt for image 2 - focus on person or emotion" },
          { "title": "Symbol Name", "sub": "Friendly explanation of what this symbol represents and why it's meaningful", "icon": "spa", "imagePrompt": "Detailed unique prompt for image 3 - focus on abstract or symbolic" },
          { "title": "Symbol Name", "sub": "Friendly explanation of what this symbol represents and why it's meaningful", "icon": "wb_sunny", "imagePrompt": "Detailed unique prompt for image 4 - focus on scene or action" }
        ]
      }`,
      maxTokens: 1500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    const data = parseLLMJson(cleanJson)

    return Response.json(data)
  } catch (error) {
    console.error("Imagery generation error:", error)
    return Response.json({ error: "Failed to generate imagery" }, { status: 500 })
  }
}
