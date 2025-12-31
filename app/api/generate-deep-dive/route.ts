import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { topic, verseReference, verseText, ageRange = "adult" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = "google/gemini-2.0-flash-lite-001"

    const topicContext: Record<string, string> = {
      "Fighting Cancer": "They're in the fight of their life. Exhausted. Scared. Pissed off. Some days just getting through is the win.",
      "Supporting Someone with Cancer": "They're watching someone they love suffer and can't fix it. The helplessness is crushing.",
      "Autism in the Family": "They're running on empty. Meltdowns, IEPs, therapies, people who don't get it. They love their kid fiercely but some days are just brutal.",
      "Grieving a Loss": "Grief isn't linear. Some moments they're fine, then it hits like a truck. People say stupid things. The absence is physical.",
      "Going Through Divorce": "Everything they thought their life would be is gone. Identity shattered. Maybe relief mixed with grief. It's complicated.",
      "Financial Crisis": "The anxiety is constant. Shame whispers lies. Basic survival shouldn't be this hard.",
      "Loneliness & Isolation": "They feel invisible. Surrounded by people but utterly alone. It's exhausting pretending to be okay.",
      "Caring for Aging Parents": "Watching a parent decline is its own kind of grief. The exhaustion, the guilt, the loss of who they used to be.",
      "Addiction Struggle": "Every day is a war. Shame is heavy. Relapse doesn't mean failure but it feels like it.",
      "Crisis of Faith": "Doubt isn't weakness. Sometimes the old answers don't work anymore. That's terrifying and lonely.",
      "Chronic Illness": "The fatigue and pain are invisible to others. 'But you don't look sick.' Managing expectations is exhausting.",
      "Mental Health": "The weight is real even when others can't see it. Getting through the day takes everything they've got.",
    }

    const context = topicContext[topic] || topic

    const { text } = await generateText({
      model: openrouter(modelId),
      system: `Write a very short reflection for someone going through something hard.

WHO THEY ARE: ${context}

RULES:
- 80-100 words maximum
- NO greetings
- NO advice or telling them what to do
- NO "you should", "you must", "try to"
- NO clichés like "God has a plan" or "stay strong"  
- NEVER mention any websites, URLs, or online resources
- NEVER reference external sources
- Don't preach. Don't fix. Just be present.

Acknowledge the hard. Sit in it. Maybe one gentle connection to the verse. That's it.`,
      prompt: `${verseReference}: "${verseText}"

Someone dealing with ${topic}. No advice. Just presence. 80 words max. Do not mention any websites.`,
      maxTokens: 250,
    })

    // Aggressively clean the output
    let cleanedText = text
      // Remove markdown links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove raw URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove any word containing .com/.org/.net/etc
      .replace(/\S*\.(com|org|net|edu|gov|io)\S*/gi, '')
      // Remove markdown formatting
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_([^_]+)_/g, '$1')
      // Remove greetings
      .replace(/^(Dear|My dear|My dearest|Hey|Hello|Hi|Friend)[^.!?\n]*[.!?\n]/i, '')
      // Clean up whitespace
      .replace(/\s{2,}/g, ' ')
      .trim()
    
    // Remove entire sentences that contain website-related words or advice
    cleanedText = cleanedText
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => {
        const lower = sentence.toLowerCase()
        // Filter out advice
        if (/(you should|you must|you need to|you have to|remember to|try to|don't forget to)/i.test(lower)) return false
        // Filter out any sentence mentioning websites/sources
        if (/(\.com|\.org|\.net|bible.*tool|bible.*gateway|website|link|resource|article|click|visit|check out|online)/i.test(lower)) return false
        // Filter out sentences that got mangled by URL removal (very short or weird)
        if (sentence.trim().length < 10) return false
        return true
      })
      .join(' ')
      .trim()

    return Response.json({ reflection: cleanedText })
  } catch (error) {
    console.error("Deep Dive error:", error)
    return Response.json({ error: "Failed to generate reflection" }, { status: 500 })
  }
}
