"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useDevotional } from "@/context/devotional-context"
import { useSubscription } from "@/context/subscription-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { BottomNav } from "@/components/bottom-nav"

export default function LandingPage() {
  const router = useRouter()
  const { userName, isLoading, loadingStep, generateDevotional, isContentReady } = useDevotional()
  const { canSearchCustomVerse, isTrialActive, daysLeftInTrial } = useSubscription()
  const { t } = useLanguage()
  const [currentProfile, setCurrentProfile] = useState({ ageRange: "", stageSituation: "" })
  const [waitingForContent, setWaitingForContent] = useState(false)

  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setCurrentProfile({
            ageRange: parsed.ageRange || "",
            stageSituation: parsed.stageSituation || "General",
          })
        } catch (e) {
          console.error("Error parsing user profile:", e)
        }
      }
    }

    loadProfile()

    window.addEventListener("focus", loadProfile)
    return () => window.removeEventListener("focus", loadProfile)
  }, [])

  // Navigate to verse page once content is ready
  useEffect(() => {
    if (waitingForContent && isContentReady) {
      // Small delay to ensure state is fully propagated before navigation
      const timer = setTimeout(() => {
        router.push("/verse")
        // Keep waitingForContent true until after navigation starts
        // This prevents the home screen from flashing
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [waitingForContent, isContentReady, router])

  const handleGenerateDevotional = async (source: string) => {
    setWaitingForContent(true)
    await generateDevotional(source)
  }

  const getProfileLabel = () => {
    if (!currentProfile.ageRange) return "Set up your profile"
    const parts = [currentProfile.ageRange]
    if (currentProfile.stageSituation && currentProfile.stageSituation !== "General") {
      parts.push(currentProfile.stageSituation)
    }
    return parts.join(" · ")
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-[#0c1929]">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <Image
          src="/images/bible-20for-20life-20stages-20-20christianity.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1929] via-[#0c1929]/80 to-[#0c1929]/60"></div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector variant="compact" />
      </div>

      {/* Loading Overlay */}
      {(isLoading || waitingForContent) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0c1929]/95 backdrop-blur-sm text-white p-6 text-center">
          <div className="relative size-24 mb-6">
            <div className="absolute inset-0 border-4 border-amber-400/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-4 border-amber-400/50 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-amber-400">auto_awesome</span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-3 text-amber-100">Creating Your Devotional</h2>
          
          <p className="text-sm text-blue-200 animate-pulse max-w-xs mb-4">
            {loadingStep}
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-xs border border-amber-400/20">
            <p className="text-xs text-blue-100/80 leading-relaxed">
              We&apos;re generating <span className="text-amber-200 font-semibold">truly original content</span> personalized just for you—not templates. This takes a few moments, but the wait is worth it.
            </p>
          </div>
          
          <div className="flex gap-2 mt-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col px-6 pt-10 pb-24 gap-8">
        {/* Logo & Title */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/50 border-2 border-amber-400/30">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Book%20of%20Life%20-%20Christian%20-%20Video-uZ0vBJPjlZIbPlSRaiqQ0zfvwyuxsh.mp4" type="video/mp4" />
            </video>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white text-center">Bible for Life Stages</h1>
          <p className="text-sm text-blue-200/80 mt-1">Scripture that speaks to where you are</p>
          {isTrialActive && (
            <div className="mt-3 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30">
              <p className="text-xs text-amber-100">
                {t("trial")}: {daysLeftInTrial} {daysLeftInTrial === 1 ? t("dayLeft") : t("daysLeft")}
              </p>
            </div>
          )}
        </div>

        {/* Welcome & Profile */}
        <div className="flex flex-col items-center text-center text-white">
          <h2 className="text-lg font-semibold text-amber-100">
            {t("welcome")}, {userName}
          </h2>
          <button
            onClick={() => router.push("/profile")}
            className="mt-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs text-amber-100 hover:bg-white/20 transition-colors flex items-center gap-1.5 border border-amber-400/30"
          >
            <span className="material-symbols-outlined text-base">person</span>
            {getProfileLabel()}
          </button>
        </div>

        {/* Main Options */}
        <div className="flex flex-col gap-4 flex-1 justify-center">
          <p className="text-xs font-semibold text-amber-200/80 text-center uppercase tracking-wider">Start Your Devotional</p>
          
          {/* YouVersion - Primary CTA */}
          <button
            onClick={() => handleGenerateDevotional("YouVersion")}
            disabled={isLoading || waitingForContent}
            className="relative w-full rounded-2xl p-6 bg-gradient-to-br from-amber-600 to-orange-700 shadow-xl transition active:scale-[0.98] disabled:opacity-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
                <Image
                  src="/images/bible-com.jpg"
                  alt="YouVersion Bible"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Today&apos;s Verse</p>
                <h3 className="text-xl font-bold text-white">Bible.com Verse of the Day</h3>
                <p className="text-white/70 text-xs mt-1">Personalized just for you</p>
              </div>
              <span className="material-symbols-outlined text-white/80 text-2xl">arrow_forward</span>
            </div>
          </button>

          {/* Find a Verse - Secondary */}
          <button
            onClick={() => (canSearchCustomVerse ? router.push("/selection") : null)}
            disabled={!canSearchCustomVerse || isLoading || waitingForContent}
            className={`relative w-full rounded-2xl p-5 transition active:scale-[0.98] border ${
              canSearchCustomVerse
                ? "bg-white/10 backdrop-blur-sm hover:bg-white/15 border-white/20"
                : "bg-gray-500/10 border-gray-500/20 opacity-60"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-400/30">
                <span className="material-symbols-outlined text-3xl text-amber-300">search</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Find a Verse
                  {!canSearchCustomVerse && <span className="material-symbols-outlined text-base text-amber-400">lock</span>}
                </h3>
                <p className="text-blue-200/70 text-xs mt-0.5">Search any scripture by reference</p>
              </div>
              <span className="material-symbols-outlined text-white/50 text-xl">arrow_forward</span>
            </div>
          </button>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-xs text-blue-200/40">AI-powered devotionals tailored to your life stage</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
