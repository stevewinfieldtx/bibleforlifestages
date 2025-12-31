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
  const [currentProfile, setCurrentProfile] = useState({ ageRange: "", gender: "", stageSituation: "" })
  const [waitingForContent, setWaitingForContent] = useState(false)

  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setCurrentProfile({
            ageRange: parsed.ageRange || "",
            gender: parsed.gender || "",
            stageSituation: parsed.stageSituation || "Nothing special",
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
      setWaitingForContent(false)
      router.push("/verse")
    }
  }, [waitingForContent, isContentReady, router])

  const handleGenerateDevotional = async (source: string) => {
    setWaitingForContent(true)
    await generateDevotional(source)
    // Navigation will happen via the useEffect above when isContentReady becomes true
  }

  const getProfileLabel = () => {
    if (!currentProfile.ageRange && !currentProfile.gender) return "Set up your profile"
    const parts = []
    if (currentProfile.ageRange) parts.push(currentProfile.ageRange)
    if (currentProfile.gender) parts.push(currentProfile.gender)
    if (currentProfile.stageSituation && currentProfile.stageSituation !== "Nothing special") {
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

      {/* Loading Overlay - stays until content is ready */}
      {(isLoading || waitingForContent) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0c1929]/95 backdrop-blur-sm text-white p-6 text-center">
          {/* Animated rings */}
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
          
          {/* Progress dots */}
          <div className="flex gap-2 mt-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col px-6 pt-8 pb-24 gap-8">
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/50 border-2 border-amber-400/30">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Book%20of%20Life%20-%20Christian%20-%20Video-uZ0vBJPjlZIbPlSRaiqQ0zfvwyuxsh.mp4" type="video/mp4" />
            </video>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white text-center">Bible for Life Stages</h1>
          <p className="mt-1 text-sm text-blue-200/80">Scripture that speaks to where you are</p>
          {isTrialActive && (
            <div className="mt-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30">
              <p className="text-xs text-amber-100">
                {t("trial")}: {daysLeftInTrial} {daysLeftInTrial === 1 ? t("dayLeft") : t("daysLeft")}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col items-center text-center text-white mb-6">
            <h2 className="text-xl font-semibold text-amber-100">
              {t("welcome")}, {userName}
            </h2>
            <p className="mt-1 max-w-xs text-sm text-blue-100/70">{t("discoverInspiration")}</p>
            <button
              onClick={() => router.push("/profile")}
              className="mt-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs text-amber-100 hover:bg-white/20 transition-colors flex items-center gap-1.5 border border-amber-400/30"
            >
              <span className="material-symbols-outlined text-sm">person</span>
              {getProfileLabel()}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => (canSearchCustomVerse ? router.push("/selection") : null)}
              disabled={!canSearchCustomVerse || isLoading || waitingForContent}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-lg transition active:scale-[0.98] ${
                canSearchCustomVerse
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-900/30"
                  : "bg-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              <span className="material-symbols-outlined">menu_book</span>
              {t("selectVerse")}
              {!canSearchCustomVerse && <span className="material-symbols-outlined text-sm">lock</span>}
            </button>

            <div className="flex flex-col gap-2 pt-2">
              <p className="text-sm font-semibold text-amber-200 text-center mb-2">{t("verseOfDay")}</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleGenerateDevotional("YouVersion")}
                  disabled={isLoading || waitingForContent}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-3 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src="/images/bible-com.jpg"
                      alt="YouVersion Bible"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-blue-100">YouVersion</span>
                </button>
                <button
                  onClick={() => handleGenerateDevotional("Gateway")}
                  disabled={isLoading || waitingForContent}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-3 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                    <Image
                      src="/images/bible-gateway.png"
                      alt="Bible Gateway"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-blue-100">Gateway</span>
                </button>
                <button
                  onClick={() => handleGenerateDevotional("Olive Tree")}
                  disabled={isLoading || waitingForContent}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-3 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                    <Image
                      src="/images/olive-tree.jpg"
                      alt="Olive Tree"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-blue-100">Olive Tree</span>
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-blue-200/50">{t("personalized")}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
