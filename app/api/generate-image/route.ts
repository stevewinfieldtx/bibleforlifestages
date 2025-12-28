import { Runware } from "@runware/sdk-js"

export async function POST(req: Request) {
  console.log("[v0] generate-image API called")
  let prompt = "image"
  let width = 1024
  let height = 1024
  let ageRange = ""

  try {
    const body = await req.json()
    prompt = body.prompt
    width = body.width || 1024
    height = body.height || 1024
    ageRange = body.ageRange || ""

    console.log("[v0] generate-image prompt:", prompt?.substring(0, 50) + "...")
    console.log("[v0] generate-image ageRange:", ageRange)

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const isTeen = ageRange?.toLowerCase() === "teen" || ageRange?.toLowerCase() === "teens"
    const finalPrompt = isTeen
      ? `${prompt}, modern anime style, vibrant colors, expressive characters, clean linework, contemporary anime aesthetic`
      : prompt

    console.log("[v0] Final prompt (anime):", isTeen ? "YES" : "NO")

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      console.error("[v0] RUNWARE_API_KEY not configured")
      const placeholderUrl = `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(prompt?.substring(0, 50) || "image")}`
      return Response.json({ imageUrl: placeholderUrl }, { status: 200 })
    }

    const modelId = (process.env.RUNWARE_MODEL_ID || "runware:101@1").trim()
    console.log("[v0] Using Runware model:", modelId)

    try {
      console.log("[v0] Creating Runware instance...")
      const runware = new Runware({ apiKey })

      console.log("[v0] Calling Runware SDK requestImages...")
      const images = await runware.requestImages({
        model: modelId,
        positivePrompt: finalPrompt,
        width: width,
        height: height,
        numberResults: 1,
      })

      console.log("[v0] Runware SDK response received:", images ? "yes" : "no")

      if (images && Array.isArray(images) && images.length > 0) {
        const imageUrl = images[0].imageURL
        console.log("[v0] Image URL from SDK:", imageUrl ? "received" : "null")

        if (imageUrl) {
          return Response.json({ imageUrl: imageUrl }, { status: 200 })
        }
      }
    } catch (runwareError) {
      console.error(
        "[v0] Runware SDK error:",
        runwareError instanceof Error ? runwareError.message : String(runwareError),
      )
    }

    console.error("[v0] No valid image returned from Runware, using placeholder")
    const placeholderUrl = `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(prompt.substring(0, 100))}`
    return Response.json({ imageUrl: placeholderUrl }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Top-level image generation error:", errorMessage)

    const placeholderUrl = `/placeholder.svg?height=${width}&width=${height}&query=${encodeURIComponent(prompt?.substring(0, 100) || "image")}`
    return Response.json({ imageUrl: placeholderUrl }, { status: 200 })
  }
}
