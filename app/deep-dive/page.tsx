"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDevotional } from "@/context/devotional-context"

export default function DeepDivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { devotional } = useDevotional()
  
  const topic = searchParams.get("topic") || ""
  const verseReference = devotional.verse?.reference || ""
  const verseText = devotional.verse?.text || ""
  
  const [reflection, setReflection] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Get user profile for age
  const [userProfile, setUserProfile] = useState<{ ageRange?: string; fullName?: string }>({})
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem("userProfile")
      if (saved) {
        setUserProfile(JSON.parse(saved))
      }
    } catch (e) { /* ignore */ }
  }, [])

  // Generate the Deep Dive reflection
  useEffect(() => {
    if (!topic || !verseReference || !verseText) {
      setError("Missing verse or topic information")
      setIsLoading(false)
      return
    }

    const generateReflection = async () => {
      setIsLoading(true)
      setError("")
      
      try {
        const response = await fetch("/api/generate-deep-dive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            verseReference,
            verseText,
            ageRange: userProfile.ageRange || "adult",
          }),
        })

        if (!response.ok) throw new Error("Failed to generate reflection")

        const data = await response.json()
        setReflection(data.reflection)
      } catch (err) {
        console.error("Deep Dive error:", err)
        setError("Unable to generate reflection. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    // Only generate once we have the profile loaded
    if (userProfile.ageRange !== undefined || Object.keys(userProfile).length > 0) {
      generateReflection()
    }
  }, [topic, verseReference, verseText, userProfile])

  // Get icon for topic
  const getTopicIcon = (topicName: string): string => {
    const icons: Record<string, string> = {
      "Fighting Cancer": "healing",
      "Supporting Someone with Cancer": "volunteer_activism",
      "Autism in the Family": "family_restroom",
      "Grieving a Loss": "heart_broken",
      "Going Through Divorce": "link_off",
      "Financial Crisis": "money_off",
      "Loneliness & Isolation": "person_off",
      "Caring for Aging Parents": "elderly",
      "Addiction Struggle": "psychology_alt",
      "Crisis of Faith": "help",
      "Chronic Illness": "medical_services",
      "Mental Health": "neurology",
    }
    return icons[topicName] || "explore"
  }

  const paragraphs = reflection.split(/\n\n+/).filter(p => p.trim())

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-gradient-to-b from-purple-50 via-background to-background shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-background/95 backdrop-blur-md p-4 justify-between border-b border-border">
        <button
          onClick={() => router.back()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-base font-bold text-purple-700">Deep Dive</h2>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <main className="flex-1 pb-10">
        {/* Topic Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">{getTopicIcon(topic)}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{topic}</h1>
              <p className="text-sm text-muted-foreground">{verseReference}</p>
            </div>
          </div>
        </div>

        {/* Verse Card */}
        <div className="px-5 mb-6">
          <div className="bg-purple-100 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-purple-900 italic leading-relaxed">"{verseText}"</p>
            <p className="text-xs text-purple-700 font-semibold mt-2">{verseReference}</p>
          </div>
        </div>

        {/* Reflection */}
        <div className="px-5">
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-purple-200">
            {isLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="size-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground text-sm">Crafting your reflection...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-destructive mb-2">error</span>
                <p className="text-destructive">{error}</p>
                <button
                  onClick={() => router.back()}
                  className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="prose max-w-none">
                {paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed text-[17px] mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Talk About It Button */}
        {!isLoading && !error && (
          <div className="px-5 mt-6">
            <button
              onClick={() => router.push(`/talk?deepDive=true&topic=${encodeURIComponent(topic)}`)}
              className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold shadow-lg active:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined">forum</span>
              Talk About This
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
