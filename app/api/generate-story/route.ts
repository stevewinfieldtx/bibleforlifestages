import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext } from "@/lib/personalization-prompts"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, storyType } = await request.json()

    if (!verseReference || !verseText || !storyType) {
      console.error("[v0] Story API - Missing required fields:", { verseReference, verseText, storyType })
      return Response.json(
        {
          error: "Missing required fields",
          title: "Story Unavailable",
          text: "Unable to generate story due to missing information.",
          imagePrompt: "A peaceful scene",
        },
        { status: 400 },
      )
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = (process.env.OPENROUTER_MODEL_ID || "anthropic/claude-sonnet-4-20250514").trim()

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation)

    // Different prompts for each story type
    const storyPrompts: Record<string, string> = {
      contemporary: `Write a modern-day story set in TODAY's world (2024) that brings this verse to life. 
        Use current technology, modern settings (coffee shops, offices, hospitals, homes), and relatable situations.
        Focus on everyday people facing real challenges - work stress, family issues, health concerns, relationship struggles.
        Make it feel like something that could happen to your neighbor or coworker.`,

      historical: `Write a story set in a DIFFERENT time period or culture that brings this verse to life.
        Could be biblical times, medieval period, another country, or a unique cultural context.
        Show how the timeless truth of this verse transcends time and culture.
        Make the setting vivid and immersive while keeping the message universal.`,
    }

    const storyPrompt = storyPrompts[storyType] || storyPrompts.contemporary

    const systemInstruction = `You're an amazing storyteller who makes people feel things. Write stories that feel real and relatable - the kind of stories friends share with each other. Use natural dialogue, real emotions, and situations people actually face.${personalization}`

    const { text } = await generateText({
      model: openrouter(modelId),
      system: systemInstruction,
      prompt: `Create ONE powerful story that brings ${verseReference}: "${verseText}" to life.

${storyPrompt}

IMPORTANT LENGTH REQUIREMENT: The story MUST be at least 500 words. Include:
- Detailed scene setting and atmosphere
- Multiple characters with distinct voices  
- Extended dialogue exchanges
- Internal thoughts and emotions of the main character
- A clear narrative arc with setup, conflict, and resolution
- Sensory details that bring the story to life

Format your response EXACTLY like this (use === as delimiters):
TITLE===Your Story Title Here===TITLE
STORY===Your full story text here (minimum 500 words)...===STORY
IMAGE===A warm, cinematic scene description for an image===IMAGE`,
      maxTokens: 4000,
    })

    const titleMatch = text.match(/TITLE===(.+?)===TITLE/s)
    const storyMatch = text.match(/STORY===(.+?)===STORY/s)
    const imageMatch = text.match(/IMAGE===(.+?)===IMAGE/s)

    const title = titleMatch?.[1]?.trim() || "A Story of Faith"
    const storyText =
      storyMatch?.[1]?.trim() ||
      text
        .replace(/TITLE===.+?===TITLE/s, "")
        .replace(/IMAGE===.+?===IMAGE/s, "")
        .trim()
    const imagePrompt = imageMatch?.[1]?.trim() || `A warm scene depicting ${verseReference}`

    console.log("[v0] Story generated successfully:", { title, textLength: storyText.length, storyType })

    return Response.json({
      title,
      text: storyText,
      imagePrompt,
    })
  } catch (error) {
    console.error("Story generation error:", error instanceof Error ? error.message : error)
    return Response.json(
      {
        title: "Story Unavailable",
        text: "We encountered an issue generating this story. Please try again later.",
        imagePrompt: "A peaceful, contemplative scene",
        error: error instanceof Error ? error.message : "Failed to generate story",
      },
      { status: 200 },
    ) // Return 200 so client doesn't fail, but include error field
  }
}
