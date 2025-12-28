import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"

async function fetchYouVersionVOTD(): Promise<{ reference: string; text: string; version: string } | null> {
  try {
    const response = await fetch("https://www.bible.com/verse-of-the-day", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    if (response.ok) {
      const html = await response.text()

      // Pattern: alt="Isaiah 7:14 - Therefore the Lord himself will give you..."
      const altMatch = html.match(/alt="([^"]+\d+:\d+)\s*-\s*([^"]+)"/i)
      if (altMatch) {
        return {
          reference: altMatch[1].trim(),
          text: altMatch[2].trim(),
          version: "NIV",
        }
      }

      const titleMatch = html.match(/Verse of the Day[^-]*-\s*([A-Za-z]+\s+\d+:\d+)/i)
      if (titleMatch) {
        const reference = titleMatch[1].trim()
        const textMatch = html.match(new RegExp(reference.replace(/[:\d]+/g, "[:\\d]+") + "[^>]*>([^<]+)<", "i"))
        if (textMatch) {
          return {
            reference,
            text: textMatch[1].trim(),
            version: "NIV",
          }
        }
      }
    }
  } catch (e) {
    console.error("YouVersion fetch error:", e)
  }
  return null
}

async function fetchBibleGatewayVOTD(): Promise<{ reference: string; text: string; version: string } | null> {
  try {
    const jsonResponse = await fetch("https://www.biblegateway.com/votd/get/?format=json&version=NIV", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    if (jsonResponse.ok) {
      const data = await jsonResponse.json()
      if (data.votd && data.votd.text) {
        const cleanText = data.votd.text
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&#\d+;/g, "")
          .replace(/&\w+;/g, "")
          .trim()
        return {
          reference: data.votd.reference || data.votd.display_ref,
          text: cleanText,
          version: "NIV",
        }
      }
    }

    const htmlResponse = await fetch("https://www.biblegateway.com/reading-plans/verse-of-the-day/today?version=NIV", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    if (htmlResponse.ok) {
      const html = await htmlResponse.text()
      const refMatch = html.match(/rp-passage[^>]*>.*?([A-Za-z]+\s+\d+:\d+)/is)
      const textMatch = html.match(/<sup[^>]*>\d+<\/sup>([^<]+)/i)
      if (refMatch) {
        return {
          reference: refMatch[1].trim(),
          text: textMatch ? textMatch[1].trim() : "",
          version: "NIV",
        }
      }
    }
  } catch (e) {
    console.error("Bible Gateway fetch error:", e)
  }
  return null
}

async function fetchOliveTreeVOTD(): Promise<{ reference: string; text: string; version: string } | null> {
  try {
    const response = await fetch("https://www.olivetree.com/votd/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    if (response.ok) {
      const html = await response.text()

      // The page structure has: "Verse of the Day" then "Deuteronomy 18:15" then the verse text
      // Pattern: Look for book name followed by chapter:verse, then the text follows
      const refMatch = html.match(/Verse of the Day\s*<\/[^>]+>\s*<[^>]+>([A-Za-z0-9\s]+\d+:\d+(?:-\d+)?)/is)

      if (refMatch) {
        const reference = refMatch[1].trim()

        // Get the verse text - it follows the reference
        // Pattern: reference followed by closing tag, then text content
        const textPattern = new RegExp(reference.replace(/[-:]/g, "[-:]") + "<\\/[^>]+>\\s*<[^>]+>([^<]+)", "is")
        const textMatch = html.match(textPattern)

        if (textMatch) {
          return {
            reference,
            text: textMatch[1].trim(),
            version: "NIV",
          }
        }

        // Fallback: try to find any paragraph-like text after the reference
        const fallbackPattern = new RegExp(
          reference.replace(/[-:]/g, "[-:]") + "[^>]*>[\\s\\S]*?<[^>]+>([^<]{20,})<",
          "is",
        )
        const fallbackMatch = html.match(fallbackPattern)

        if (fallbackMatch) {
          return {
            reference,
            text: fallbackMatch[1].trim(),
            version: "NIV",
          }
        }
      }

      // Alternative pattern: look for any Bible reference format in the page
      const simpleRefMatch = html.match(
        />((?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+:\d+(?:-\d+)?)</i,
      )

      if (simpleRefMatch) {
        const reference = simpleRefMatch[1].trim()
        // Find text that follows - usually the next significant text block
        const afterRef = html.split(reference)[1]
        if (afterRef) {
          const textMatch = afterRef.match(/>([A-Z][^<]{30,})</i)
          if (textMatch) {
            return {
              reference,
              text: textMatch[1].trim(),
              version: "NIV",
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Olive Tree fetch error:", e)
  }
  return null
}

export async function POST(request: Request) {
  try {
    const { source, verseQuery } = await request.json()

    if (verseQuery) {
      console.log("[v0] generate-verse API - verseQuery requested:", verseQuery)
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
      })

      const modelId = (process.env.OPENROUTER_MODEL_ID || "anthropic/claude-sonnet-4-20250514").trim()

      const { text } = await generateText({
        model: openrouter(modelId),
        prompt: `Return ONLY a JSON object for the Bible verse: ${verseQuery}
        
        Return ONLY this JSON structure, no markdown, no explanation:
        {
          "reference": "Book Chapter:Verse (exactly as requested or corrected if needed)",
          "version": "NIV",
          "text": "The exact NIV text of the verse"
        }`,
        maxTokens: 500,
      })

      const cleanJson = text.replace(/```json|```/g, "").trim()
      const data = JSON.parse(cleanJson)
      console.log("[v0] generate-verse API - LLM returned:", data.reference)
      return Response.json(data)
    }

    let verse = null

    if (source === "YouVersion") {
      verse = await fetchYouVersionVOTD()
    } else if (source === "Gateway") {
      verse = await fetchBibleGatewayVOTD()
    } else if (source === "Olive Tree") {
      verse = await fetchOliveTreeVOTD()
    }

    if (!verse) {
      console.log("[v0] generate-verse API - No verse found, returning error")
      return Response.json({ error: "Unable to fetch verse of the day" }, { status: 500 })
    }

    console.log("[v0] generate-verse API - Returning verse:", verse.reference)
    return Response.json(verse)
  } catch (error) {
    console.error("Verse generation error:", error)
    return Response.json({ error: "Failed to generate verse" }, { status: 500 })
  }
}
