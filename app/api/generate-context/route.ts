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

    const systemInstruction = `Write like you're a friend who's really into history and loves sharing fascinating backstories. Keep it casual and engaging - use phrases like "So get this...", "Here's where it gets interesting...", "Can you imagine?", "Pretty incredible when you think about it". Make historical details feel alive and relevant, not dry or academic.${personalization}`

    const { text } = await generateText({
      model: openrouter(modelId),
      system: systemInstruction,
      prompt: `Give me the backstory for ${verseReference}: "${verseText}"
      
      Return ONLY a JSON object with this structure, no markdown:
      {
        "context": {
          "whoIsSpeaking": "Tell me about the speaker in a friendly way - who are they, what's their deal, why are they the one saying this?",
          "originalListeners": "This is huge - who LITERALLY heard these words first? Give me actual NAMES (like Peter, James, Mary Magdalene, Nicodemus, etc). For each person, share a quick bio - what was their job, how did they know the speaker, what's their story? If it was a crowd, describe who was there and name anyone we know about.",
          "whyTheConversation": "What sparked this moment? What just happened that led to these specific words being spoken right then?",
          "historicalBackdrop": "Paint the bigger picture - what was going on in the world? Roman occupation stuff, religious tensions, cultural dynamics that help us get it.",
          "immediateImpact": "How did people react when they first heard this? What happened next?",
          "longTermImpact": "Fast forward - how did these words end up changing everything?",
          "setting": "Help me picture it - where exactly are we? Time of day? What would I see, hear, smell if I was there?"
        },
        "contextImagePrompt": "Cinematic historical scene showing the actual people present in the moment"
      }`,
      maxTokens: 2500,
    })

    const data = parseLLMJson(text)

    return Response.json(data)
  } catch (error) {
    console.error("Context generation error:", error)
    return Response.json({ error: "Failed to generate context" }, { status: 500 })
  }
}
