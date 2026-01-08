import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { topic, verseReference, verseText, ageRange = "adult" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
    })

    const modelId = "google/gemini-2.0-flash-lite-001"

    // Topic-specific understanding (what they might actually be feeling)
    const topicContext: Record<string, string> = {
      // Life Celebrations
      "New Baby at Home": "Sleep-deprived, overwhelmed with love and fear. Life has completely changed. The weight of responsibility is real.",
      "Newly Married": "Excited but navigating the reality of merging two lives. Learning each other's quirks. The honeymoon phase meets real life.",
      "Starting a New Job": "Excited but anxious. Proving yourself. Learning new systems, new people. Imposter syndrome might be creeping in.",
      "Entering Retirement": "A mix of freedom and loss of identity. What now? Finding purpose without the structure of work.",
      
      // Family & Relationships
      "Marriage Struggles": "The person they married feels like a stranger sometimes. Fighting, distance, wondering if it's worth it.",
      "Going Through Divorce": "Everything they thought their life would be is gone. Identity shattered. Maybe relief mixed with grief.",
      "Single Parenting": "Exhausted. Doing the work of two. Guilt that they can't give their kids everything. Loneliness in the chaos.",
      "Wayward Child": "Heartbroken watching their child make destructive choices. Guilt, anger, grief. Wondering where they went wrong.",
      "Infertility Journey": "Monthly grief. Bodies that feel like they're failing. Baby showers are torture. Well-meaning comments cut deep.",
      "Blended Family": "Navigating loyalty, jealousy, different parenting styles. Loving kids who may not love you back yet.",
      "Special Needs Family": "Running on empty. Therapies, IEPs, meltdowns, people who don't get it. They love their child fiercely but some days are brutal.",
      "Caring for Aging Parents": "Watching a parent decline is its own kind of grief. Exhaustion, guilt, loss of who they used to be. Role reversal.",
      "Empty Nest": "The house is quiet. Years of identity wrapped up in kids who are gone. What now? Who am I without them?",
      
      // Health & Loss
      "Fighting Cancer": "In the fight of their life. Exhausted. Scared. Pissed off. Some days just getting through is the win.",
      "Supporting Someone Sick": "Watching someone they love suffer and can't fix it. Helplessness is crushing. Caregiver fatigue is real.",
      "Chronic Illness": "The fatigue and pain are invisible to others. 'But you don't look sick.' Managing expectations is exhausting.",
      "Grieving a Death": "Grief isn't linear. Some moments they're fine, then it hits like a truck. The absence is physical.",
      "Miscarriage or Loss of Child": "The most unnatural loss. Grieving someone the world never knew. People don't know what to say. Neither do they.",
      
      // Mental & Emotional
      "Depression": "The weight is crushing. Getting out of bed is a victory. Everything feels gray. They're not lazy, they're drowning.",
      "Anxiety & Worry": "Mind racing with worst-case scenarios. Can't turn it off. Physical symptoms are real. Not just 'worrying too much.'",
      "Loneliness & Isolation": "Surrounded by people but utterly alone. It's exhausting pretending to be okay. Nobody really knows them.",
      "Burnout & Exhaustion": "Running on empty for too long. Can't remember what rest feels like. Everything takes more energy than they have.",
      "Addiction Struggle": "Every day is a war. Shame is heavy. Relapse doesn't mean failure but it feels like it. One day at a time.",
      
      // Work & Finances
      "Job Loss": "Identity tied to work, now gone. Financial anxiety. Shame in explaining it. Questioning their worth.",
      "Financial Crisis": "The anxiety is constant. Basic survival shouldn't be this hard. Shame whispers lies.",
      "Toxic Work Environment": "Dreading every day. Bosses or coworkers making life hell. Stuck between a paycheck and sanity.",
      "Career Uncertainty": "What am I supposed to do with my life? Wrong path? Too late to change? Paralyzed by options or lack of them.",
      
      // Faith & Purpose
      "Doubting My Faith": "The old answers don't work anymore. Terrifying and lonely. Not sure what they believe anymore.",
      "Feeling Far from God": "Going through the motions. Prayers feel like they hit the ceiling. Where did the connection go?",
      "Unanswered Prayer": "They've prayed and prayed. Silence. Starting to wonder if anyone's listening.",
      "Finding My Purpose": "What am I here for? Life feels aimless. Everyone else seems to have it figured out.",
      "Struggling to Forgive": "They know they should forgive but the hurt is too fresh. Resentment is heavy but letting go feels impossible.",
    }

    const context = topicContext[topic] || topic

    const { text } = await generateText({
      model: openrouter(modelId),
      system: `You're a close friend texting someone who's going through it.

WHAT THEY'RE DEALING WITH: ${context}

YOUR VIBE:
- Like you're sitting next to them on the couch, not standing at a pulpit
- Warm, real, maybe a little raw
- "Man, that's heavy" not "The Lord will see you through"
- You GET it - you're not above it
- Gently weave in how today's verse speaks to this moment

WRITING STYLE:
- 80-100 words max
- Short sentences. Real talk.
- Start mid-thought, like a text (not "Dear friend" or "I know you're struggling")
- Maybe a question they're probably asking themselves
- End soft, not with a bow on top

NEVER:
- Greetings or sign-offs
- "You should" / "Try to" / "Remember that"
- Churchy phrases ("God has a plan", "Stay strong", "His timing")
- Websites, links, or resources
- Wrapping it up neatly - life isn't neat right now`,
      prompt: `${verseReference}: "${verseText}"

They're in the thick of: ${topic}

Write like a friend who's been there. Raw, warm, real. Connect to the verse without preaching. 80-100 words.`,
      maxTokens: 300,
    })

    // Aggressively clean the output
    let cleanedText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links
      .replace(/https?:\/\/[^\s]+/g, '') // URLs
      .replace(/\S*\.(com|org|net|edu|gov|io)\S*/gi, '') // any domain
      .replace(/\*\*/g, '') // bold
      .replace(/\*/g, '') // italic
      .replace(/_([^_]+)_/g, '$1') // underscores
      .replace(/^(Dear|My dear|My dearest|Hey|Hello|Hi|Friend)[^.!?\n]*[.!?\n]/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
    
    // Remove sentences with advice language or website mentions
    cleanedText = cleanedText
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => {
        const lower = sentence.toLowerCase()
        if (/(you should|you must|you need to|you have to|remember to|try to|don't forget to)/i.test(lower)) return false
        if (/(\.com|\.org|\.net|bible.*tool|bible.*gateway|website|link|resource|article|click|visit|check out|online)/i.test(lower)) return false
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
