"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDevotional } from "@/context/devotional-context"
import { useSubscription } from "@/context/subscription-context"
import { HeaderDropdown } from "@/components/header-dropdown"
import { UpgradePrompt } from "@/components/upgrade-prompt"

// Deep Dive topics available to users - organized by category
const DEEP_DIVE_TOPICS = [
  // Life Celebrations
  { id: "new-baby", label: "New Baby at Home", icon: "child_care", desc: "Adjusting to parenthood", category: "celebration" },
  { id: "newly-married", label: "Newly Married", icon: "favorite", desc: "Building a life together", category: "celebration" },
  { id: "new-job", label: "Starting a New Job", icon: "work", desc: "New career chapter", category: "celebration" },
  { id: "retirement", label: "Entering Retirement", icon: "beach_access", desc: "New season of life", category: "celebration" },
  
  // Family & Relationships
  { id: "marriage-struggles", label: "Marriage Struggles", icon: "heart_broken", desc: "When marriage is hard", category: "family" },
  { id: "divorce", label: "Going Through Divorce", icon: "link_off", desc: "Navigating separation", category: "family" },
  { id: "single-parenting", label: "Single Parenting", icon: "escalator_warning", desc: "Raising kids alone", category: "family" },
  { id: "prodigal-child", label: "Wayward Child", icon: "directions_walk", desc: "When kids walk away", category: "family" },
  { id: "infertility", label: "Infertility Journey", icon: "nest_cam_wired_stand", desc: "Longing for a child", category: "family" },
  { id: "blended-family", label: "Blended Family", icon: "groups", desc: "Stepparenting & merging", category: "family" },
  { id: "autism-support", label: "Supporting Someone with Autism", icon: "neurology", desc: "Understanding & supporting", category: "family" },
  { id: "special-needs", label: "Special Needs Family", icon: "family_restroom", desc: "Disabilities & challenges", category: "family" },
  { id: "aging-parents", label: "Caring for Aging Parents", icon: "elderly", desc: "Caregiver support", category: "family" },
  { id: "empty-nest", label: "Empty Nest", icon: "home", desc: "Kids have left", category: "family" },
  
  // Health & Loss
  { id: "cancer-fighting", label: "Fighting Cancer", icon: "healing", desc: "For those in treatment", category: "health" },
  { id: "cancer-support", label: "Supporting Someone Sick", icon: "volunteer_activism", desc: "Caregivers & loved ones", category: "health" },
  { id: "chronic-illness", label: "Chronic Illness", icon: "medical_services", desc: "Living with ongoing issues", category: "health" },
  { id: "grief", label: "Grieving a Death", icon: "sentiment_very_dissatisfied", desc: "Loss of a loved one", category: "health" },
  { id: "miscarriage", label: "Miscarriage or Loss of Child", icon: "child_friendly", desc: "Grieving a baby", category: "health" },
  
  // Mental & Emotional
  { id: "depression", label: "Depression", icon: "cloud", desc: "When darkness lingers", category: "mental" },
  { id: "anxiety", label: "Anxiety & Worry", icon: "psychology", desc: "Overwhelmed by fear", category: "mental" },
  { id: "loneliness", label: "Loneliness & Isolation", icon: "person_off", desc: "Feeling disconnected", category: "mental" },
  { id: "burnout", label: "Burnout & Exhaustion", icon: "battery_0_bar", desc: "Running on empty", category: "mental" },
  { id: "addiction", label: "Addiction Struggle", icon: "psychology_alt", desc: "Self or loved one", category: "mental" },
  
  // Work & Finances
  { id: "job-loss", label: "Job Loss", icon: "work_off", desc: "Unemployment & uncertainty", category: "work" },
  { id: "financial-crisis", label: "Financial Crisis", icon: "money_off", desc: "Struggling with money", category: "work" },
  { id: "work-stress", label: "Toxic Work Environment", icon: "business", desc: "Difficult workplace", category: "work" },
  { id: "career-change", label: "Career Uncertainty", icon: "explore", desc: "What should I do?", category: "work" },
  
  // Faith & Purpose
  { id: "faith-doubt", label: "Doubting My Faith", icon: "help", desc: "Wrestling with belief", category: "faith" },
  { id: "feeling-far-from-god", label: "Feeling Far from God", icon: "cloud_off", desc: "Spiritual dryness", category: "faith" },
  { id: "unanswered-prayer", label: "Unanswered Prayer", icon: "hourglass_empty", desc: "When God seems silent", category: "faith" },
  { id: "purpose", label: "Finding My Purpose", icon: "lightbulb", desc: "Why am I here?", category: "faith" },
  { id: "forgiving-someone", label: "Struggling to Forgive", icon: "handshake", desc: "Letting go of hurt", category: "faith" },
]

