"use client"

import React, { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import { useLanguage } from "./language-context"

const CACHE_VERSION = "v11"

// Cache is now GLOBAL - same content for everyone viewing the same verse
// Personalization (age/situation) should happen at display time, not generation time

export interface VerseData {
  reference: string
  version: string
  text: string
}

export interface ContextData {
  whoIsSpeaking?: string
  originalListeners?: string
  whyTheConversation?: string
  historicalBackdrop?: string
  immediateImpact?: string
  longTermImpact?: string
  setting?: string
}

export interface StoryData {
  title: string
  text: string
  imagePrompt?: string
  img?: string
}

export interface PoetryData {
  title: string
  type: string
  text: string
  imagePrompt?: string
  img?: string
}

export interface ImageryData {
  title: string
  sub: string
  icon: string
  imagePrompt?: string
  img?: string
}

export interface SongData {
  title: string
  sub: string
  lyrics: string
  prompt: string
  imagePrompt?: string
  img?: string
}

export interface DevotionalData {
  verse?: VerseData
  interpretation?: string
  heroImage?: string
  heroImagePrompt?: string
  context?: ContextData
  contextImagePrompt?: string
  contextHeroImage?: string
  stories?: StoryData[]
  poetry?: PoetryData[]
  imagery?: ImageryData[]
  songs?: SongData
  source?: string // Track where this devotional came from (e.g., "Theme:Forgiveness", "YouVersion", etc.)
}

interface LoadingStates {
  verse: boolean
  interpretation: boolean
  context: boolean
  stories: boolean
  poetry: boolean
  imagery: boolean
  songs: boolean
}

interface DevotionalContextType {
  devotional: DevotionalData
  setDevotional: React.Dispatch<React.SetStateAction<DevotionalData>>
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  loadingStep: string
  setLoadingStep: React.Dispatch<React.SetStateAction<string>>
  loadingStates: LoadingStates
  generateDevotional: (source?: string) => Promise<void>
  generateForVerse: (verseQuery: string) => Promise<void>
  userName: string
  setUserName: React.Dispatch<React.SetStateAction<string>>
  clearCache: () => void
  isContentReady: boolean
}

const DevotionalContext = createContext<DevotionalContextType | null>(null)

export function useDevotional() {
  const context = useContext(DevotionalContext)
  if (!context) {
    throw new Error("useDevotional must be used within a DevotionalProvider")
  }
  return context
}

const initialLoadingStates: LoadingStates = {
  verse: false,
  interpretation: false,
  context: false,
  stories: false,
  poetry: false,
  imagery: false,
  songs: false,
}

interface UserProfile {
  ageRange: string
  gender: string
  stageSituation: string
  language?: string
  contentStyle?: "casual" | "academic"
}

// Rotating loading messages
const loadingMessages = [
  "Creating something unique just for you...",
  "Crafting your personal devotional...",
  "Building original content for your journey...",
  "This takes a moment—we're not using templates...",
  "Personalizing scripture for your life stage...",
  "Almost there—good things take time...",
  "Generating fresh insights just for you...",
]

export function DevotionalProvider({ children }: { children: ReactNode }) {
  const [devotional, setDevotional] = useState<DevotionalData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(initialLoadingStates)
  const [userName, setUserName] = useState("Friend")
  const [userProfile, setUserProfile] = useState<UserProfile>({
    ageRange: "",
    gender: "",
    stageSituation: "Nothing special",
    language: "en",
  })
  const [isContentReady, setIsContentReady] = useState(false)
  const { language: selectedLanguage } = useLanguage()

  // Rotating message effect
  const loadingMessageIndex = React.useRef(0)
  const loadingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const startLoadingMessages = useCallback(() => {
    loadingMessageIndex.current = 0
    setLoadingStep(loadingMessages[0])
    
    loadingIntervalRef.current = setInterval(() => {
      loadingMessageIndex.current = (loadingMessageIndex.current + 1) % loadingMessages.length
      setLoadingStep(loadingMessages[loadingMessageIndex.current])
    }, 3000) // Rotate every 3 seconds
  }, [])

  const stopLoadingMessages = useCallback(() => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current)
      loadingIntervalRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const storedVersion = localStorage.getItem("bible3_cache_version")
    console.log("[v0] Cache version check - stored:", storedVersion, "current:", CACHE_VERSION)

    if (storedVersion !== CACHE_VERSION) {
      console.log("[v0] Cache version mismatch! Clearing ALL cache...")
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith("bible3_cache_") && k !== "bible3_cache_version",
      )
      console.log("[v0] Clearing", keys.length, "old cache entries:", keys)
      keys.forEach((k) => localStorage.removeItem(k))
      localStorage.setItem("bible3_cache_version", CACHE_VERSION)
      console.log("[v0] Cache cleared and version updated to", CACHE_VERSION)
    }
  }, [])

  const getFreshProfile = useCallback((): UserProfile => {
    try {
      const savedProfile = localStorage.getItem("userProfile")
      console.log("[v0] getFreshProfile - raw localStorage:", savedProfile)
      console.log("[v0] getFreshProfile - selectedLanguage from context:", selectedLanguage)
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)
        const profile = {
          ageRange: parsed.ageRange || "",
          gender: parsed.gender || "",
          stageSituation: parsed.stageSituation || parsed.season || "Nothing special",
          language: selectedLanguage,
          contentStyle: parsed.contentStyle || "casual",
        }
        console.log("[v0] getFreshProfile - parsed profile with language:", profile)
        return profile
      }
    } catch (e) {
      console.error("Error parsing user profile:", e)
    }
    const defaultProfile = {
      ageRange: "",
      gender: "",
      stageSituation: "Nothing special",
      language: selectedLanguage,
      contentStyle: "casual" as const,
    }
    console.log("[v0] getFreshProfile - using default:", defaultProfile)
    return defaultProfile
  }, [selectedLanguage])

  React.useEffect(() => {
    const freshProfile = getFreshProfile()
    setUserProfile(freshProfile)
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        if (parsed.fullName) {
          setUserName(parsed.fullName.split(" ")[0])
        }
      } catch (e) {
        console.error("Error parsing user profile:", e)
      }
    }
  }, [getFreshProfile, selectedLanguage])

  const generateImage = async (
    prompt: string,
    width = 1024,
    height = 1024,
    profile?: UserProfile,
  ): Promise<string | null> => {
    console.log("[v0] generateImage called with prompt:", prompt.substring(0, 50) + "...")
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width, height, ageRange: profile?.ageRange }),
      })
      console.log("[v0] generateImage response status:", response.status)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] generateImage success, got URL:", data.imageUrl ? "yes" : "no")
        return data.imageUrl || null
      } else {
        const errorText = await response.text()
        console.error("[v0] generateImage failed:", errorText)
      }
    } catch (error) {
      console.error("[v0] generateImage error:", error)
    }
    return null
  }

  const getCacheKey = (reference: string, profile: UserProfile) => {
    // Global cache by verse + demographics
    // Same age/gender/situation combo gets the same cached content
    const age = profile.ageRange || "adult"
    const situation = profile.stageSituation || "general"
    const demographicKey = `${age}_${situation}`.toLowerCase().replace(/\s+/g, "_")
    const key = `bible3_cache_${reference.toLowerCase().replace(/[\s:]+/g, "_")}_${demographicKey}`
    console.log("[v0] getCacheKey:", key)
    return key
  }

  const loadFromCache = (reference: string, profile: UserProfile): DevotionalData | null => {
    const cacheKey = getCacheKey(reference, profile)
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    try {
      const parsed = JSON.parse(cached)
      console.log("[v0] loadFromCache - cached data keys:", Object.keys(parsed.data || parsed))

      const data = parsed.data || parsed

      const hasValidInterpretation =
        !!data.interpretation &&
        !data.interpretation.includes("Unable to generate") &&
        !data.interpretation.includes("error") &&
        data.interpretation.length > 50

      const hasStories = Array.isArray(data.stories) && data.stories.length > 0
      const hasHeroImage = !!data.heroImage
      const hasStoryImages = data.stories?.some((s: any) => s.img)
      const hasPoetryImages = data.poetry?.some((p: any) => p.img)

      console.log("[v0] loadFromCache - has valid interpretation:", hasValidInterpretation)
      console.log("[v0] loadFromCache - has stories:", hasStories)
      console.log("[v0] loadFromCache - has heroImage:", hasHeroImage)
      console.log("[v0] loadFromCache - has story images:", hasStoryImages)
      console.log("[v0] loadFromCache - has poetry images:", hasPoetryImages)

      if (hasValidInterpretation && hasStories && hasHeroImage && (hasStoryImages || hasPoetryImages)) {
        console.log("[v0] loadFromCache - returning VALID cached data WITH IMAGES")
        return data
      } else {
        console.log("[v0] loadFromCache - cache incomplete, missing images or text, deleting and returning null")
        localStorage.removeItem(cacheKey)
        return null
      }
    } catch (error) {
      console.error("[v0] loadFromCache - parse error:", error)
      localStorage.removeItem(cacheKey)
      return null
    }
  }

  const saveToCache = (reference: string, profile: UserProfile, devotional: DevotionalData) => {
    const cacheKey = getCacheKey(reference, profile)
    localStorage.setItem(cacheKey, JSON.stringify(devotional))
    console.log("[v0] saveToCache - saved with keys:", Object.keys(devotional))
  }

  const generateAllContent = useCallback(async (verse: VerseData, profile: UserProfile, onCoreReady: () => void, theme?: string) => {
    const { reference, text } = verse
    const profilePayload = {
      verseReference: reference,
      verseText: text,
      ageRange: profile.ageRange,
      gender: profile.gender,
      stageSituation: profile.stageSituation,
      language: profile.language || "en",
      contentStyle: profile.contentStyle || "casual",
      theme, // Pass theme for theme-based devotionals
    }

    const startTime = Date.now()
    console.log("[v0] ⏱️ GENERATION START:", reference, "at", new Date().toISOString())

    const completionTracker = {
      interpretation: false,
      heroImage: false,
      context: false,
      stories: false,
      poetry: false,
      imagery: false,
      songs: false,
    }

    // Check if core content (interpretation + hero image) is ready
    const checkCoreReady = () => {
      if (completionTracker.interpretation && completionTracker.heroImage) {
        console.log("[v0] ✅ CORE CONTENT READY - interpretation + hero image done")
        onCoreReady()
      }
    }

    const checkAndSaveCache = () => {
      const allDone = completionTracker.interpretation && 
                      completionTracker.heroImage &&
                      completionTracker.context && 
                      completionTracker.stories && 
                      completionTracker.poetry && 
                      completionTracker.imagery && 
                      completionTracker.songs
      if (allDone) {
        console.log("[v0] All content complete, saving to cache with images")
        setDevotional((currentDevotional) => {
          saveToCache(reference, profile, currentDevotional)
          return currentDevotional
        })
      }
    }

    const generateImagesInParallel = async (
      items: any[],
      onImageUpdate: (index: number, imageUrl: string) => void,
      profile: UserProfile,
    ) => {
      console.log("[v0] 🖼️ Generating", items.length, "images in parallel...")
      const imagePromises = items.map(async (item, i) => {
        const img = await generateImage(item.imagePrompt, 512, 512, profile)
        if (img) onImageUpdate(i, img)
      })
      await Promise.all(imagePromises)
    }

    console.log("[v0] 🚀 Firing ALL text APIs in parallel NOW")

    // INTERPRETATION + HERO IMAGE (core content)
    setLoadingStates((prev) => ({ ...prev, interpretation: true }))
    const interpretationStart = Date.now()
    fetch("/api/generate-interpretation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    })
      .then((res) => res.json())
      .then(async (data) => {
        console.log(`[v0] ✅ Interpretation TEXT received in ${Date.now() - interpretationStart}ms`)
        setDevotional((prev) => ({
          ...prev,
          interpretation: data.interpretation,
          heroImagePrompt: data.heroImagePrompt,
        }))
        setLoadingStates((prev) => ({ ...prev, interpretation: false }))
        completionTracker.interpretation = true
        // DON'T call checkCoreReady here - wait for hero image!
        
        if (data.heroImagePrompt) {
          const imgStart = Date.now()
          console.log("[v0] 🖼️ Starting hero IMAGE generation")
          const heroImage = await generateImage(data.heroImagePrompt, 1024, 768, profile)
          if (heroImage) {
            console.log(`[v0] ✅ Hero IMAGE received in ${Date.now() - imgStart}ms`)
            setDevotional((prev) => ({ ...prev, heroImage }))
          }
          completionTracker.heroImage = true
          // NOW call checkCoreReady - both interpretation and image are done
          checkCoreReady()
          checkAndSaveCache()
        } else {
          // No hero image needed, mark as done
          completionTracker.heroImage = true
          checkCoreReady()
          checkAndSaveCache()
        }
      })
      .catch((err) => {
        console.error("❌ Interpretation error:", err)
        setLoadingStates((prev) => ({ ...prev, interpretation: false }))
        completionTracker.interpretation = true
        completionTracker.heroImage = true
        checkCoreReady()
        checkAndSaveCache()
      })

    // CONTEXT
    setLoadingStates((prev) => ({ ...prev, context: true }))
    const contextStart = Date.now()
    fetch("/api/generate-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    })
      .then((res) => res.json())
      .then(async (data) => {
        console.log(`[v0] ✅ Context TEXT received in ${Date.now() - contextStart}ms`)
        setDevotional((prev) => ({ ...prev, context: data.context, contextImagePrompt: data.contextImagePrompt }))
        setLoadingStates((prev) => ({ ...prev, context: false }))
        if (data.contextImagePrompt) {
          const imgStart = Date.now()
          console.log("[v0] 🖼️ Starting context IMAGE generation")
          const contextHeroImage = await generateImage(data.contextImagePrompt, 1024, 768, profile)
          if (contextHeroImage) {
            console.log(`[v0] ✅ Context IMAGE received in ${Date.now() - imgStart}ms`)
            setDevotional((prev) => ({ ...prev, contextHeroImage }))
          }
        }
        completionTracker.context = true
        checkAndSaveCache()
      })
      .catch((err) => {
        console.error("❌ Context error:", err)
        setLoadingStates((prev) => ({ ...prev, context: false }))
        completionTracker.context = true
        checkAndSaveCache()
      })

    // STORIES
    setLoadingStates((prev) => ({ ...prev, stories: true }))
    const storiesStart = Date.now()

    const storyPromises = [
      fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profilePayload, storyType: "contemporary" }),
      }).then((res) => res.json()),
      fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profilePayload, storyType: "historical" }),
      }).then((res) => res.json()),
    ]

    Promise.all(storyPromises)
      .then(async ([story1Data, story2Data]) => {
        console.log(`[v0] ✅ Both Stories TEXT received in ${Date.now() - storiesStart}ms`)
        const stories = [
          story1Data.title ? story1Data : { title: "Story 1", text: "", imagePrompt: "" },
          story2Data.title ? story2Data : { title: "Story 2", text: "", imagePrompt: "" },
        ]
        setDevotional((prev) => ({ ...prev, stories }))
        setLoadingStates((prev) => ({ ...prev, stories: false }))

        const imgStart = Date.now()
        console.log("[v0] 📚 TEXT: Stories received, generating story images...")
        await generateImagesInParallel(
          stories,
          (i, img) => {
            console.log(`[v0] 🖼️ IMAGE: Story ${i + 1} image generated`)
            setDevotional((prev) => {
              const updated = [...(prev.stories || [])]
              if (updated[i]) updated[i] = { ...updated[i], img }
              return { ...prev, stories: updated }
            })
          },
          profile,
        )
        console.log(`[v0] ✅ All story images completed in ${Date.now() - imgStart}ms`)
        completionTracker.stories = true
        checkAndSaveCache()
      })
      .catch((err) => {
        console.error("❌ Stories error:", err)
        setLoadingStates((prev) => ({ ...prev, stories: false }))
        completionTracker.stories = true
        checkAndSaveCache()
      })

    // POETRY
    setLoadingStates((prev) => ({ ...prev, poetry: true }))
    const poetryStart = Date.now()

    const poemPromises = [
      fetch("/api/generate-poem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profilePayload, poemType: "classic" }),
      }).then((res) => res.json()),
      fetch("/api/generate-poem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profilePayload, poemType: "freeverse" }),
      }).then((res) => res.json()),
    ]

    Promise.all(poemPromises)
      .then(async ([data1, data2]) => {
        console.log(`[v0] ✅ Both Poems TEXT received in ${Date.now() - poetryStart}ms`)
        const poetry = [
          data1.poem || { title: "Classic Poem", type: "Classic Verse", text: "", imagePrompt: "" },
          data2.poem || { title: "Free Verse", type: "Free Verse", text: "", imagePrompt: "" },
        ]
        setDevotional((prev) => ({ ...prev, poetry }))
        setLoadingStates((prev) => ({ ...prev, poetry: false }))

        const imgStart = Date.now()
        console.log("[v0] 📝 TEXT: Poetry received, generating poetry images...")
        await generateImagesInParallel(
          poetry,
          (i, img) => {
            console.log(`[v0] 🖼️ IMAGE: Poem ${i + 1} image generated`)
            setDevotional((prev) => {
              const updated = [...(prev.poetry || [])]
              if (updated[i]) updated[i] = { ...updated[i], img }
              return { ...prev, poetry: updated }
            })
          },
          profile,
        )
        console.log(`[v0] ✅ All poem images completed in ${Date.now() - imgStart}ms`)
        completionTracker.poetry = true
        checkAndSaveCache()
      })
      .catch((err) => {
        console.error("❌ Poetry error:", err)
        setLoadingStates((prev) => ({ ...prev, poetry: false }))
        completionTracker.poetry = true
        checkAndSaveCache()
      })

    // IMAGERY
    setLoadingStates((prev) => ({ ...prev, imagery: true }))
    const imageryStart = Date.now()
    fetch("/api/generate-imagery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    })
      .then((res) => res.json())
      .then(async (data) => {
        console.log(`[v0] ✅ Imagery TEXT received in ${Date.now() - imageryStart}ms`)
        const imagery = data.imagery || []
        setDevotional((prev) => ({ ...prev, imagery }))
        setLoadingStates((prev) => ({ ...prev, imagery: false }))

        const imgStart = Date.now()
        console.log("[v0] 🎨 TEXT: Imagery received, generating imagery images...")
        await generateImagesInParallel(
          imagery,
          (i, img) => {
            console.log(`[v0] 🖼️ IMAGE: Imagery ${i + 1} image generated`)
            setDevotional((prev) => {
              const updated = [...(prev.imagery || [])]
              if (updated[i]) updated[i] = { ...updated[i], img }
              return { ...prev, imagery: updated }
            })
          },
          profile,
        )
        console.log(`[v0] ✅ All imagery images completed in ${Date.now() - imgStart}ms`)
        completionTracker.imagery = true
        checkAndSaveCache()
      })
      .catch((err) => {
        console.error("❌ Imagery error:", err)
        setLoadingStates((prev) => ({ ...prev, imagery: false }))
        completionTracker.imagery = true
        checkAndSaveCache()
      })

    // SONGS
    setLoadingStates((prev) => ({ ...prev, songs: true }))
    const songsStart = Date.now()
    fetch("/api/generate-songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    })
      .then((res) => res.json())
      .then(async (data) => {
        console.log(`[v0] ✅ Songs TEXT received in ${Date.now() - songsStart}ms`)
        const songs = data.songs
        setDevotional((prev) => ({ ...prev, songs }))
        setLoadingStates((prev) => ({ ...prev, songs: false }))
        if (songs?.imagePrompt) {
          const imgStart = Date.now()
          console.log("[v0] 🎵 TEXT: Songs received, generating song image...")
          const img = await generateImage(songs.imagePrompt, 512, 512, profile)
          if (img) {
            console.log("[v0] 🖼️ IMAGE: Song image generated")
            setDevotional((prev) => ({
              ...prev,
              songs: prev.songs ? { ...prev.songs, img } : undefined,
            }))
          }
        }
        completionTracker.songs = true
        checkAndSaveCache()

        const totalTime = Date.now() - startTime
        console.log(`[v0] ⏱️ TOTAL GENERATION TIME: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`)
      })
      .catch((err) => {
        console.error("❌ Songs error:", err)
        setLoadingStates((prev) => ({ ...prev, songs: false }))
        completionTracker.songs = true
        checkAndSaveCache()
      })
  }, [])

  const currentVerseRef = React.useRef<string | null>(null)
  const currentProfileRef = React.useRef<UserProfile | null>(null)

  // Generate THEME-based devotional (no verse, just discuss the theme)
  const generateThemeDevotional = useCallback(
    async (theme: string, profile: UserProfile) => {
      console.log("[v0] generateThemeDevotional - theme:", theme)
      
      const cacheKey = getCacheKey(`theme_${theme}`, profile)
      const cached = loadFromCache(`theme_${theme}`, profile)
      if (cached) {
        console.log("[v0] Theme devotional found in cache")
        setDevotional({ ...cached, source: `Theme:${theme}` })
        setLoadingStates(initialLoadingStates)
        setIsLoading(false)
        setIsContentReady(true)
        stopLoadingMessages()
        currentVerseRef.current = `theme_${theme}`
        currentProfileRef.current = profile
        return
      }

      setDevotional({ source: `Theme:${theme}` })
      setLoadingStates((prev) => ({ ...prev, verse: false, interpretation: true }))

      currentVerseRef.current = `theme_${theme}`
      currentProfileRef.current = profile

      const startTime = Date.now()
      
      // Call interpretation API with ONLY the theme (no verse)
      try {
        const interpretationResponse = await fetch("/api/generate-interpretation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme,
            ageRange: profile.ageRange,
            language: profile.language || "en",
            contentStyle: profile.contentStyle || "casual",
          }),
        })

        if (!interpretationResponse.ok) throw new Error("Failed to generate theme teaching")
        
        const data = await interpretationResponse.json()
        console.log(`[v0] ✅ Theme teaching received in ${Date.now() - startTime}ms`)
        
        setDevotional((prev) => ({
          ...prev,
          interpretation: data.interpretation,
          heroImagePrompt: data.heroImagePrompt,
        }))
        setLoadingStates((prev) => ({ ...prev, interpretation: false }))

        // Generate hero image
        if (data.heroImagePrompt) {
          const heroImage = await generateImage(data.heroImagePrompt, 1024, 768, profile)
          if (heroImage) {
            setDevotional((prev) => ({ ...prev, heroImage }))
          }
        }

        // Core content ready - show the page
        stopLoadingMessages()
        setIsLoading(false)
        setIsContentReady(true)

        // Save to cache
        setDevotional((currentDevotional) => {
          saveToCache(`theme_${theme}`, profile, currentDevotional)
          return currentDevotional
        })

        console.log(`[v0] ⏱️ Theme devotional complete in ${Date.now() - startTime}ms`)
      } catch (error) {
        console.error("Theme generation failed:", error)
        setLoadingStep("Connection error. Please try again.")
        stopLoadingMessages()
        setTimeout(() => {
          setIsLoading(false)
          setLoadingStates(initialLoadingStates)
        }, 2000)
      }
    },
    [stopLoadingMessages],
  )

  const generateDevotional = useCallback(
    async (source = "Random") => {
      setIsLoading(true)
      setIsContentReady(false)
      startLoadingMessages()
      setDevotional({})
      setLoadingStates({ ...initialLoadingStates, verse: true })

      const freshProfile = getFreshProfile()
      console.log("[v0] generateDevotional START - source:", source)
      console.log("[v0] generateDevotional - freshProfile:", JSON.stringify(freshProfile))
      setUserProfile(freshProfile)

      // THEME-BASED: No verse, just discuss the theme
      if (source.startsWith("Theme:")) {
        const theme = source.split(":")[1]
        await generateThemeDevotional(theme, freshProfile)
        return
      }

      // VERSE-BASED: YouVersion, Find a Verse, etc.
      try {
        const isVerseReference = /^[A-Za-z0-9\s]+\d+:\d+/.test(source)

        const verseResponse = await fetch("/api/generate-verse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isVerseReference
              ? { verseQuery: source }
              : { source },
          ),
        })

        if (!verseResponse.ok) throw new Error("Failed to get verse")

        const verse = await verseResponse.json()
        console.log("[v0] generateDevotional - verse received:", verse.reference)

        const cacheKey = getCacheKey(verse.reference, freshProfile)
        console.log("[v0] generateDevotional - looking for cache key:", cacheKey)

        const cached = loadFromCache(verse.reference, freshProfile)
        if (cached) {
          setDevotional({ ...cached, source })
          setLoadingStates(initialLoadingStates)
          setIsLoading(false)
          setIsContentReady(true)
          stopLoadingMessages()
          currentVerseRef.current = verse.reference
          currentProfileRef.current = freshProfile
          return
        }

        setDevotional({ verse, source })
        setLoadingStates((prev) => ({ ...prev, verse: false }))

        currentVerseRef.current = verse.reference
        currentProfileRef.current = freshProfile
        
        // Generate content and wait for core content to be ready
        generateAllContent(verse, freshProfile, () => {
          // This callback fires when interpretation + hero image are ready
          console.log("[v0] Core content ready - stopping loading state")
          stopLoadingMessages()
          setIsLoading(false)
          setIsContentReady(true)
        })
      } catch (error) {
        console.error("Generation failed:", error)
        setLoadingStep("Connection error. Please try again.")
        stopLoadingMessages()
        setTimeout(() => {
          setIsLoading(false)
          setLoadingStates(initialLoadingStates)
        }, 2000)
      }
    },
    [generateAllContent, generateThemeDevotional, startLoadingMessages, stopLoadingMessages, getFreshProfile],
  )

  const generateForVerse = useCallback(
    async (verseQuery: string) => {
      setIsLoading(true)
      setIsContentReady(false)
      startLoadingMessages()
      setDevotional({})
      setLoadingStates({ ...initialLoadingStates, verse: true })

      const freshProfile = getFreshProfile()
      setUserProfile(freshProfile)

      try {
        const cached = loadFromCache(verseQuery, freshProfile)
        if (cached && cached.verse) {
          setDevotional(cached)
          setLoadingStates(initialLoadingStates)
          setIsLoading(false)
          setIsContentReady(true)
          stopLoadingMessages()
          currentVerseRef.current = verseQuery
          currentProfileRef.current = freshProfile
          return
        }

        const verseResponse = await fetch("/api/generate-verse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verseQuery }),
        })

        if (!verseResponse.ok) throw new Error("Failed to get verse")

        const verse = await verseResponse.json()

        const cachedByRef = loadFromCache(verse.reference, freshProfile)
        if (cachedByRef) {
          setDevotional(cachedByRef)
          setLoadingStates(initialLoadingStates)
          setIsLoading(false)
          setIsContentReady(true)
          stopLoadingMessages()
          currentVerseRef.current = verse.reference
          currentProfileRef.current = freshProfile
          return
        }

        setDevotional({ verse })
        setLoadingStates((prev) => ({ ...prev, verse: false }))

        currentVerseRef.current = verse.reference
        currentProfileRef.current = freshProfile
        
        generateAllContent(verse, freshProfile, () => {
          stopLoadingMessages()
          setIsLoading(false)
          setIsContentReady(true)
        })
      } catch (error) {
        console.error("Generation failed:", error)
        setLoadingStep("Connection error. Please try again.")
        stopLoadingMessages()
        setTimeout(() => {
          setIsLoading(false)
          setLoadingStates(initialLoadingStates)
        }, 2000)
      }
    },
    [generateAllContent, startLoadingMessages, stopLoadingMessages, getFreshProfile],
  )

  const clearCache = useCallback(() => {
    console.log("[v0] clearCache called")
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("bible3_cache_"))
    console.log("[v0] Found cache keys to delete:", keys)
    keys.forEach((k) => {
      console.log("[v0] Removing cache key:", k)
      localStorage.removeItem(k)
    })
    console.log("[v0] Cache cleared! Deleted", keys.length, "entries")
    setDevotional({})
  }, [])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).clearBibleCache = () => {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("bible3_cache_"))
        console.log("[v0] Manual cache clear - found keys:", keys)
        keys.forEach((k) => localStorage.removeItem(k))
        console.log("[v0] Cleared", keys.length, "cache entries")
        alert(`Cleared ${keys.length} cache entries. Refresh the page.`)
      }
      console.log("[v0] window.clearBibleCache() is now available")
    }
  }, [])

  React.useEffect(() => {
    if (currentVerseRef.current && currentProfileRef.current && devotional.verse) {
      saveToCache(currentVerseRef.current, currentProfileRef.current, devotional)
    }
  }, [devotional])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopLoadingMessages()
    }
  }, [stopLoadingMessages])

  return (
    <DevotionalContext.Provider
      value={{
        devotional,
        setDevotional,
        isLoading,
        setIsLoading,
        loadingStep,
        setLoadingStep,
        loadingStates,
        generateDevotional,
        generateForVerse,
        userName,
        setUserName,
        clearCache,
        isContentReady,
      }}
    >
      {children}
    </DevotionalContext.Provider>
  )
}