export default function VerseInterpretationPage() {
  const router = useRouter()
  const { devotional, loadingStates, isLoading } = useDevotional()
  const { canAccessCore, tier } = useSubscription()
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasWaited, setHasWaited] = useState(false)
  const [showDeepDiveModal, setShowDeepDiveModal] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowHeaderTitle(window.scrollY > 150)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Wait 5 seconds before allowing redirect - gives time for verse to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasWaited(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Extract theme name from source if it's a theme-based devotional
  const isThemeBased = devotional.source?.startsWith("Theme:")
  const themeName = isThemeBased ? devotional.source?.split(":")[1] : null

  // Only redirect if we've waited AND there's no content AND we're not loading
  useEffect(() => {
    const hasContent = devotional.verse?.reference || devotional.interpretation
    if (hasWaited && !hasContent && !isLoading) {
      router.push("/")
    }
  }, [hasWaited, devotional.verse?.reference, devotional.interpretation, isLoading, router])

  // Show loading state while waiting for content
  if (!devotional.verse && !devotional.interpretation) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center max-w-md mx-auto bg-gradient-to-b from-orange-50 via-background to-background shadow-2xl">
        <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">{isThemeBased ? "Generating teaching..." : "Loading scripture..."}</p>
      </div>
    )
  }

  // For theme-based devotionals, we don't have a verse to display
  const verseText = devotional.verse?.text 
    ? (devotional.verse.text.startsWith('"') ? devotional.verse.text : `"${devotional.verse.text}"`)
    : null

  const interpretationParagraphs = devotional.interpretation
    ? devotional.interpretation.split(/\n\n+/).filter((p) => p.trim().length > 0)
    : []

  // Fixed 6 buttons: Context, Stories, Poetry, Imagery, Songs, Deep Dive
  const deepenItems = [
    {
      label: "Context",
      sub: "The backstory",
      icon: "history_edu",
      path: "/context",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-100",
      text: "text-amber-700",
      requiresCore: true,
    },
    {
      label: "Stories",
      sub: "Real-life moments",
      icon: "menu_book",
      path: "/stories",
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      requiresCore: true,
    },
    {
      label: "Poetry",
      sub: "Beautiful verses",
      icon: "edit_note",
      path: "/poetry",
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-100",
      text: "text-purple-700",
      requiresCore: true,
    },
    {
      label: "Imagery",
      sub: "Visual symbols",
      icon: "image",
      path: "/imagery",
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-100",
      text: "text-blue-700",
      requiresCore: true,
    },
    {
      label: "Songs",
      sub: "Worship music",
      icon: "music_note",
      path: "/songs",
      color: "from-rose-500 to-red-500",
      bg: "bg-rose-100",
      text: "text-rose-700",
      requiresCore: true,
    },
    {
      label: "Deep Dive",
      sub: "Go deeper on hard topics",
      icon: "explore",
      path: "", // Opens modal instead
      color: "from-blue-600 to-purple-600",
      bg: "bg-blue-100",
      text: "text-blue-700",
      requiresCore: true,
      isDeepDive: true,
    },
  ]

  const handleDeepDiveSelect = (topicId: string) => {
    const topic = DEEP_DIVE_TOPICS.find(t => t.id === topicId)
    if (topic) {
      setShowDeepDiveModal(false)
      router.push(`/deep-dive?topic=${encodeURIComponent(topic.label)}`)
    }
  }

  const heroImageUrl = devotional.heroImage || "/spiritual-peaceful-landscape-golden-hour.jpg"
  const isInterpretationLoading = loadingStates?.interpretation

  // Deep Dive limits
  const deepDiveLimit = tier === "free" ? 0 : tier === "core" ? 1 : 5
  const deepDiveLimitText = tier === "free" ? "Upgrade for access" : tier === "core" ? "1/day" : "5/day"

  return (
    <div
      ref={mainRef}
      className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-gradient-to-b from-orange-50 via-background to-background shadow-2xl"
    >
      {/* Deep Dive Modal */}
      {showDeepDiveModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden shadow-xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">explore</span>
                <div>
                  <h3 className="font-bold">Deep Dive</h3>
                  <p className="text-xs text-white/80">{deepDiveLimitText}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeepDiveModal(false)}
                className="size-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-muted-foreground mb-4">
                Select a topic to explore today's verse through that lens:
              </p>
              
              {tier === "free" ? (
                <div className="text-center py-8">
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-muted-foreground">lock</span>
                  </div>
                  <h4 className="font-bold mb-2">Upgrade to Access Deep Dives</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get personalized reflections for life's hardest moments.
                  </p>
                  <button
                    onClick={() => {
                      setShowDeepDiveModal(false)
                      router.push("/subscription")
                    }}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                  >
                    View Plans
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Life Celebrations */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">celebration</span>
                      New Beginnings
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DEEP_DIVE_TOPICS.filter(t => t.category === "celebration").map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleDeepDiveSelect(topic.id)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
                        >
                          <span className="material-symbols-outlined text-emerald-600 text-lg">{topic.icon}</span>
                          <span className="text-xs font-medium leading-tight">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Family & Relationships */}
                  <div>
                    <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">family_restroom</span>
                      Family & Relationships
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DEEP_DIVE_TOPICS.filter(t => t.category === "family").map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleDeepDiveSelect(topic.id)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:border-rose-300 hover:bg-rose-50 transition-all text-left"
                        >
                          <span className="material-symbols-outlined text-rose-600 text-lg">{topic.icon}</span>
                          <span className="text-xs font-medium leading-tight">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Health & Loss */}
                  <div>
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">healing</span>
                      Health & Loss
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DEEP_DIVE_TOPICS.filter(t => t.category === "health").map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleDeepDiveSelect(topic.id)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                        >
                          <span className="material-symbols-outlined text-blue-600 text-lg">{topic.icon}</span>
                          <span className="text-xs font-medium leading-tight">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mental & Emotional */}
                  <div>
                    <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      Mental & Emotional
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DEEP_DIVE_TOPICS.filter(t => t.category === "mental").map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleDeepDiveSelect(topic.id)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                        >
                          <span className="material-symbols-outlined text-purple-600 text-lg">{topic.icon}</span>
                          <span className="text-xs font-medium leading-tight">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Work & Finances */}
                  <div>
                    <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">work</span>
                      Work & Finances
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DEEP_DIVE_TOPICS.filter(t => t.category === "work").map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleDeepDiveSelect(topic.id)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:border-amber-300 hover:bg-amber-50 transition-all text-left"
                        >
                          <span className="material-symbols-outlined text-amber-600 text-lg">{topic.icon}</span>
                          <span className="text-xs font-medium leading-tight">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Faith & Purpose */}
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">church</span>
                      Faith & Purpose
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DEEP_DIVE_TOPICS.filter(t => t.category === "faith").map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleDeepDiveSelect(topic.id)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                        >
                          <span className="material-symbols-outlined text-indigo-600 text-lg">{topic.icon}</span>
                          <span className="text-xs font-medium leading-tight">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 flex items-center bg-background/95 backdrop-blur-md p-4 justify-between border-b border-border">
        <button
          onClick={() => router.push("/")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2
          className={`text-base font-bold transition-opacity duration-300 ${
            showHeaderTitle ? "opacity-100" : "opacity-0"
          }`}
        >
          {isThemeBased ? themeName : devotional.verse?.reference}
        </h2>
        <div className="flex items-center gap-1">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-muted transition-colors">
            <span className="material-symbols-outlined">bookmark_border</span>
          </button>
          {devotional.verse?.reference && <HeaderDropdown verseReference={devotional.verse.reference} />}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 pb-10">
        {/* Hero Image */}
        <div className="w-full px-4 pt-2 pb-6">
          <div
            className="w-full aspect-square bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-2xl shadow-lg relative bg-muted"
            style={{ backgroundImage: `url('${heroImageUrl}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Theme or Verse Section */}
        <div className="px-6 mb-8 text-center">
          {isThemeBased ? (
            // THEME-BASED: Show theme name as main heading
            <>
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">
                Today&apos;s Theme
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-snug text-foreground">
                {themeName}
              </h1>
            </>
          ) : (
            // VERSE-BASED: Show verse text with reference
            <>
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">
                Verse of the Day
              </p>
              <h1 className="font-serif text-2xl md:text-3xl font-light leading-snug mb-4">{verseText}</h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-border"></div>
                <p className="text-muted-foreground text-sm font-semibold tracking-wide">
                  {devotional.verse?.reference} ({devotional.verse?.version})
                </p>
                <div className="h-px w-8 bg-border"></div>
              </div>
            </>
          )}
        </div>

        {/* Teaching/Breakdown Section */}
        <div className="px-5 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">{isThemeBased ? "menu_book" : "auto_awesome"}</span>
              </div>
              <h2 className="text-lg font-bold">{isThemeBased ? "What the Bible Says" : "Friendly Breakdown"}</h2>
            </div>

            {isInterpretationLoading || interpretationParagraphs.length === 0 ? (
              <div className="flex flex-col gap-3 py-4">
                {!isInterpretationLoading && interpretationParagraphs.length === 0 && (
                  <p className="text-destructive text-sm">Unable to generate interpretation. Please try again.</p>
                )}
                {isInterpretationLoading && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/20 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="prose max-w-none text-muted-foreground leading-relaxed text-[17px]">
                  <p className="mb-4">{interpretationParagraphs[0]}</p>

                  {isExpanded &&
                    interpretationParagraphs.slice(1).map((paragraph, i) => (
                      <p key={i} className="mb-4 last:mb-0 animate-in fade-in duration-300">
                        {paragraph}
                      </p>
                    ))}
                </div>
                {interpretationParagraphs.length > 1 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary/80 transition-colors"
                    >
                      {isExpanded ? "Show Less" : "Continue Reading"}
                      <span
                        className={`material-symbols-outlined text-base transition-transform duration-300 ${
                          isExpanded ? "rotate-[-90deg]" : ""
                        }`}
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Deepen Your Faith Section - Only for verse-based devotionals */}
        {!isThemeBased && (
        <div className="px-5 pb-8">
          <h3 className="text-lg font-bold mb-4 px-1">Dive Deeper</h3>

          {!canAccessCore && (
            <div className="mb-4">
              <UpgradePrompt feature="Stories, Poetry, Imagery, Songs, and Context" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {deepenItems.map((item, idx) => {
              const isLocked = item.requiresCore && !canAccessCore
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isLocked) return
                    if (item.isDeepDive) {
                      setShowDeepDiveModal(true)
                    } else {
                      router.push(item.path)
                    }
                  }}
                  disabled={isLocked}
                  className={`group flex flex-col items-start p-4 bg-card rounded-xl border border-border shadow-sm transition-all ${
                    isLocked ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98] hover:shadow-md"
                  }`}
                >
                  <div
                    className={`size-10 rounded-full bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 relative`}
                  >
                    <span className="material-symbols-outlined">{isLocked ? "lock" : item.icon}</span>
                  </div>
                  <span className="font-bold block">{item.label}</span>
                  <span className={`text-xs ${item.text} mt-1 text-left font-medium`}>{item.sub}</span>
                </button>
              )
            })}
          </div>

          {/* Let's Talk - Full Width Below */}
          <button
            onClick={() => router.push("/talk")}
            className="mt-3 w-full flex items-center p-4 bg-card rounded-xl border border-border shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
          >
            <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center mr-4">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div className="flex-1 text-left">
              <span className="font-bold block">Let's Talk</span>
              <span className="text-xs text-indigo-700 font-medium">Chat about today's verse</span>
            </div>
            <span className="material-symbols-outlined text-indigo-500">arrow_forward</span>
          </button>
        </div>
        )}
      </main>
    </div>
  )
}
